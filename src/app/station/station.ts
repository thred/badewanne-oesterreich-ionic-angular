import { Reference } from "./reference";
import { Sample } from "./sample";

export class Station extends Reference {
    constructor(
        sourceKey: string,
        sourceName: string,
        stationKey: string,
        stationName: string | undefined,
        stationSite: string | undefined,
        temperature: number | undefined,
        measuredAt: Date | undefined,
        readonly samples: Sample[],
        polledAt: Date | undefined,
        error: string | undefined,
    ) {
        super(sourceKey, sourceName, stationKey, stationName, stationSite, temperature, measuredAt, polledAt, error);
    }
}
