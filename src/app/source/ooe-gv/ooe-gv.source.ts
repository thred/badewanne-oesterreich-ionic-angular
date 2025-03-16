import { Reference } from "src/app/station/reference";
import { Sample } from "src/app/station/sample";
import { Station } from "src/app/station/station";
import { Utils } from "../../utils/utils";
import { Source } from "../source";
import { OoeGvItem } from "./ooe-gv.item";

const url: string = "https://data.ooe.gv.at/files/hydro/HDOOE_Export_WT.zrxp";

export class OoeGvSource implements Source {
    private static readonly MINIMUM_POLLING_INTERVAL: number = 1000 * 60 * 5; // 5 minutes

    private polledAt: Date = new Date();
    private nextPollAtMillis: number = this.polledAt.getTime();
    private items?: Promise<OoeGvItem[]>;
    private error?: string;
    private loading: boolean = false;

    get key(): string {
        return "ooe-gv";
    }

    get name(): string {
        return "Hydrographischer Dienst Oberösterreich";
    }

    get disclaimer(): string {
        return "Datenquelle: Land Oberösterreich - data.ooe.gv.at";
    }

    get link(): string {
        return "https://e-gov.ooe.gv.at/at.gv.ooe.ogd2-citi/#/detail/586e08a5-1ca6-400b-b2e2-dfd8fd3f429d";
    }

    get minimumPollingInterval(): number {
        return OoeGvSource.MINIMUM_POLLING_INTERVAL;
    }

    async getReferences(): Promise<Reference[]> {
        const items = await this.getItems();

        return items.map(
            (item) =>
                new Reference(
                    this.key,
                    this.name,
                    item.key,
                    item.name,
                    item.site,
                    item.temperature,
                    item.measuredAt,
                    item.polledAt,
                    item.error,
                ),
        );
    }

    async getStation(key: string): Promise<Station> {
        const items = await this.getItems();
        const item = items.find((s) => s.key === key);

        if (item) {
            return new Station(
                this.key,
                this.name,
                item.key,
                item.name,
                item.site,
                item.temperature,
                item.measuredAt,
                item.samples,
                item.polledAt,
                item.error,
            );
        }

        let error = `The item "${key}" is missing in the data of "${this.name}".`;

        if (this.error) {
            error += ` ${this.error}`;
        }

        return new Station(
            this.key,
            this.name,
            key,
            undefined,
            undefined,
            undefined,
            undefined,
            [],
            this.polledAt,
            this.error,
        );
    }

    protected async getItems(): Promise<OoeGvItem[]> {
        const polledAt: Date = new Date();
        const polledAtMillis = polledAt.getTime();

        // Do not poll too often
        if (polledAtMillis < this.nextPollAtMillis && this.items) {
            return this.items;
        }

        this.polledAt = polledAt;
        this.nextPollAtMillis = polledAtMillis + this.minimumPollingInterval;
        this.error = undefined;

        this.items = new Promise(async (resolve) => {
            try {
                let binary: string = await this.fetchData();

                resolve(this.parse(binary, polledAt));
            } catch (error) {
                this.error = `${error}`;

                resolve([]);
            }
        });

        return this.items;
    }

    protected async fetchData(): Promise<string> {
        Utils.info(`Fetching ${url} ...`);

        const response: Response = await fetch(url);

        return await response.text();
    }

    protected parse(binary: string, polledAt: Date): OoeGvItem[] {
        const itemBinaries: string[] = binary
            .split("#ZRXPVERSION")
            .map((s) => s.trim())
            .filter((s) => s.length);

        return itemBinaries
            .map((itemBinary) => this.parseItem(itemBinary, polledAt))
            .filter((item) => item) as OoeGvItem[];
    }

    protected parseItem(itemBinary: string, polledAt: Date): OoeGvItem | undefined {
        const columns: string[] = itemBinary.split("|");

        let sourceIdColumn: string | undefined = columns.find((column) => column.startsWith("SOURCEID"));

        if (!sourceIdColumn) {
            Utils.warn(`SOURCEID is missing in: ${itemBinary.substring(0, 512)} ...`);

            sourceIdColumn = "SOURCEID";
        }

        let waterColumn: string | undefined = columns.find((column) => column.startsWith("SWATER"));

        if (!waterColumn) {
            Utils.warn(`SWATER is missing in: ${itemBinary.substring(0, 512)} ...`);

            waterColumn = "SWATER";
        }

        const siteColumn: string | undefined = columns.find((column) => column.startsWith("SNAME"));

        if (!siteColumn) {
            Utils.warn(`SNAME is missing in: ${itemBinary.substring(0, 512)} ...`);
            return undefined;
        }

        const water: string = this.sanitizeInvalidEncoding(waterColumn.substring("SWATER".length));
        const site: string = this.sanitizeInvalidEncoding(siteColumn.substring("SNAME".length));
        const samples: Sample[] = [];
        const temperatureColumn: string | undefined = columns.find((column) => column.match(/\d{14}\s\d/)?.length);

        if (!temperatureColumn) {
            //Utils.warn(`Temperatures are missing in: ${itemBinary.substring(0, 512)} ...`);
        } else {
            const lines: string[] = temperatureColumn
                .split(/\n/)
                .map((s) => s.trim())
                .filter((s) => s.length);

            for (const line of lines) {
                const token: string[] = line.split(" ");

                if (token.length !== 2 || token[0].length !== 14) {
                    Utils.warn(`Invalid line: ${line}`);
                    continue;
                }

                const date: Date = new Date();

                date.setUTCFullYear(parseInt(token[0].substring(0, 4)));
                date.setUTCMonth(parseInt(token[0].substring(4, 6)) - 1);
                date.setUTCDate(parseInt(token[0].substring(6, 8)));
                date.setUTCHours(parseInt(token[0].substring(8, 10)));
                date.setUTCMinutes(parseInt(token[0].substring(10, 12)));
                date.setUTCSeconds(parseInt(token[0].substring(12, 14)));

                // According to the documentation, it's MEZ+1 (no daylight saving)
                date.setTime(date.getTime() - 1000 * 60 * 60);

                const temperature: number = parseFloat(token[1]);

                if (!isNaN(temperature) && temperature > -20 && temperature < 100) {
                    samples.push({ measuredAt: date, temperature });
                }
            }
        }

        return new OoeGvItem(Utils.toKey(water, site), water, site, samples, polledAt);
    }

    /**
     * The reported encoding of the call and the actual encoding of the data are different. In fact, the encoding
     * seems to be lost earlier in the process, because the file contains invalid characters in multiple encodings.
     * This method tries to fix this for the most common cases.
     *
     * @param s the string to sanitize
     * @returns sanitized string
     */
    private sanitizeInvalidEncoding(s: string): string {
        s = s.replace("Ã¤", "ä");
        s = s.replace("Ã¶", "ö");
        s = s.replace("Ã¼", "ü");

        s = s.replace("V�ckla", "Vökla");
        s = s.replace("Gro�e", "Große");
        s = s.replace("M�hl", "Mühl");
        s = s.replace("m�hl", "mühl");
        s = s.replace("br�cke", "brücke");
        s = s.replace("Str�tting", "Strötting");
        s = s.replace("Hallst�tter", "Hallstätter");
        s = s.replace("Gr�nbach", "Grünbach");
        s = s.replace("Sch�rding", "Schärding");
        s = s.replace("Ro�leithen", "Roßleithen");
        s = s.replace("Raudaschls�ge", "Raudaschlsäge");
        s = s.replace("D�rre", "Dürre");
        s = s.replace("wei�enbach", "weißenbach");
        s = s.replace("K�nigswiesen", "Königswiesen");
        s = s.replace("Kremsm�nster", "Kremsmünster");
        s = s.replace("J�gerberg", "Jägerberg");
        s = s.replace("H�rsching", "Hörsching");
        s = s.replace("flu�", "fluß");
        s = s.replace("Gr�nau", "Grünau");
        s = s.replace("stra�e", "straße");
        s = s.replace("M�hring", "Möhring");
        s = s.replace("D�rnau", "Dürnau");
        s = s.replace("B�rglstein", "Bürglstein");
        s = s.replace("Bootsh�tte", "Bootshütte");
        s = s.replace("Wei�enbach", "Weißenbach");
        s = s.replace("Fu�g�ngersteg", "Fußgängersteg");

        return s;
    }
}
