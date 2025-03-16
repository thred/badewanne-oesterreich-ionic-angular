import { Injectable } from "@angular/core";
import { OoeGvSourceMock } from "../source/ooe-gv/ooe-gv-mock.source";
import { Source } from "../source/source";
import { persistentSignal } from "../utils/persistent.signal";
import { Utils } from "../utils/utils";
import { Reference, SerializedReference } from "./reference";
import { Station } from "./station";

type ReferenceMap = Record<string, Reference>;

type SerilaizedReferenceMap = Record<string, SerializedReference>;

@Injectable({
    providedIn: "root",
})
export class StationService {
    private readonly sources: Source[] = [new OoeGvSourceMock()];
    // private readonly sources: Source[] = [new SourceOoeGv()];

    readonly referenceMap = persistentSignal<ReferenceMap>("badewanne.references", () => ({}), {
        read: (json) => StationService.readReferenceMap(JSON.parse(json)),
        write: (obj) => JSON.stringify(StationService.writeReferenceMap(obj)),
    });

    refreshAll(): void {
        this.sources.forEach((source) =>
            source.getReferences().then(
                (references) => this.updateReferences(references),
                (err) => Utils.error(`Failed to get references from "${source.name}": ${err}`),
            ),
        );
    }

    getStation(sourceKey: string, stationKey: string): Promise<Station> | undefined {
        return this.findSource(sourceKey)?.getStation(stationKey);
    }

    findSource(sourceKey: string): Source | undefined {
        return this.sources.find((source) => source.key === sourceKey);
    }

    private updateReferences(references: Reference[]): void {
        const modifiedMap: ReferenceMap = {};

        for (const reference of references) {
            const key = reference.combinedKey;
            const existing = this.referenceMap()[key];
            const modified = existing?.updated(reference) ?? reference;

            modifiedMap[key] = modified;
        }

        this.referenceMap.update((oldMap) => ({ ...oldMap, ...modifiedMap }));
    }

    private static readReferenceMap(data: SerilaizedReferenceMap): ReferenceMap {
        const referenceMap: ReferenceMap = {};

        for (const key in data) {
            const reference = Reference.read(data[key]);

            referenceMap[key] = reference;
        }

        return referenceMap;
    }

    private static writeReferenceMap(data: ReferenceMap): SerilaizedReferenceMap {
        const referenceMap: SerilaizedReferenceMap = {};

        for (const key in data) {
            referenceMap[key] = data[key].write();
        }

        return referenceMap;
    }
}
