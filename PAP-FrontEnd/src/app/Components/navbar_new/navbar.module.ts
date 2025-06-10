import { NgModule } from '@angular/core';
import { NavbarComponent } from './container/navbar.component';
import { NavbarItemDirective } from './navbar-item.directive';
import { NavbarSection } from './section/navbar-section.component';
import { NavbarHeaderDirective } from './navbar-header.directive';

@NgModule({
  imports: [NavbarComponent, NavbarSection, NavbarItemDirective, NavbarHeaderDirective],
  exports: [NavbarComponent, NavbarSection, NavbarItemDirective, NavbarHeaderDirective]
})
export class NavbarModule {}