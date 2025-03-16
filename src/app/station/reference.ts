export interface SerializedReference {
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

export class Reference {
    static read(data: SerializedReference): Reference {
        return new Reference(
            data.sourceKey,
            data.sourceName,
            data.stationKey,
            data.stationName,
            data.stationSite,
            data.temperature,
            data.measuredAt ? new Date(data.measuredAt) : undefined,
            data.polledAt ? new Date(data.polledAt) : undefined,
            data.error,
        );
    }

    get combinedKey(): string {
        return `${this.sourceKey}:${this.stationKey}`;
    }

    get label(): string {
        return this.stationName ?? this.stationKey ?? "Unknown";
    }

    get site(): string {
        return this.stationSite ?? "";
    }

    constructor(
        readonly sourceKey: string,
        readonly sourceName: string,
        readonly stationKey: string,
        readonly stationName: string | undefined,
        readonly stationSite: string | undefined,
        readonly temperature: number | undefined,
        readonly measuredAt: Date | undefined,
        readonly polledAt: Date | undefined,
        readonly error: string | undefined,
    ) {}

    updated(reference: Reference): Reference {
        return new Reference(
            reference.sourceKey ?? this.sourceKey,
            reference.sourceName ?? this.sourceName,
            reference.stationKey ?? this.stationKey,
            reference.stationName ?? this.stationName,
            reference.stationSite ?? this.stationSite,
            reference.temperature ?? this.temperature,
            reference.measuredAt ?? this.measuredAt,
            reference.polledAt ?? this.polledAt,
            reference.error,
        );
    }

    write(): SerializedReference {
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
}
