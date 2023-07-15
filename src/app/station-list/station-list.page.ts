import { Component } from "@angular/core";
import { Reference } from "../reference";
import { AppService } from "../app.service";

@Component({
    selector: "app-stations",
    templateUrl: "./station-list.page.html",
    styleUrls: ["./station-list.page.scss"],
})
export class StationsPage {
    get references(): Reference[] {
        return this.appService.references;
    }

    constructor(private readonly appService: AppService) {}

    openStation(reference: Reference): void {
        this.appService.openStation(reference);
    }
}
