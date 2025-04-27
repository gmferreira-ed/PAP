import { isDevMode } from '@angular/core';

export class AppSettings {
    static HostURL = "http://localhost:3000/"
    static APIUrl = this.HostURL+"api/"
    static RequestDelay = false && isDevMode() ? 1 : 0
}