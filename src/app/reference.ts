export class Reference {
    get key(): string {
        return `${this.stationName};${this.stationSite};${this.sourceName}`;
    }

    constructor(
        readonly sourceName: string,
        readonly stationName: string | undefined,
        readonly stationSite: string | undefined,
        readonly temperature: number | undefined
    ) {}
}
