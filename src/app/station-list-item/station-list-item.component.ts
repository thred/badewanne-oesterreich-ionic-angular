import { Component, input, output } from "@angular/core";
import { IonIcon, IonItem, IonLabel, IonNote } from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { heart, heartOutline } from "ionicons/icons";
import { Station } from "../station/station";

@Component({
    selector: "app-station-list-item",
    templateUrl: "./station-list-item.component.html",
    styleUrls: ["./station-list-item.component.scss"],
    imports: [IonItem, IonLabel, IonNote, IonIcon],
})
export class StationListItemComponent {
    readonly station = input.required<Station>();

    readonly favorite = input(false);

    readonly toggleFavorite = output<Station>();

    readonly open = output<Station>();

    constructor() {
        addIcons({ heart, heartOutline });
    }
}
