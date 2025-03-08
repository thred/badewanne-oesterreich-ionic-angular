import { Component, OnInit, inject } from "@angular/core";
import { AppService } from "../app.service";
import { Reference } from "../reference";
import { Station } from "../station";
import { Utils } from "../utils";
import { IonicModule } from "@ionic/angular";
import { ThermometerComponent } from "../thermometer/thermometer.component";

@Component({
    selector: "app-station-page",
    templateUrl: "./station-page.component.html",
    styleUrls: ["./station-page.component.scss"],
    imports: [IonicModule, ThermometerComponent],
})
export class StationPageComponent implements OnInit {
    private readonly appService = inject(AppService);

    get reference(): Reference | undefined {
        return this.appService.reference;
    }

    get station(): Station | undefined {
        return this.appService.station;
    }

    get passedSince(): string {
        const date: Date | undefined = this.station?.mostRecentSample?.date;

        return date ? Utils.passedSince(date) : "keine aktuellen Daten vorhanden";
    }

    ngOnInit(): void {
        // If loading of a station fails ...
        window.setTimeout(() => {
            if (!this.reference) {
                this.openStationList();
            }
        }, 2000);
    }

    openStationList(): void {
        this.appService.openStationList();
    }

    openSourceLink(): void {
        if (this.reference) {
            this.appService.openSourceLink(this.reference.sourceName);
        }
    }
}
