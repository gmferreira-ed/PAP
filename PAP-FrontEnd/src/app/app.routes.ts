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
import { PageAuthGuard } from './Services/Page-Auth.guard';


export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomePage, canActivate: [PageAuthGuard] },
    { path: 'users', component: UsersPage, canActivate: [PageAuthGuard] },
    { path: 'menu', component: MenuPage, canActivate: [PageAuthGuard] },

    { path: 'settings', component: SettingsPage, canActivate: [PageAuthGuard] },
    { path: 'calendar', component: CalendarPage, canActivate: [PageAuthGuard] },
    { path: 'finances', component: FinancesPage, canActivate: [PageAuthGuard] },
    { path: 'stocks', component: StocksPage, canActivate: [PageAuthGuard] },

    { path: 'login', component: LoginPage, canActivate: [PageAuthGuard], data: { NoLogin: true } },
    { path: 'register', component: RegisterPage, canActivate: [PageAuthGuard], data: { NoLogin: true } },


    { path: 'profile/', component: ProfilePage, canActivate: [PageAuthGuard] },
    { path: 'profile/:user', component: ProfilePage, canActivate: [PageAuthGuard] },
];
