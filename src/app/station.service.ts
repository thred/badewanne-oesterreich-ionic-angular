import { Injectable } from "@angular/core";
import { Source } from "./source";
import { SourceOoeGvMock } from "./source-ooe-gv-mock";
import { Station } from "./station";
import { Reference } from "./reference";
import { Subject } from "rxjs";
import { SourceOoeGv } from "./source-ooe-gv";

@Injectable({
    providedIn: "root",
})
export class StationService {
    //private readonly sources: Source[] = [new SourceOoeGvMock()];
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
                0
        );

        this.references$.next(this.references);
    }

    async getStation(sourceName: string, stationName?: string, siteName?: string): Promise<Station> {
        const source: Source = this.findSource(sourceName);

        return source.getStation(stationName, siteName);
    }
}
