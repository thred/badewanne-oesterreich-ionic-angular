import { Sample } from "./sample";
import { Source } from "./source";

export class Station {
    get sourceName(): string {
        return this.source.name;
    }

    readonly refreshedAtDate: Date = new Date();

    readonly samples: Sample[];

    get mostRecentSample(): Sample | undefined {
        return this.samples[0];
    }

    get mostRecentTemperature(): number | undefined {
        return this.mostRecentSample?.temperature;
    }

    constructor(
        readonly name: string,
        readonly site: string,
        readonly source: Source,
        samples: Sample[],
        readonly nextRefreshAtTime: number,
        readonly error?: string
    ) {
        this.samples = samples.sort((a, b) => b.date.valueOf() - a.date.valueOf());
    }
}
