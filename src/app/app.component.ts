import { Component, inject } from "@angular/core";
import { IonApp, IonRouterOutlet } from "@ionic/angular/standalone";
import { Storage } from "@ionic/storage-angular";
import { AppService } from "./app.service";
import { StationService } from "./station/station.service";

@Component({
    selector: "app-root",
    templateUrl: "app.component.html",
    styleUrls: ["app.component.scss"],
    imports: [IonApp, IonRouterOutlet],
    providers: [StationService, AppService, Storage],
})
export class AppComponent {
    private readonly stationService = inject(StationService);

    ngOnInit(): void {
        setInterval(() => this.stationService.refreshAll(), StationService.REFRESH_MILLIS);
    }
}
