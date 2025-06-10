import { Component, ContentChildren, ElementRef, HostBinding, HostListener, inject, Input, QueryList, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { NavbarItemDirective } from '../navbar-item.directive';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';
import { IconsModule } from "../../icon/icon.component";

@Component({
  selector: 'navbar-section',
  imports: [IconsModule],
  templateUrl: './navbar-section.component.html',
  styleUrl: './navbar-section.component.less',
  encapsulation: ViewEncapsulation.None
})
export class NavbarSection {
  @ContentChildren(NavbarItemDirective, {  read: ElementRef,descendants: true }) NavbarItems!: QueryList<ElementRef>;
  Collapsed = false

  @HostBinding('class.collapsed') get collapsedClass() {
    return this.Collapsed;
  }
}
