import { Component, computed, inject, input, output } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { StationError, StationService } from "../station/station.service";

@Component({
    selector: "app-error-list",
    templateUrl: "./error-list.component.html",
    styleUrls: ["./error-list.component.scss"],
    imports: [IonicModule],
})
export class ErrorListComponent {
    private readonly stationService = inject(StationService);

    readonly errors = computed(() => this.stationService.errors().slice(0, this.maxErrors()));

    readonly maxErrors = input(3);

    readonly refresh = output<StationError>();
}
