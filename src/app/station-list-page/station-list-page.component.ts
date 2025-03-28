import { AfterViewInit, Component, computed, inject, signal } from "@angular/core";
import {
    IonContent,
    IonHeader,
    IonLabel,
    IonList,
    IonListHeader,
    IonProgressBar,
    IonRefresher,
    IonSearchbar,
    IonTitle,
    IonToolbar,
    RefresherEventDetail,
    SearchbarInputEventDetail,
    ToastController,
} from "@ionic/angular/standalone";
import { IonSearchbarCustomEvent } from "@ionic/core";
import { AppService } from "../app.service";
import { ErrorListComponent } from "../error-list/error-list.component";
import { StationListItemComponent } from "../station-list-item/station-list-item.component";
import { Station } from "../station/station";
import { StationService } from "../station/station.service";
import { persistedSignal } from "../utils/persisted.signal";

type Favoritable = {
    favorite?: boolean;
};

@Component({
    selector: "app-station-list-page",
    templateUrl: "./station-list-page.component.html",
    styleUrls: ["./station-list-page.component.scss"],
    imports: [
        IonHeader,
        IonContent,
        IonToolbar,
        IonTitle,
        IonSearchbar,
        IonProgressBar,
        IonRefresher,
        IonList,
        IonListHeader,
        IonLabel,
        StationListItemComponent,
        ErrorListComponent,
    ],
})
export class StationListPageComponent implements AfterViewInit {
    private readonly appService = inject(AppService);
    private readonly stationService = inject(StationService);
    private readonly toastController = inject(ToastController);

    readonly loading = signal(false);

    readonly filter = signal("");

    readonly favorites = persistedSignal<string[]>("badewanne.favorites");

    readonly stations = computed<(Station & Favoritable)[]>(() => {
        const stations: (Station & Favoritable)[] = this.stationService
            .stations()
            .filter((station) => station.matches(this.filter()));

        stations.sort((a, b) => a.label.localeCompare(b.label) || a.site.localeCompare(b.site));

        stations.forEach((station) => (station.favorite = this.favorites()?.includes(station.combinedKey)));

        return stations;
    });

    readonly favoriteStations = computed(() => this.stations().filter((station) => station.favorite));

    readonly otherStations = computed(() => this.stations().filter((station) => !station.favorite));

    ngAfterViewInit(): void {
        this.refreshAll();
    }

    async performRefreshAll(event?: CustomEvent<RefresherEventDetail>): Promise<void> {
        event?.detail.complete();

        this.refreshAll();
    }

    async performRefresh(sourceKey: string): Promise<void> {
        this.loading.set(true);

        try {
            await this.stationService.refresh(sourceKey);
        } finally {
            this.loading.set(false);
        }
    }

    private async refreshAll(): Promise<void> {
        this.loading.set(true);

        try {
            await this.stationService.refreshAll();
        } finally {
            this.loading.set(false);
        }
    }

    performSearch($event: IonSearchbarCustomEvent<SearchbarInputEventDetail>) {
        this.filter.set($event.detail.value ?? "");
    }

    toggleFavorite(station: Station): void {
        const key = station.combinedKey;

        if (this.favorites()?.includes(key)) {
            this.favorites.update((existing) => existing?.filter((k) => k !== key));

            this.toast(`"${station.name}" aus Favoriten entfernt.`);
        } else {
            this.favorites.update((existing) => [...(existing ?? []), key]);
            this.toast(`"${station.name}" zu Favoriten hinzugefügt.`);
        }
    }

    openStation(station: Station): void {
        this.appService.navigateToStation(station.sourceKey, station.stationKey, "backward");
    }

    private async toast(message: string, color: string = "primary"): Promise<void> {
        const toast = await this.toastController.create({
            message,
            duration: 3000,
            color,
        });

        await toast.present();
    }
}
