export interface TypedChange<T> {
    previousValue: T;
    currentValue: T;
    firstChange: boolean;
    isFirstChange(): boolean;
}

export type TypedChanges<T> = {
    [P in keyof T]?: TypedChange<T[P]>;
};

export interface OnTypedChanges<T> {
    ngOnChanges(changes: TypedChanges<T>): void;
}

export class Utils {
    static arrayDistinct<T>(arr: T[]): T[] {
        return arr.filter((value, index, self) => self.indexOf(value) === index);
    }

    static arrayRemove<T>(arr: T[], item: T): T[] {
        let i = 0;

        while (i < arr.length) {
            if (arr[i] === item) {
                arr.splice(i, 1);
            } else {
                ++i;
            }
        }

        return arr;
    }

    static arrayRemoveIf<T>(arr: T[], predicate: (item: T, index: number) => boolean): T[] {
        let i = 0;

        while (i < arr.length) {
            if (predicate(arr[i], i)) {
                arr.splice(i, 1);
            } else {
                ++i;
            }
        }

        return arr;
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
}

declare global {
    interface Array<T> {
        distinct(): Array<T>;

        remove(item: T): Array<T>;

        removeIf(predicate: (item: T, index: number) => boolean): Array<T>;
    }
}

Array.prototype.distinct = function () {
    return Utils.arrayDistinct(this);
};

Array.prototype.remove = function (item) {
    return Utils.arrayRemove(this, item);
};

Array.prototype.removeIf = function (predicate: (item: any, index: number) => boolean) {
    return Utils.arrayRemoveIf(this, predicate);
};
