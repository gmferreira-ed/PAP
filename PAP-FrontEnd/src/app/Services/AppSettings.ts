import { isDevMode } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpService } from './Http.service';
import LanguageInfo from './lang-info.json'
const APIPort = 7000

type LanguageDetails = {
    language_code: string;
    flag_code: string;
};


@Injectable({ providedIn: 'root' })
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

    static Languages = Object.keys(LanguageInfo)
    static LanguageInfo: { [key: string]: LanguageDetails } = LanguageInfo

    static WorkHours = 8
    static WorkHourLimit = 10
    static PayPerHour = 8
    static MealAllowance = 6
    static ExtraPay = 10
    static ExtraPayMinuteRate = 30
    static Currency = 'EUR'
    static City = ''
    static Contact = ''
    static TaxID = ''
    static Adress = ''
    static RestaurantName = ''
    static PostalCode = ''

    static async Load(): Promise<void> {

        let LoadedSettings = false
        let Attempts = 0

        while (!LoadedSettings) {

            Attempts += 1

            try {
                const SettingsRequest = await fetch(this.APIUrl + 'settings', {
                    credentials: 'include',
                })

                if (SettingsRequest.ok) {
                    const Settings = await SettingsRequest.json()
                    if (Settings) {
                        LoadedSettings = true

                        AppSettings.WorkHours = Settings.WorkHours
                        AppSettings.WorkHourLimit = Settings.WorkHourLimit
                        AppSettings.PayPerHour = Settings.PayPerHour
                        AppSettings.MealAllowance = Settings.MealAllowance
                        AppSettings.ExtraPay = Settings.ExtraPay
                        AppSettings.ExtraPayMinuteRate = Settings.ExtraPayMinuteRate
                        AppSettings.Currency = Settings.Currency
                        AppSettings.City = Settings.City
                        AppSettings.Contact = Settings.Contact
                        AppSettings.TaxID = Settings.TaxID
                        AppSettings.Adress = Settings.Adress
                        AppSettings.RestaurantName = Settings.RestaurantName
                        AppSettings.PostalCode = Settings.PostalCode
                    }
                    return
                }
            } catch (err) {
                console.error('Failed to load app settings, retrying', err)
            }

            if (Attempts >= 10) {
                alert('Failed to load app settings. You will continue with the defaults')
                break
            }

            await new Promise(resolve => setTimeout(resolve, 250));
        }

    }
}