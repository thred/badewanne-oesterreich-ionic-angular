import { Reference } from "../station/reference";
import { Station } from "../station/station";

export interface Source {
    get key(): string;

    get name(): string;

    get disclaimer(): string;

    get link(): string;

    getReferences(): Promise<Reference[]>;

    getStation(key: string): Promise<Station>;
}
