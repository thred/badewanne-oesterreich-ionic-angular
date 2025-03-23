import { Station } from "../station/station";

export interface Source {
    get key(): string;

    get name(): string;

    get disclaimer(): string;

    get link(): string;

    getAllStations(): Promise<Station[]>;

    getStation(key: string): Promise<Station>;
}
