import { Component, inject } from "@angular/core";
import { StationService } from "./station/station.service";

@Component({
    selector: "app-root",
    templateUrl: "app.component.html",
    styleUrls: ["app.component.scss"],
    standalone: false,
})
export class AppComponent {
    private readonly stationService = inject(StationService);

    ngOnInit(): void {
        setInterval(() => this.stationService.refreshAll(), StationService.REFRESH_MILLIS);
    }
}
