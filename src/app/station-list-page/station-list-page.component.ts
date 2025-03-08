import { Component, inject } from "@angular/core";
import { AppService } from "../app.service";
import { Reference } from "../reference";
import { IonicModule } from "@ionic/angular";

@Component({
    selector: "app-station-list-page",
    templateUrl: "./station-list-page.component.html",
    styleUrls: ["./station-list-page.component.scss"],
    imports: [IonicModule],
})
export class StationListPageComponent {
    private readonly appService = inject(AppService);

    get references(): Reference[] {
        return this.appService.references;
    }

    openStation(reference: Reference): void {
        this.appService.openStation(reference);
    }
}
