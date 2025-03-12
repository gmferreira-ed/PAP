import { Routes } from '@angular/router';
import { HomePage } from './Pages/Home/home.page';
import { UsersPage } from './Pages/Users/users.page';
import { MenuPage } from './Pages/Menu/menu.page';
import { SettingsPage } from './Pages/Settings/settings.page';
import { CalendarPage } from './Pages/Calendar/calendar.page';
import { FinancesPage } from './Pages/Finances/finances.page';
import { StocksPage } from './Pages/Stock/stocks.page';
import { ProfilePage } from './Pages/Profile/profile.page';
import { LoginPage } from './Pages/Login/login.page';
import { RegisterPage } from './Pages/Register/register.page';


export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomePage },
    { path: 'users', component: UsersPage },
    { path: 'menu', component: MenuPage },

    { path: 'profile', component: ProfilePage },
    { path: 'login', component: LoginPage },
    { path: 'register', component: RegisterPage },

    { path: 'settings', component: SettingsPage },
    { path: 'calendar', component: CalendarPage },
    { path: 'finances', component: FinancesPage },
    { path: 'stocks', component: StocksPage },
];
