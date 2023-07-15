import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { ThermometerComponent } from "./thermometer/thermometer.component";
import { StationsPage } from "./station-list/station-list.page";
import { StationPage } from "./station/station.page";
import { IonicStorageModule } from "@ionic/storage-angular";

@NgModule({
    declarations: [AppComponent, StationPage, StationsPage, ThermometerComponent],
    imports: [BrowserModule, IonicModule.forRoot(), IonicStorageModule.forRoot(), AppRoutingModule],
    providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
    exports: [ThermometerComponent],
    bootstrap: [AppComponent],
})
export class AppModule {}
