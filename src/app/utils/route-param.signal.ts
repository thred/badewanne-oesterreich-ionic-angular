import { inject, Signal, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";

export function routeParamSignal<T>(name: string): Signal<T | undefined> {
    const route = inject(ActivatedRoute);
    const sgnl = signal<T | undefined>(undefined);

    route.params.pipe(takeUntilDestroyed()).subscribe((params) => sgnl.set(params[name]));

    return sgnl;
}
