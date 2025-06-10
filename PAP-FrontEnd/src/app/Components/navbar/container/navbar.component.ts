import { Component, ContentChildren, ElementRef, HostBinding, HostListener, inject, Input, QueryList, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { NavbarItemDirective } from '../navbar-item.directive';
import { NavigationEnd, ResolveEnd, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../Services/Auth.service';
import { FloatingContainer } from '../../floating-container/floating-container';
import { IconsModule } from '../../icon/icon.component';

@Component({
  selector: 'navbar',
  imports: [FloatingContainer, IconsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.less',
})
export class NavbarComponent {
  @ContentChildren(NavbarItemDirective, { read: ElementRef, descendants: true }) navItems!: QueryList<ElementRef>;


  Router = inject(Router)
  Renderer = inject(Renderer2)
  AuthService = inject(AuthService)


  CheckNavItems() {
    const PageURL = `/${this.Router.url.split('/')[1]}`

    this.navItems.forEach(async (item) => {
      const el = item.nativeElement as HTMLElement;
      const routerLink = el.getAttribute('routerlink') || el.getAttribute('routerLink');
      if (routerLink == PageURL) {
        setTimeout(() => {
          this.Renderer.addClass(el, 'active');
        }, 10);
      }else{
          this.Renderer.removeClass(el, 'active');
      }

      // if (routerLink) {
      //   const CanAccesRouter = await this.AuthService.CanAccessRoute(`/${routerLink!}`)
      //   if (!CanAccesRouter) {
      //     this.Renderer.setStyle(el, 'display', 'none')
      //   }
      // }
    });
  }


  ngAfterContentInit() {
    this.CheckNavItems()
    this.Router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.CheckNavItems()
      }
    })
  }


  // COLLAPSING
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
