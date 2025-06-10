import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[navbar-header]'
})
export class NavbarHeaderDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {
    const nativeElement = this.el.nativeElement as HTMLElement
    this.renderer.addClass(nativeElement, 'navbar-header');
  }
}