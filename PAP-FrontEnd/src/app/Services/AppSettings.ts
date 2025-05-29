import { isDevMode } from '@angular/core';

export class AppSettings {
    static HostURL = "http://localhost:7000/"
    static APIUrl = this.HostURL+"api/"

    static ImagesURL = this.APIUrl+'images/'
    static UserImagesURL = this.ImagesURL+'users/'
    
    static RequestDelay = isDevMode() ? 0.5 : 0
}