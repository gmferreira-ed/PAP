import { Routes } from '@angular/router';
import { UsersPage } from './Pages/Users/users.page';
import { MenuPage } from './Pages/Menu/menu.page';
import { SettingsPage } from './Pages/Settings/settings.page';
import { StocksPage } from './Pages/Stocks/stocks.page';
import { ProfilePage } from './Pages/Profile/profile.page';
import { LoginPage } from './Pages/Login/login.page';
import { RegisterPage } from './Pages/Register/register.page';
import { PageAuthGuard } from './Services/Page-Auth.guard';
import { DashboardPage } from './Pages/Dashboard/dashboard.page';
import { ReceiptsPage } from './Pages/Receipts/receipts.page';
import { LayoutEditorPage } from './Pages/LayoutEditor/layout-editor.page';
import { CheckoutPage } from './Pages/Checkout/checkout.page';
import { SchedulePage } from './Pages/Schedule/schedule.page';
import { RoleManagementPage } from './Pages/RoleManager/role-manager.page';


export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

    // USERS
    {
        path: 'users', component: UsersPage, canActivate: [PageAuthGuard], data: {
            ViewEndpoint: 'api/users',
            CreateEndpoint: 'api/users',
            UpdateEndpoint: 'api/users',
        }
    },

    // MENU
    {
        path: 'menu', component: MenuPage, canActivate: [PageAuthGuard], data: {
            ViewEndpoint: 'api/menu',
            CreateEndpoint: 'api/menu',
            UpdateEndpoint: 'api/menu',
        }
    },

    { path: 'dashboard', component: DashboardPage, canActivate: [PageAuthGuard] },
    { path: 'receipts', component: ReceiptsPage, canActivate: [PageAuthGuard] },


    {
        path: 'reservations', component: SchedulePage, canActivate: [PageAuthGuard], data: {
            CreateEndpoint: 'api/reservations',
        }
    },

    {
        path: 'stocks', component: StocksPage, canActivate: [PageAuthGuard], data: {
            CreateEndpoint: 'api/stocks',
        }
    },



    {
        path: 'orders', component: CheckoutPage, canActivate: [PageAuthGuard], data: {
            CreateEndpoint: 'api/orders',
        }
    },
    { path: 'checkout/:table', component: CheckoutPage, canActivate: [PageAuthGuard] },





    {
        path: 'role-management', component: RoleManagementPage, canActivate: [PageAuthGuard], data: {
            CreateEndpoint: 'api/role-permissions',
        }
    },


    {
        path: 'layout-editor', component: LayoutEditorPage, canActivate: [PageAuthGuard], data: {
            CreateEndpoint: 'api/layout',
        }
    },
    
    { path: 'profile/', component: ProfilePage, canActivate: [PageAuthGuard] },
    { path: 'profile/:username', component: ProfilePage, canActivate: [PageAuthGuard] },

    
    { path: 'login', component: LoginPage, canActivate: [PageAuthGuard], data: { NoLogin: true } },
    { path: 'register', component: RegisterPage, canActivate: [PageAuthGuard], data: { NoLogin: true } },
    { path: 'settings', component: SettingsPage, canActivate: [PageAuthGuard] },
];
