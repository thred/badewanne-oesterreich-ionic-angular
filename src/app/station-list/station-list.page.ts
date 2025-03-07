import { Component, inject } from "@angular/core";
import { Reference } from "../reference";
import { AppService } from "../app.service";

@Component({
    selector: "app-stations",
    templateUrl: "./station-list.page.html",
    styleUrls: ["./station-list.page.scss"],
    standalone: false
})
export class StationsPage {
    private readonly appService = inject(AppService);

    get references(): Reference[] {
        return this.appService.references;
    }

    openStation(reference: Reference): void {
        this.appService.openStation(reference);
    }
}
