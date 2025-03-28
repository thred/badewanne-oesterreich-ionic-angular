import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
    appId: "io.github.thred.badewanne",
    appName: "Badewanne Österreich",
    webDir: "www/browser",
    server: {
        androidScheme: "https",
    },
};

export default config;
