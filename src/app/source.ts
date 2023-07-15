import { Reference } from "./reference";
import { Station } from "./station";

export abstract class Source {
    abstract get name(): string;

    abstract get disclaimer(): string;

    abstract get link(): string;

    abstract getReferences(): Promise<Reference[]>;

    abstract getStation(name?: string, site?: string): Promise<Station>;
}
