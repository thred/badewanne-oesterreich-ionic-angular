import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { StationsPage } from "./station-list/station-list.page";
import { StationPage } from "./station/station.page";

const routes: Routes = [
    {
        path: "",
        redirectTo: "station",
        pathMatch: "full",
    },
    {
        path: "stations",
        component: StationsPage,
    },
    {
        path: "station",
        component: StationPage,
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
