import { Component, input, output } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { Station } from "../station/station";

@Component({
    selector: "app-station-list-item",
    templateUrl: "./station-list-item.component.html",
    styleUrls: ["./station-list-item.component.scss"],
    imports: [IonicModule],
})
export class StationListItemComponent {
    readonly station = input.required<Station>();

    readonly favorite = input(false);

    readonly toggleFavorite = output<Station>();

    readonly open = output<Station>();
}
