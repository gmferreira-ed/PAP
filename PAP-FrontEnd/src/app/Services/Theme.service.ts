import { inject, Injectable, signal } from '@angular/core';
import { NzConfigService } from 'ng-zorro-antd/core/config';


type NzThemes = 'light'|'dark'
const Themes = {
    ['light']: {
        DisplayName: 'Light',
        Image: 'Images/LightTheme',

    },
    ['dark']: {
        DisplayName: 'Dark',
        Image: 'Images/DarkTheme',
    },
}

@Injectable({
    providedIn: 'root',
})

export class ThemeService {

    Theme = signal<NzThemes|string>('light');
    private nzConfigService = inject(NzConfigService);
    Themes = Themes

    constructor() {
        const savedTheme = localStorage.getItem('theme')  as NzThemes
        if (savedTheme) {
            this.setTheme(savedTheme);
        }
    }

    setTheme(theme: NzThemes|string) {
        this.Theme.set(theme)
        document.body.classList.remove('theme-light', 'theme-dark');

        //this.nzConfigService.set('theme', { infoColor: '#1890ff' })

        document.body.classList.add('theme-'+this.Theme());
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
