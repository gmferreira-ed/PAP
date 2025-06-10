import { HttpClient } from '@angular/common/http';
import { Component, inject, HostBinding, Input, input, Output, EventEmitter, ElementRef, SimpleChanges } from '@angular/core';
import { IconService } from './icon.service';



@Component({
  selector: 'icon',
  imports: [],

  templateUrl: 'icon.component.html',
  styleUrl: 'icon.component.less'
})


export class IconsModule {

  ElementRef = inject(ElementRef)
  IconService = inject(IconService)

  private IconSRC: string = ''
  SVGSource: string = ''

  @Input() fill: boolean | string = false
  @Input() strokewidth: number = 2
  @Input() color: string = 'currentcolor'
  @Input() size: string = '18px'
  @Input() monotone: boolean = true



  @Input()
  set type(value: string) {
    this.IconSRC = value;
    this.IconService.LoadSVG(value).then((SVG) => {
      this.setSVG(SVG)
    })
  }

  get type() {
    return this.IconSRC;
  }


  private StyleSVGElement(Element: HTMLElement | HTMLOrSVGImageElement) {

    if (Element.tagName == 'svg') {
      Element.style.width = this.size;
      Element.style.height = this.size;
    }


    if (this.monotone) {
      Element.setAttribute('strokewidth', String(this.strokewidth));
      Element.setAttribute('color', this.color);
      Element.setAttribute('stroke', this.color);

      const PreviousFill = Element.getAttribute('fill')
      const DefaultFill = Element.getAttribute('defaultfill')

      if ((PreviousFill != 'none' && PreviousFill || this.fill) && !DefaultFill) {
        if (!DefaultFill) {
          Element.setAttribute('defaultfill', PreviousFill!)
        }
        Element.setAttribute('fill', 'currentcolor');
      } else if (!this.fill && DefaultFill) {
        Element.setAttribute('fill', DefaultFill)
      }
    }
  }

  private StyleSVG() {
    const wrapper = this.ElementRef.nativeElement
    const SVG = wrapper.querySelector('svg') as HTMLOrSVGImageElement
    if (SVG) {
      setTimeout(() => {
        this.StyleSVGElement(SVG)
        const SVGElements = SVG.querySelectorAll('g, path, rect, circle, ellipse, polygon, polyline, line')
        if (this.monotone) {
          SVGElements.forEach(el => {
            this.StyleSVGElement(el as HTMLElement)
          })
        }
      }, 1);
    }
  }

  private setSVG(SVGResult: string) {
    this.SVGSource = SVGResult;
    const wrapper = this.ElementRef.nativeElement
    wrapper.innerHTML = SVGResult;
    this.StyleSVG()
  }



  ngOnChanges(changes: SimpleChanges) {
    if (changes['fill'] || changes['color']) {
      this.StyleSVG()
    }
  }
}

