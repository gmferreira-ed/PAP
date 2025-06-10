import { Component, ContentChildren, ElementRef, HostBinding, HostListener, inject, Input, QueryList, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { NavbarItemDirective } from '../navbar-item.directive';
import { NavigationEnd, ResolveEnd, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';
import { NavbarSection } from '../section/navbar-section.component';

@Component({
  selector: 'navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.less',
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent {
  @ContentChildren(NavbarSection) NavbarSections!: QueryList<NavbarSection>;


  Router = inject(Router)
  Renderer = inject(Renderer2)
  AuthService = inject(AuthService)


  CheckNavItems() {
    const PageURL = this.Router.url.split('/')[1]

    console.log('Checking navbar items')
    this.NavbarSections.forEach(async (NavbarSection) => {
      var SectionActiveMember = undefined

      for (const NavbarItem of NavbarSection.NavbarItems) {
        const el = NavbarItem.nativeElement as HTMLElement;
        const routerLink = el.getAttribute('routerlink') || el.getAttribute('routerLink');

        if (routerLink) {
          if (routerLink == PageURL) {
            SectionActiveMember = routerLink
            NavbarSection.Collapsed = false
            setTimeout(() => {
              this.Renderer.addClass(el, 'active');
            }, 10);
          } else {
            if (!SectionActiveMember){
              //NavbarSection.Collapsed = true Disabling this feature for now
            }
            this.Renderer.removeClass(el, 'active');
          }

          const CanAccesRouter = await this.AuthService.CanAccessRoute(`/${routerLink!}`)
          if (!CanAccesRouter) {
            this.Renderer.setStyle(el, 'display', 'none')
          }
        }
      }
    })
  }


  ngAfterContentInit() {
    this.Router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.CheckNavItems()
      }
    })
  }


  // COLLAPSING
  private _collapsed = false

  @Input() Collapsed = false


  @HostBinding('class.collapsed') get collapsedClass() {
    return this._collapsed;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?: UIEvent) {
    if (window.innerWidth < 1000) {
      this._collapsed = true
    } else {
      this._collapsed = false
    }
  }

  ngOnInit() {
    this.onResize()
  }
}
