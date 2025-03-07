import { Component, OnInit, input } from "@angular/core";
import { OnTypedChanges, TypedChanges, Utils } from "../utils";
import { createAnimation } from "@ionic/angular";

@Component({
    selector: "app-thermometer",
    templateUrl: "./thermometer.component.html",
    styleUrls: ["./thermometer.component.scss"],
    standalone: false
})
export class ThermometerComponent implements OnInit, OnTypedChanges<ThermometerComponent> {
    readonly temperature = input<number>(0.0);

    currentTemperature: number = 0.0;

    animationStart?: number;

    readonly color = input<string>("white");

    readonly textColor = input<string>("#1884ae");

    constructor() {}

    ngOnInit() {}

    ngOnChanges(changes: TypedChanges<ThermometerComponent>): void {
        if (changes.temperature) {
            delete this.animationStart;
            requestAnimationFrame((t) => this.animate(t));
        }
    }

    animate(t: number): void {
        const dt = (t - (this.animationStart ?? t)) / 1000;
        this.animationStart = t;

        if (Math.abs(this.temperature() - this.currentTemperature) < 0.01) {
            this.currentTemperature = this.temperature();
        } else {
            this.currentTemperature = Utils.lerp(this.currentTemperature, this.temperature(), 2 * dt);
            requestAnimationFrame((t) => this.animate(t));
        }
    }
}
