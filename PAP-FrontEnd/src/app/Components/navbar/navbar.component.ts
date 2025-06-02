import { Component, ContentChildren, ElementRef, HostBinding, HostListener, inject, Input, QueryList, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { NavbarItemDirective } from './navbar-item.directive';
import { Router, RouterLink } from '@angular/router';
import { FloatingContainer } from '../floating-container/floating-container';
import { IconsModule } from "../icon/icon.component";

@Component({
  selector: 'navbar',
  imports: [FloatingContainer, IconsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.less',
})
export class NavbarComponent {
  @ContentChildren(NavbarItemDirective, { read: ElementRef }) navItems!: QueryList<ElementRef>;
  Router = inject(Router)
  Renderer = inject(Renderer2)

  auto_collapse = false
  private manual_collapse = localStorage.getItem('menu-collapsed') == 'true'
  private _collapsed = this.manual_collapse
  @Input()
  set Collapsed(value: boolean) {
    this._collapsed = value;
    localStorage.setItem('menu-collapsed', value.toString());
  }

  get Collapsed() {
    return this._collapsed;
  }


  @HostBinding('class.collapsed') get collapsedClass() {
    return this.Collapsed;
  }

  ngAfterContentInit() {
    const PageURL = this.Router.url

    this.navItems.forEach((item) => {
      const el = item.nativeElement as HTMLElement;
      const routerLink = el.getAttribute('routerlink') || el.getAttribute('routerLink');
      if (routerLink == PageURL) {
        setTimeout(() => {
          this.Renderer.addClass(el, 'active');
        }, 10);
      }
    });
  }


  @HostListener('window:resize', ['$event'])
  onResize(event?: UIEvent) {
    if (window.innerWidth < 768) {
      this._collapsed = true
      this.auto_collapse = true
    } else if (!this.manual_collapse) {
      this._collapsed = false
      this.auto_collapse = false
    }
  }

  ngOnInit() {
    this.onResize()
  }
}
