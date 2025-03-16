import { Component, computed, inject } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { AppService } from "../app.service";
import { Station } from "../station/station";
import { StationService } from "../station/station.service";
import { ThermometerComponent } from "../thermometer/thermometer.component";
import { promisedSignal } from "../utils/pomised.signal";
import { routeParamSignal } from "../utils/route-param.signal";
import { Utils } from "../utils/utils";

@Component({
    selector: "app-station-page",
    templateUrl: "./station-page.component.html",
    styleUrls: ["./station-page.component.scss"],
    imports: [IonicModule, ThermometerComponent],
})
export class StationPageComponent {
    private readonly appService = inject(AppService);
    private readonly stationService = inject(StationService);

    readonly sourceKey = routeParamSignal<string | undefined>("sourceKey");

    readonly stationKey = routeParamSignal<string | undefined>("stationKey");

    readonly station = promisedSignal<Station | undefined>(() => {
        const sourceKey = this.sourceKey();
        const stationKey = this.stationKey();

        if (!sourceKey || !stationKey) {
            return undefined;
        }

        return this.stationService.getStation(sourceKey, stationKey);
    });

    readonly loading = computed(() => this.station() === undefined);

    get passedSince(): string {
        const date: Date | undefined = this.station()?.measuredAt;

        return date ? Utils.passedSince(date) : "keine aktuellen Daten vorhanden";
    }

    openStationList(): void {
        this.appService.openStationList();
    }

    openSourceLink(): void {
        const station = this.station();

        if (station) {
            this.appService.openSourceLink(station.sourceKey);
        }
    }
}
