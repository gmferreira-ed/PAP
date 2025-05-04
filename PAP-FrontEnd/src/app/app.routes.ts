import { Routes } from '@angular/router';
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
import { DashboardPage } from './Pages/Dashboard/dashboard.page';
import { ReceiptsPage } from './Pages/Receipts/receipts.page';


export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'users', component: UsersPage, canActivate: [PageAuthGuard] },
    { path: 'menu', component: MenuPage, canActivate: [PageAuthGuard] },

    { path: 'dashboard', component: DashboardPage, canActivate: [PageAuthGuard] },
    { path: 'receipts', component: ReceiptsPage, canActivate: [PageAuthGuard] },

    { path: 'settings', component: SettingsPage, canActivate: [PageAuthGuard] },
    { path: 'calendar', component: CalendarPage, canActivate: [PageAuthGuard] },
    { path: 'finances', component: FinancesPage, canActivate: [PageAuthGuard] },
    { path: 'stocks', component: StocksPage, canActivate: [PageAuthGuard] },

    { path: 'login', component: LoginPage, canActivate: [PageAuthGuard], data: { NoLogin: true } },
    { path: 'register', component: RegisterPage, canActivate: [PageAuthGuard], data: { NoLogin: true } },


    { path: 'profile/', component: ProfilePage, canActivate: [PageAuthGuard] },
    { path: 'profile/:username', component: ProfilePage, canActivate: [PageAuthGuard] },
];
