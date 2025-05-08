import { inject, Injectable, signal } from '@angular/core';
import { NzConfigService } from 'ng-zorro-antd/core/config';


type NzThemes = 'light' | 'dark'

interface Theme {
    DisplayName: string;
    Image: string;
    Key: NzThemes;
}

const Themes: Record<NzThemes, Theme> = {
    light: {
        DisplayName: 'Light',
        Image: 'Images/LightTheme',
        Key: 'light',
    },
    dark: {
        DisplayName: 'Dark',
        Image: 'Images/DarkTheme',
        Key: 'dark',
    },
};
@Injectable({
    providedIn: 'root',
})

export class ThemeService {

    Theme = signal<NzThemes>('light');
    private nzConfigService = inject(NzConfigService);
    Themes = Themes

    LanguageInfo = {
        'cs': 'cz',
        'da': 'dk',
        'de': 'de',
        'el': 'gr',
        'en': 'us',
        'es': 'es',
        'fi': 'fi',
        'fr': 'fr',
        'hi': 'in',
        'hu': 'hu',
        'it': 'it',
        'ja': 'jp',
        'ko': 'kr',
        'nl': 'nl',
        'no': 'no',
        'pl': 'pl',
        'pt-br': 'br',
        'pt-pt': 'pt',
        'ro': 'ro',
        'ru': 'ru',
        'sv': 'se',
        'tr': 'tr',
        'uk': 'ua',
        'vi': 'vn',
        'zh': 'cn',
        'zh-tw': 'tw'
    };

    Languages = Object.keys(this.LanguageInfo)
    Countries = Object.values(this.LanguageInfo)

    constructor() {
        const savedTheme = localStorage.getItem('theme') as NzThemes
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            this.setTheme('light');
        }
    }

    setTheme(theme: NzThemes) {
        this.Theme.set(theme)
        document.body.classList.remove('theme-light', 'theme-dark');

        //this.nzConfigService.set('theme', { infoColor: '#1890ff' })

        document.body.classList.add('theme-' + this.Theme());
        localStorage.setItem('theme', theme);
    }

    ToggleTheme() {
        if (this.Theme() == 'light') {
            this.setTheme('dark')
        } else {
            this.setTheme('light')

        }
    }
}
