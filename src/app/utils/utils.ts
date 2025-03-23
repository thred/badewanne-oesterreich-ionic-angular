export class Utils {
    static toKey(...names: string[]): string {
        return names
            .map((name) => name.trim())
            .map((name) => name.toLowerCase())
            .map((name) => name.replace(/ä/g, "ae"))
            .map((name) => name.replace(/ö/g, "oe"))
            .map((name) => name.replace(/ü/g, "ue"))
            .map((name) => name.replace(/ß/g, "ss"))
            .map((name) => name.replace(/[^a-zA-Z0-9]/g, "-"))
            .join("-")
            .replace(/--+/g, "-")
            .replace(/^-+/, "")
            .replace(/-+$/, "");
    }

    static passedSince(date: Date | undefined, now: Date = new Date()): string {
        if (!date) {
            return "";
        }

        const minutesPassed: number = Math.round((now.valueOf() - date.valueOf()) / 1000 / 60);

        if (minutesPassed < 1) {
            return "gerade eben";
        }

        if (minutesPassed === 1) {
            return `vor einer Minute`;
        }

        if (minutesPassed < 45) {
            return `vor ${minutesPassed.toFixed(0)} Minuten`;
        }

        const daysAgo: number = this.totalDay(now) - this.totalDay(date);
        const hour: string = this.rightPad(date.getHours().toFixed(0));
        const minute: string = this.rightPad(date.getMinutes().toFixed(0));

        if (daysAgo === 0) {
            return `heute, um ${hour}:${minute} Uhr`;
        }

        if (daysAgo === 1) {
            return `gestern, um ${hour}:${minute} Uhr`;
        }

        return `vor ${daysAgo} Tagen, um ${hour}:${minute} Uhr`;
    }

    static rightPad(s: string, length: number = 2, c: string = "0"): string {
        if (s.length >= length) {
            return s;
        }

        return c.repeat((length - s.length) / c.length + 1).substring(0, length - s.length) + s;
    }

    static totalDay(date: Date): number {
        return Math.floor((date.valueOf() - new Date(2020, 0, 0).valueOf()) / 1000 / 60 / 60 / 24);
    }

    static error(message: string, ...optionalParams: any[]): void {
        console.error(`${new Date().toString()} | ${message}`, ...optionalParams);
    }

    static warn(message: string, ...optionalParams: any[]): void {
        console.warn(`${new Date().toString()} | ${message}`, ...optionalParams);
    }

    static info(message: string, ...optionalParams: any[]): void {
        console.info(`${new Date().toString()} | ${message}`, ...optionalParams);
    }

    static debug(message: string, ...optionalParams: any[]): void {
        console.debug(`${new Date().toString()} | ${message}`, ...optionalParams);
    }

    static lerp(a: number, b: number, alpha: number): number {
        return a + alpha * (b - a);
    }

    static arrayRemoveIf<T>(array: T[], predicate: (item: T) => boolean): T[] {
        const copy = [...array];
        let index = copy.findIndex(predicate);

        while (index >= 0) {
            copy.splice(index, 1);
            index = copy.findIndex(predicate);
        }

        return copy;
    }

    static recordRemoveByKey<T>(record: Record<string, T>, key: string): Record<string, T> {
        const copy = { ...record };

        delete copy[key];

        return copy;
    }

    static recordAdd<T>(record: Record<string, T>, key: string, value: T): Record<string, T> {
        return { ...record, [key]: value };
    }

    static recordToArray<T, U = { key: string; value: T }>(record: Record<string, T>): { key: string; value: T }[];
    static recordToArray<T, U>(record: Record<string, T>, mapper: (key: string, value: T) => U): U[];
    static recordToArray<T, U>(record: Record<string, T>, mapper?: (key: string, value: T) => U): U[] {
        return Object.entries(record).map(([key, value]) => (mapper ? mapper(key, value) : { key, value })) as U[];
    }
}
