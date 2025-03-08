import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Reference } from "./reference";
import { Source } from "./source";
import { SourceOoeGv } from "./source-ooe-gv";
import { Station } from "./station";

@Injectable({
    providedIn: "root",
})
export class StationService {
    // private readonly sources: Source[] = [new SourceOoeGvMock()];
    private readonly sources: Source[] = [new SourceOoeGv()];

    readonly references: Reference[] = [];

    private readonly references$: Subject<Reference[]> = new Subject();

    constructor() {}

    findSource(sourceName: string): Source {
        const source: Source | undefined = this.sources.filter((source) => source.name === sourceName)[0];

        if (!source) {
            throw new Error(`Unknown source: ${sourceName}`);
        }

        return source;
    }

    refresh(): void {
        this.sources.forEach((source) => this.refreshSource(source));
    }

    protected async refreshSource(source: Source) {
        const references: Reference[] = await source.getReferences();

        this.references.removeIf((reference) => reference.sourceName === source.name);
        this.references.push(...references);
        this.references.sort(
            (a, b) =>
                a.stationName?.localeCompare(b?.stationName ?? "") ||
                a.stationSite?.localeCompare(b?.stationSite ?? "") ||
                0,
        );

        this.references$.next(this.references);
    }

    async getStation(sourceName: string, stationName?: string, siteName?: string): Promise<Station> {
        const source: Source = this.findSource(sourceName);

        return source.getStation(stationName, siteName);
    }
}
