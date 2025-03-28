import { computed, Injectable, isDevMode, signal } from "@angular/core";
import { OoeGvSourceMock } from "../source/ooe-gv/ooe-gv-mock.source";
import { OoeGvSource } from "../source/ooe-gv/ooe-gv.source";
import { Source } from "../source/source";
import { persistedSignal } from "../utils/persisted.signal";
import { Utils } from "../utils/utils";
import { SerializedStation, Station } from "./station";

export interface StationError {
    sourceKey: string;
    sourceName: string;
    stationKey?: string;
    message: string;
}

@Injectable()
export class StationService {
    static readonly REFRESH_MILLIS = isDevMode() ? 1000 * 60 * 5 : 1000 * 60 * 15;

    private readonly sources: Source[] = isDevMode() ? [new OoeGvSourceMock()] : [new OoeGvSource()];

    private readonly cachedStations = persistedSignal.required<Record<string, Station>>(
        "badewanne.cached-stations",
        {},
        {
            read: (json) => StationService.readStations(JSON.parse(json)),
            write: (obj) => JSON.stringify(StationService.writeStations(obj)),
            onRead: (obj) => this.updateStations(Object.values(obj)),
        },
    );

    readonly stations = computed(() => Object.values(this.cachedStations()));

    private readonly cachedErrors = signal<StationError[]>([]);

    readonly errors = computed(() => this.cachedErrors());

    private refreshAllPromise?: Promise<void>;

    private updateStations(stations: Station[]): void {
        const modifiedStations: Record<string, Station> = {};

        for (const station of stations) {
            const key = station.combinedKey;
            const existingStation = this.cachedStations()[key];
            const modifiedStation = existingStation?.updated(station) ?? station;

            modifiedStations[key] = modifiedStation;
        }

        this.cachedStations.update((existingStations) => {
            // Remove historic stations
            for (const key in existingStations) {
                if (existingStations.hasOwnProperty(key)) {
                    const station = existingStations[key];

                    if (station.historic) {
                        delete existingStations[key];
                    }
                }
            }

            return { ...existingStations, ...modifiedStations };
        });
    }

    refreshAll(): Promise<void> {
        if (this.refreshAllPromise) {
            return this.refreshAllPromise;
        }

        return (this.refreshAllPromise = Promise.all(this.sources.map(async (source) => this.refresh(source.key)))
            .then(() => undefined)
            .finally(() => (this.refreshAllPromise = undefined)));
    }

    refresh(sourceKey: string): Promise<void> {
        const source = this.findSource(sourceKey);

        if (!source) {
            return Promise.reject(`Source "${sourceKey}" not found`);
        }

        this.cachedErrors.update((errors) => Utils.arrayRemoveIf(errors, (record) => record.sourceKey === source.key));

        return source.getAllStations().then(
            (stations) => this.updateStations(stations),
            (error) => {
                Utils.error(`Failed to get stations from "${sourceKey}": ${error}`);

                this.cachedErrors.update((errors) => {
                    return [
                        { sourceKey: source.key, sourceName: source.name, message: "Fehler beim Laden der Daten." },
                        ...errors,
                    ];
                });
            },
        );
    }

    refreshStation(sourceKey: string, stationKey: string): Promise<void> {
        const source = this.findSource(sourceKey);

        if (!source) {
            return Promise.reject(`Source "${sourceKey}" not found`);
        }

        this.cachedErrors.update((errors) => Utils.arrayRemoveIf(errors, (record) => record.sourceKey === source.key));

        return source.getStation(stationKey).then(
            (station) => this.updateStations([station]),
            (error) => {
                Utils.error(`Failed to get station "${stationKey}" from "${sourceKey}": ${error}`);

                this.cachedErrors.update((errors) => {
                    return [
                        {
                            sourceKey: source.key,
                            sourceName: source.name,
                            stationKey,
                            message: `Fehler beim Laden der Station "${stationKey}".`,
                        },
                        ...errors,
                    ];
                });
            },
        );
    }

    findStation(sourceKey: string, stationKey: string): Station | undefined {
        const key = Station.toCombinedKey(sourceKey, stationKey);

        return this.cachedStations()[key];
    }

    findSource(sourceKey: string): Source | undefined {
        return this.sources.find((source) => source.key === sourceKey);
    }

    private static readStations(data: Record<string, SerializedStation>): Record<string, Station> {
        const stations: Record<string, Station> = {};

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                stations[key] = Station.read(data[key]);
            }
        }

        return stations;
    }

    private static writeStations(stations: Record<string, Station>): Record<string, SerializedStation> {
        const serializedStations: Record<string, SerializedStation> = {};

        for (const key in stations) {
            if (stations.hasOwnProperty(key)) {
                serializedStations[key] = stations[key].write();
            }
        }

        return serializedStations;
    }
}
