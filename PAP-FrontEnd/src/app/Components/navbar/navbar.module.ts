import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar.component';
import { NavbarItemDirective } from './navbar-item.directive';

@NgModule({
  imports: [CommonModule, NavbarComponent, NavbarItemDirective],
  exports: [NavbarComponent, NavbarItemDirective]
})
export class NavbarModule {}