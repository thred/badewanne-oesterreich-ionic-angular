import { Injectable, inject } from "@angular/core";
import { NavController } from "@ionic/angular/standalone";
import { Source } from "./source/source";
import { StationService } from "./station/station.service";

type NavDirection = "forward" | "backward" | "instant";

@Injectable()
export class AppService {
    private readonly stationService = inject(StationService);
    private readonly navController = inject(NavController);

    navigateToStation(sourceKey: string, stationKey: string, direction: NavDirection = "forward"): Promise<boolean> {
        const url = `/station/${sourceKey}/${stationKey}`;

        return this.navigate(url, direction);
    }

    navigateToStationList(direction: NavDirection = "forward"): Promise<boolean> {
        return this.navigate("/stations", direction);
    }

    navigate(url: string, direction: NavDirection = "forward"): Promise<boolean> {
        switch (direction) {
            case "backward":
                return this.navController.navigateBack(url);

            case "forward":
                return this.navController.navigateForward(url);

            case "instant":
                return this.navController.navigateRoot(url, { animated: false });

            default:
                throw new Error(`Unsupported navigation direction: ${direction}`);
        }
    }

    openSourceLink(sourceKey: string): void {
        const source: Source | undefined = this.stationService.findSource(sourceKey);

        if (source && source.link) {
            window.open(source.link, "_system");
        }
    }
}
