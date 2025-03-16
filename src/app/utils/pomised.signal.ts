import { effect, Signal, signal } from "@angular/core";

export function promisedSignal<T>(
    computation: () => Promise<T> | undefined,
    opts?: {
        failed?: (error: any) => void;
    },
): Signal<T | undefined> {
    const sgnl = signal<T | undefined>(undefined);
    const failed = opts?.failed ?? ((error) => console.error(`Failed to get promised value: ${error}`));

    effect(async () => {
        const promise = computation();

        if (promise === undefined) {
            return;
        }

        promise.then(
            (value) => sgnl.set(value),
            (err) => failed(err),
        );
    });

    return sgnl;
}
