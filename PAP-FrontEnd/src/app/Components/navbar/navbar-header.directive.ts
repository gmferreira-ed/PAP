import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[navbar-header]'
})
export class NavbarHeaderDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.addClass(this.el.nativeElement, 'navbar-header');
  }
}