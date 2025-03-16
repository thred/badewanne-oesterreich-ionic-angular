import { computed, effect, inject, linkedSignal, Signal, WritableSignal } from "@angular/core";
import { Storage } from "@ionic/storage-angular";
import { promisedSignal } from "./pomised.signal";
import { Utils } from "./utils";

export interface PersistentSignal<T> extends WritableSignal<T> {
    reset(): void;
    store(): void;
}

let globalStorage: Signal<Storage | undefined> | undefined = undefined;

/**
 * A signal, which is stored in the Ionic storage.
 *
 * @param key the key in the Ionic storage
 * @param create a function to create the initial state if none is available
 * @returns the persistent signal
 *
 * @author Manfred Hantschel
 */
export function persistentSignal<T>(
    key: string,
    create: () => T,
    opts?: {
        autoStore?: boolean;
        read?: (json: string) => T;
        write?: (obj: T) => string;
        validate?: (obj: T) => boolean;
    },
): PersistentSignal<T> {
    const storage = inject(Storage);

    if (!globalStorage) {
        globalStorage = promisedSignal(() => storage.create(), {
            failed: (err) => Utils.error("Failed to initialize the global storage", err),
        });
    }

    const read = opts?.read ?? ((json) => JSON.parse(json));
    const write = opts?.write ?? ((obj) => JSON.stringify(obj));
    const validate = opts?.validate ?? (() => true);
    const autoStore = opts?.autoStore ?? true;

    const storedValue = promisedSignal(() => globalStorage!()?.get(key));

    const readValue = computed<T>(() => {
        const value = storedValue();

        if (value !== null && value !== undefined) {
            try {
                const obj = read(value);

                if (validate(obj)) {
                    return obj;
                }
            } catch (error) {
                Utils.error(`Failed to read "${key}" from the storage.`, error);
            }
        }

        return create();
    });

    function store(value: T): void {
        const storage = globalStorage!();

        if (storage === undefined) {
            return;
        }

        if (value === null || value === undefined) {
            storage.remove(key);
        } else {
            storage.set(key, write(value));
        }
    }

    const sgnl = linkedSignal<T>(() => readValue() ?? create());

    if (autoStore) {
        effect(() => {
            console.log("Storing", key, sgnl());
            return store(sgnl());
        });
    }

    return Object.assign(sgnl, {
        reset(): void {
            sgnl.set(create());
        },
        store(): void {
            store(sgnl());
        },
    });
}
