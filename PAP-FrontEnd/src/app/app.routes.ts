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
import { CheckoutPage } from './Pages/Orders/checkout.page';
import { SchedulePage } from './Pages/Reservations/schedule.page';
import { RoleManagementPage } from './Pages/RoleManager/role-manager.page';
import { TestsPage } from './Pages/Tests/tests.page';
import { ErrorPage } from './Pages/Error/error.page';


export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

    // USERS
    {
        path: 'users', component: UsersPage, canActivate: [PageAuthGuard], data: {
            ViewEndpoint: 'api/users',
            ModifyEndpoint: 'api/users',
        }
    },

    // MENU
    {
        path: 'menu', component: MenuPage, canActivate: [PageAuthGuard], data: {
            ViewEndpoint: 'api/menu',
            ModifyEndpoint: 'api/menu',
        }
    },

    { path: 'dashboard', component: DashboardPage, canActivate: [PageAuthGuard] },
    { path: 'tests', component: TestsPage, canActivate: [PageAuthGuard] },


    {
        path: 'reservations', component: SchedulePage, canActivate: [PageAuthGuard], data: {
            ViewEndpoint: 'api/reservations',
            ModifyEndpoint: 'api/reservations',
        }
    },

    {
        path: 'stocks/:itemid',
        component: StocksPage,
        canActivate: [PageAuthGuard],
        data: {
            ViewEndpoint: 'api/stocks',
            ModifyEndpoint: 'api/stocks'
        }
    },
    {
        path: 'stocks',
        redirectTo: 'stocks/',  // redirect to the same route with optional param
        pathMatch: 'full',
        data: {
            ViewEndpoint: 'api/stock-items',
            ModifyEndpoint: 'api/stocks-items'
        }
    },



    {
        path: 'receipts/:id',
        component: ReceiptsPage,
        canActivate: [PageAuthGuard],
        data: {
            ViewEndpoint: 'api/receipts',
            ModifyEndpoint: 'api/receipts'
        }
    },
    {
        path: 'receipts',
        redirectTo: 'receipts/',  // redirect to the same route with optional param
        pathMatch: 'full',
        data: {
            ViewEndpoint: 'api/receipts',
            ModifyEndpoint: 'api/receipts'
        }
    },


    {
        path: 'orders', component: CheckoutPage, canActivate: [PageAuthGuard], data: {
            ViewEndpoint: 'api/orders',
            ModifyEndpoint: 'api/orders',
        }
    },
    {
        path: 'checkout/:table', component: CheckoutPage, canActivate: [PageAuthGuard], data: {
            ModifyEndpoint: 'api/orders',
        }
    },





    {
        path: 'role-management', component: RoleManagementPage, canActivate: [PageAuthGuard], data: {
            ModifyEndpoint: 'api/role-permissions',
        }
    },


    {
        path: 'layout-editor', component: LayoutEditorPage, canActivate: [PageAuthGuard], data: {
            ModifyEndpoint: 'api/layout',
        }
    },

    { path: 'profile/', component: ProfilePage, canActivate: [PageAuthGuard] },
    { path: 'profile/:username', component: ProfilePage, canActivate: [PageAuthGuard] },


    { path: 'login', component: LoginPage, canActivate: [PageAuthGuard], data: { IgnoreRedirect: true, Unprotected:true }   },
    { path: 'register', component: RegisterPage, canActivate: [PageAuthGuard], data: { IgnoreRedirect: true, Unprotected:true  } },
    { path: 'error', component: ErrorPage, data: { IgnoreRedirect: true, Unprotected:true  } },

    {
        path: 'settings', component: SettingsPage, canActivate: [PageAuthGuard]
    },

    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
