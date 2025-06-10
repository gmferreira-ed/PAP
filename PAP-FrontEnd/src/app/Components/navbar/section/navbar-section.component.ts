import { Component, ContentChildren, ElementRef, HostBinding, HostListener, inject, Input, QueryList, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { NavbarItemDirective } from '../navbar-item.directive';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../Services/Auth.service';

@Component({
  selector: 'navbar-section',
  imports: [],
  templateUrl: './navbar-section.component.html',
  styleUrl: './navbar-section.component.less',
  encapsulation: ViewEncapsulation.None
})
export class NavbarSection {
  
}
