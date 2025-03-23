import { computed, effect, inject, isSignal, linkedSignal, Signal, WritableSignal } from "@angular/core";
import { Storage } from "@ionic/storage-angular";
import { promisedSignal } from "./pomised.signal";
import { Utils } from "./utils";

export interface PersistedSignal<T> extends WritableSignal<T> {
    reset(): void;
    store(): void;
}

let globalStorage: Signal<Storage | undefined> | undefined = undefined;

interface PersistedSignalOpts<T> {
    read?: (serialized: string) => T;
    write?: (obj: T) => string;
    validate?: (obj: T) => boolean;
    onRead?: (obj: T) => void;
    autoStore?: boolean;
}

function requiredPersistedSignal<T>(
    key: string,
    initial: T | Signal<T>,
    opts?: PersistedSignalOpts<T>,
): PersistedSignal<T> {
    const storage = inject(Storage);

    if (!globalStorage) {
        globalStorage = promisedSignal(() => storage.create(), {
            error: (err) => Utils.error("Failed to initialize the global storage", err),
        });
    }

    const read = opts?.read ?? ((serialized: string) => JSON.parse(serialized));
    const write = opts?.write ?? ((obj) => JSON.stringify(obj));
    const validate = opts?.validate ?? (() => true);
    const onRead = opts?.onRead;
    const autoStore = opts?.autoStore ?? true;

    const storedValue = promisedSignal<string | null | undefined>(() => {
        const storage = globalStorage!();

        if (!storage) {
            return undefined;
        }

        return storage.get(key) ?? null;
    });

    const readValue = computed<T>(() => {
        const value = storedValue();

        if (value !== null && value !== undefined) {
            try {
                const obj = read(value);

                if (validate(obj)) {
                    if (onRead) {
                        window.setTimeout(() => onRead(obj), 0);
                    }

                    return obj;
                }
            } catch (error) {
                Utils.error(`Failed to read "${key}" from the storage.`, error);
            }
        }

        if (isSignal(initial)) {
            const obj = initial();

            if (onRead) {
                window.setTimeout(() => onRead(obj), 0);
            }

            return obj;
        }

        if (initial !== undefined) {
            return initial;
        }

        return value;
    });

    function store(value: T): void {
        const storage = globalStorage!();

        if (storage === undefined || value === undefined) {
            return;
        }

        if (value === null || value === undefined) {
            storage.remove(key);
        } else {
            storage.set(key, write(value));
        }
    }

    const sgnl = linkedSignal<T>(() => readValue());

    if (autoStore) {
        effect(() => store(sgnl()));
    }

    return Object.assign(sgnl, {
        reset(): void {
            if (isSignal(initial)) {
                sgnl.set(initial());
            } else if (initial !== undefined) {
                sgnl.set(initial);
            }
        },
        store(): void {
            store(sgnl());
        },
    });
}

function optionalPersistedSignal<T>(
    key: string,
    opts?: PersistedSignalOpts<T | undefined>,
): PersistedSignal<T | undefined> {
    return requiredPersistedSignal<T | undefined>(key, undefined, opts);
}

/**
 * A writable signal, which is stored in the Ionic storage. The value may be `undefined` to indicate, that the storage
 * has not been loaded, yet. By making it `required` and providing an initial value, the signal will be initialized with
 * the initial value, if the storage is not available.
 *
 * @param key the key in the Ionic storage
 * @returns the persistent signal
 *
 * @author Manfred Hantschel
 */
export const persistedSignal = Object.assign(optionalPersistedSignal, {
    required: <T>(key: string, initial: T, opts?: PersistedSignalOpts<T>) =>
        requiredPersistedSignal<T>(key, initial, opts),
});
