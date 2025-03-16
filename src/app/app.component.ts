import { Component, inject, OnInit } from "@angular/core";
import { StationService } from "./station/station.service";

@Component({
    selector: "app-root",
    templateUrl: "app.component.html",
    styleUrls: ["app.component.scss"],
    standalone: false,
})
export class AppComponent implements OnInit {
    private readonly stationService = inject(StationService);

    ngOnInit(): void {
        this.stationService.refreshAll();
    }
}
