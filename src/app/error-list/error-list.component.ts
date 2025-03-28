import { Component, computed, inject, input, output } from "@angular/core";
import { IonIcon, IonItem, IonLabel, IonList } from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { reload } from "ionicons/icons";
import { StationError, StationService } from "../station/station.service";

@Component({
    selector: "app-error-list",
    templateUrl: "./error-list.component.html",
    styleUrls: ["./error-list.component.scss"],
    imports: [IonList, IonItem, IonLabel, IonIcon],
})
export class ErrorListComponent {
    private readonly stationService = inject(StationService);

    readonly errors = computed(() => this.stationService.errors().slice(0, this.maxErrors()));

    readonly maxErrors = input(3);

    readonly refresh = output<StationError>();

    constructor() {
        addIcons({ reload });
    }
}
