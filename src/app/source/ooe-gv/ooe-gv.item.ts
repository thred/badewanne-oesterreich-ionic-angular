import { Sample } from "../../station/sample";

export class OoeGvItem {
    readonly samples: Sample[];

    get temperature(): number | undefined {
        return this.samples[0]?.temperature;
    }

    get measuredAt(): Date | undefined {
        return this.samples[0]?.measuredAt;
    }

    constructor(
        readonly key: string,
        readonly name: string,
        readonly site: string,
        samples: Sample[],
        readonly polledAt: Date,
        readonly error?: string,
    ) {
        this.samples = samples.sort((a, b) => b.measuredAt.valueOf() - a.measuredAt.valueOf());
    }
}
