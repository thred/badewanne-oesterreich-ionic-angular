import { Component, OnInit, inject } from "@angular/core";
import { AppService } from "../app.service";
import { Reference } from "../reference";
import { Station } from "../station";
import { Utils } from "../utils";

@Component({
    selector: "app-station",
    templateUrl: "./station.page.html",
    styleUrls: ["./station.page.scss"],
    standalone: false
})
export class StationPage implements OnInit {
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
