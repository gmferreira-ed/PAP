import { Routes } from '@angular/router';
import { HomePage } from './Pages/Home/home.page';
import { UsersPage } from './Pages/Users/users.page';



export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomePage },
    { path: 'users', component: UsersPage },
];
