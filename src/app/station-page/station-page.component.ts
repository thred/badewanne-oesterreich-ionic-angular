import { AfterViewInit, Component, computed, effect, inject, signal } from "@angular/core";
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonIcon,
    IonRefresher,
    IonSpinner,
    IonText,
    RefresherEventDetail,
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { menuOutline } from "ionicons/icons";
import { AppService } from "../app.service";
import { ErrorListComponent } from "../error-list/error-list.component";
import { StationService } from "../station/station.service";
import { ThermometerComponent } from "../thermometer/thermometer.component";
import { persistedSignal } from "../utils/persisted.signal";
import { routeParamSignal } from "../utils/route-param.signal";
import { Utils } from "../utils/utils";

@Component({
    selector: "app-station-page",
    templateUrl: "./station-page.component.html",
    styleUrls: ["./station-page.component.scss"],
    imports: [
        IonContent,
        IonRefresher,
        IonText,
        IonFab,
        IonFabButton,
        IonSpinner,
        IonIcon,
        ThermometerComponent,
        ErrorListComponent,
    ],
})
export class StationPageComponent implements AfterViewInit {
    private readonly appService = inject(AppService);
    private readonly stationService = inject(StationService);

    readonly sourceKey = routeParamSignal<string | undefined>("sourceKey");
    readonly stationKey = routeParamSignal<string | undefined>("stationKey");

    readonly persistedSourceKey = persistedSignal<string>("badewanne.sourceKey");
    readonly persistedStationKey = persistedSignal<string>("badewanne.stationKey");

    readonly station = computed(() => {
        const sourceKey = this.sourceKey();
        const stationKey = this.stationKey();

        if (!sourceKey || !stationKey) {
            return undefined;
        }

        return this.stationService.findStation(sourceKey, stationKey);
    });

    readonly loading = signal(false);

    readonly outdated = computed(() => this.station()?.outdated);

    get passedSince(): string {
        const date: Date | undefined = this.station()?.measuredAt;

        return date ? Utils.passedSince(date) : "keine aktuellen Daten vorhanden";
    }

    constructor() {
        addIcons({ menuOutline });

        // If the station is not set in the path, use the persisted values and redirect if necessary.
        effect(() => {
            const persistedSourceKey = this.persistedSourceKey();
            const persistedStationKey = this.persistedStationKey();

            if (persistedSourceKey === undefined || persistedStationKey === undefined) {
                return;
            }

            if (!this.sourceKey() || !this.stationKey()) {
                if (persistedSourceKey && persistedStationKey) {
                    // Redirect to the station page with the persisted values.
                    this.appService.navigateToStation(persistedSourceKey, persistedStationKey, "instant");
                } else {
                    // No previous values have been stored, redirect to the list.
                    this.appService.navigateToStationList("instant");
                }
            }
        });

        // Update the persisted values when the station changes.
        effect(() => {
            const station = this.station();

            if (station) {
                this.persistedSourceKey.set(station.sourceKey);
                this.persistedStationKey.set(station.stationKey);
            }
        });
    }

    ngAfterViewInit(): void {
        this.performRefresh();
    }

    openStationList(): void {
        this.appService.navigateToStationList();
    }

    openSourceLink(): void {
        const station = this.station();

        if (station) {
            this.appService.openSourceLink(station.sourceKey);
        }
    }

    async performRefresh(event?: CustomEvent<RefresherEventDetail>): Promise<void> {
        event?.detail.complete();

        const sourceKey = this.sourceKey();
        const stationKey = this.stationKey();

        if (!sourceKey || !stationKey) {
            return;
        }

        this.loading.set(true);

        try {
            await this.stationService.refreshStation(sourceKey, stationKey);
        } finally {
            this.loading.set(false);
        }
    }
}
