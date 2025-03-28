import { Routes } from "@angular/router";

export const routes: Routes = [
    {
        path: "stations",
        loadComponent: () =>
            import("./station-list-page/station-list-page.component").then((m) => m.StationListPageComponent),
    },
    {
        path: "station",
        loadComponent: () => import("./station-page/station-page.component").then((m) => m.StationPageComponent),
    },
    {
        path: "station/:sourceKey/:stationKey",
        loadComponent: () => import("./station-page/station-page.component").then((m) => m.StationPageComponent),
    },
    {
        path: "",
        redirectTo: "station",
        pathMatch: "full",
    },
];
