import { Routes } from '@angular/router';
import { HomePage } from './Pages/Home/home.page';
import { UsersPage } from './Pages/Users/users.page';
import { MenuPage } from './Pages/Menu/menu.page';


export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomePage },
    { path: 'users', component: UsersPage },
    { path: 'menu', component: MenuPage },

    { path: 'settings', component: UsersPage },
    { path: 'calendar', component: UsersPage },
    { path: 'finances', component: UsersPage },
];
