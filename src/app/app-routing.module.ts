import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";

const routes: Routes = [
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

@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
