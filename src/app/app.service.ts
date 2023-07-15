import { Injectable } from "@angular/core";
import { Reference } from "./reference";
import { StationService } from "./station.service";
import { Station } from "./station";
import { Router } from "@angular/router";
import { Source } from "./source";
import { Storage } from "@ionic/storage-angular";

@Injectable({
    providedIn: "root",
})
export class AppService {
    private storage?: Storage;

    private _reference?: Reference;

    get reference(): Reference | undefined {
        return this._reference;
    }

    get references(): Reference[] {
        return this.stationService.references;
    }

    private _station?: Station;

    get station(): Station | undefined {
        return this._station;
    }

    constructor(private readonly stationService: StationService, storage: Storage, private readonly router: Router) {
        storage.create().then(async (storage) => {
            this.storage = storage;

            const referenceJson: string | undefined = await this.storage?.get("reference");

            if (referenceJson) {
                this._reference = JSON.parse(referenceJson);
                delete this._station;

                this._station = await this.stationService.getStation(
                    this._reference!.sourceName,
                    this._reference!.stationName,
                    this._reference!.stationSite
                );
            }
        });

        this.refresh();
    }

    refresh(): void {
        this.stationService.refresh();
    }

    async openStation(reference: Reference): Promise<void> {
        this._reference = reference;

        this.storage?.set("reference", JSON.stringify(reference));

        delete this._station;

        this.router.navigate(["/station"]);

        this._station = await this.stationService.getStation(
            reference.sourceName,
            reference.stationName,
            reference.stationSite
        );
    }

    openStationList(): void {
        this.router.navigate(["/stations"]);
    }

    openSourceLink(sourceName: string): void {
        const source: Source | undefined = this.stationService.findSource(sourceName);

        if (source && source.link) {
            window.open(source.link, "_system");
        }
    }
}
