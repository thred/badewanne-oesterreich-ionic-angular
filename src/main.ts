import { enableProdMode } from "@angular/core";

import { bootstrapApplication } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";
import { AppComponent } from "./app/app.component";
import { environment } from "./environments/environment";

import { provideRouter } from "@angular/router";
import { IonicRouteStrategy, provideIonicAngular } from "@ionic/angular/standalone";
import { routes } from "./app/app-routes";

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        provideIonicAngular({ mode: "ios" }),
        provideRouter(routes),
    ],
});
