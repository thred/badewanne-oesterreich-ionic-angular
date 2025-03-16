import { Component, input, signal } from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { Utils } from "../utils/utils";

@Component({
    selector: "app-thermometer",
    templateUrl: "./thermometer.component.html",
    styleUrls: ["./thermometer.component.scss"],
})
export class ThermometerComponent {
    readonly temperature = input<number>(0.0);

    private readonly temperature$ = toObservable(this.temperature);

    readonly color = input<string>("white");

    readonly textColor = input<string>("#1884ae");

    readonly currentTemperature = signal(0.0);

    private animationStart?: number;

    constructor() {
        this.temperature$.pipe(takeUntilDestroyed()).subscribe(() => {
            delete this.animationStart;
            requestAnimationFrame((t) => this.animate(t));
        });
    }

    animate(t: number): void {
        const dt = (t - (this.animationStart ?? t)) / 1000;
        this.animationStart = t;

        if (Math.abs(this.temperature() - this.currentTemperature()) < 0.01) {
            this.currentTemperature.set(this.temperature());
        } else {
            this.currentTemperature.update((ct) => Utils.lerp(ct, this.temperature(), 2 * dt));
            requestAnimationFrame((t) => this.animate(t));
        }
    }
}
