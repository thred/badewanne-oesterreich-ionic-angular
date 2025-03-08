import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";

import { IonicStorageModule } from "@ionic/storage-angular";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { StationListPageComponent } from "./station-list-page/station-list-page.component";
import { StationPageComponent } from "./station-page/station-page.component";
import { ThermometerComponent } from "./thermometer/thermometer.component";

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        IonicStorageModule.forRoot(),
        AppRoutingModule,
        StationPageComponent,
        StationListPageComponent,
        ThermometerComponent,
    ],
    providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
    exports: [ThermometerComponent],
    bootstrap: [AppComponent],
})
export class AppModule {}
