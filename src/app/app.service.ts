import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { Source } from "./source/source";
import { Reference } from "./station/reference";
import { StationService } from "./station/station.service";

@Injectable({
    providedIn: "root",
})
export class AppService {
    private readonly stationService = inject(StationService);
    private readonly router = inject(Router);

    async openStation(reference: Reference): Promise<void> {
        this.router.navigate([`/station/${reference.sourceKey}/${reference.stationKey}`]);
    }

    openStationList(): void {
        this.router.navigate(["/stations"]);
    }

    openSourceLink(sourceKey: string): void {
        const source: Source | undefined = this.stationService.findSource(sourceKey);

        if (source && source.link) {
            window.open(source.link, "_system");
        }
    }
}
