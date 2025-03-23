import { isDevMode } from "@angular/core";
import { Sample } from "./sample";

export interface SerializedStation {
    sourceKey: string;
    sourceName: string;
    stationKey: string;
    stationName: string | undefined;
    stationSite: string | undefined;
    temperature: number | undefined;
    measuredAt: string | undefined;
    polledAt: string | undefined;
    error: string | undefined;
}

export class Station {
    static readonly OUTDATED_MILLIS = isDevMode() ? 1000 * 30 : 1000 * 60 * 60 * 4;
    static readonly HISTORIC_MILLIS = 1000 * 60 * 60 * 24 * 7;

    static read(data: SerializedStation): Station {
        return new Station(
            data.sourceKey,
            data.sourceName,
            data.stationKey,
            data.stationName,
            data.stationSite,
            data.temperature,
            data.measuredAt ? new Date(data.measuredAt) : undefined,
            [],
            data.polledAt ? new Date(data.polledAt) : undefined,
            data.error,
        );
    }

    static unknownSource(sourceKey: string, stationKey: string): Station {
        return new Station(
            sourceKey,
            "Unbekannte Quelle",
            stationKey,
            "Unbekannte Station",
            undefined,
            undefined,
            undefined,
            [],
            new Date(),
            "Die Quelle für diesen Datensatz ist unbekannt.",
        );
    }

    static unknownStation(sourceKey: string, sourceName: string, stationKey: string, error?: string): Station {
        return new Station(
            sourceKey,
            sourceName,
            stationKey,
            "Unbekannte Station",
            stationKey,
            undefined,
            undefined,
            [],
            new Date(),
            error ?? "Die Station ist unbekannt.",
        );
    }

    get combinedKey(): string {
        return Station.toCombinedKey(this.sourceKey, this.stationKey);
    }

    get label(): string {
        return this.stationName ?? this.stationKey ?? "Unknown";
    }

    get site(): string {
        return this.stationSite ?? "";
    }

    get name(): string {
        let name = this.label;

        if (this.stationSite) {
            name += ` / ${this.stationSite}`;
        }

        return name;
    }

    get outdated(): boolean {
        return this.polledAt ? this.polledAt.getTime() < Date.now() - Station.OUTDATED_MILLIS : true;
    }

    get historic(): boolean {
        return this.measuredAt ? this.measuredAt.getTime() < Date.now() - Station.HISTORIC_MILLIS : true;
    }

    constructor(
        readonly sourceKey: string,
        readonly sourceName: string,
        readonly stationKey: string,
        readonly stationName: string | undefined,
        readonly stationSite: string | undefined,
        readonly temperature: number | undefined,
        readonly measuredAt: Date | undefined,
        readonly samples: Sample[],
        readonly polledAt: Date | undefined,
        readonly error: string | undefined,
    ) {}

    updated(station: Station): Station {
        return new Station(
            station.sourceKey ?? this.sourceKey,
            station.sourceName ?? this.sourceName,
            station.stationKey ?? this.stationKey,
            station.stationName ?? this.stationName,
            station.stationSite ?? this.stationSite,
            station.temperature ?? this.temperature,
            station.measuredAt ?? this.measuredAt,
            station.samples ?? this.samples,
            station.polledAt ?? this.polledAt,
            station.error,
        );
    }

    write(): SerializedStation {
        return {
            sourceKey: this.sourceKey,
            sourceName: this.sourceName,
            stationKey: this.stationKey,
            stationName: this.stationName,
            stationSite: this.stationSite,
            temperature: this.temperature,
            measuredAt: this.measuredAt?.toISOString(),
            polledAt: this.polledAt?.toISOString(),
            error: this.error,
        };
    }

    matches(filter: string): boolean {
        filter = filter.toLowerCase();

        return (
            this.stationName?.toLowerCase().includes(filter) ||
            this.stationSite?.toLowerCase().includes(filter) ||
            false
        );
    }

    static toCombinedKey(sourceKey: string, stationKey: string): string {
        return `${sourceKey}:${stationKey}`;
    }
}
