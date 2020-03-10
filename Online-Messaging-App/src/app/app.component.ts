import { Component } from "@angular/core";

export interface ColorScheme {
    "primary-color": string;
    "secondary-color": string;
    "tertiary-color": string;
    "primary-text-color": string;
    "soft-black": string;
    "background-color": string;
    "element-color": string;
    "hover-color": string;
    "element-hover-color": string;
}

export const LightThemeColors: ColorScheme = {
    "primary-color": "#0060c6",
    "secondary-color": "#fb3640",
    "tertiary-color": "#ff7733",
    "primary-text-color": "#424242",
    "soft-black": "#424242",
    "background-color": "#f8f8f8",
    "element-color": "#ffffff",
    "hover-color": "#393939",
    "element-hover-color": "#f5f5f5"
};

export const DarkThemeColors: ColorScheme = {
    "primary-color": "#0060c6",
    "secondary-color": "#fb3640",
    "tertiary-color": "#ff7733",
    "primary-text-color": "#FFFFFF",
    "soft-black": "#424242",
    "background-color": "#181818",
    "element-color": "#282828",
    "hover-color": "#393939",
    "element-hover-color": "#3f3f3f"
};

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent {
    title = "Online-Messaging-App";

    constructor() {
        this.setInitialTheme();
    }

    private setInitialTheme(): void {
        document.documentElement.style.setProperty("--primary-color", LightThemeColors["primary-color"]);
        document.documentElement.style.setProperty("--secondary-color", LightThemeColors["secondary-color"]);
        document.documentElement.style.setProperty("--tertiary-color", LightThemeColors["tertiary-color"]);
        document.documentElement.style.setProperty("--primary-text-color", LightThemeColors["primary-text-color"]);
        document.documentElement.style.setProperty("--soft-black", LightThemeColors["soft-black"]);
        document.documentElement.style.setProperty("--background-color", LightThemeColors["background-color"]);
        document.documentElement.style.setProperty("--element-color", LightThemeColors["element-color"]);
        document.documentElement.style.setProperty("--hover-color", LightThemeColors["hover-color"]);
        document.documentElement.style.setProperty("--element-hover-color", LightThemeColors["element-hover-color"]);
    }
}
