import { isDevMode } from '@angular/core';

const APIPort = 7000

export class AppSettings {
    static get HostURL() {
        const { protocol, hostname } = window.location;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return `${protocol}//localhost:${APIPort}/`;
        }
        return `${protocol}//${hostname}:${APIPort}/`;
    }
    static get APIUrl() {
        return this.HostURL + "api/";
    }

    static get ImagesURL() {
        return this.APIUrl + 'images/';
    }
    static get UserImagesURL() {
        return this.ImagesURL + 'users/';
    }

    static RequestDelay = isDevMode() ? 0.5 : 0


    // Dynamic Settings
    static WorkHours = 8
    static WorkHourLimit = 10
    static PayPerHour = 8
    static MealAllowance = 6
    static ExtraPay = 10
    static ExtraPayMinuteRate = 30
}