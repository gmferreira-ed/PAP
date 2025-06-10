import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[navbar-item]'
})
export class NavbarItemDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.addClass(this.el.nativeElement, 'navbar-item');
  }
}