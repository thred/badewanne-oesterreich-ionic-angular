import { Component, computed, inject } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { AppService } from "../app.service";
import { Reference } from "../station/reference";
import { StationService } from "../station/station.service";

@Component({
    selector: "app-station-list-page",
    templateUrl: "./station-list-page.component.html",
    styleUrls: ["./station-list-page.component.scss"],
    imports: [IonicModule],
})
export class StationListPageComponent {
    private readonly appService = inject(AppService);
    private readonly stationService = inject(StationService);

    readonly references = computed(() => {
        const referenceMap = this.stationService.referenceMap();
        const references = Object.values(referenceMap);

        references.sort((a, b) => a.label.localeCompare(b.label) || a.site.localeCompare(b.site));

        return references;
    });

    openStation(reference: Reference): void {
        this.appService.openStation(reference);
    }
}
