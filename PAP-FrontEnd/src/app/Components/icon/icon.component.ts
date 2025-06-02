import { HttpClient } from '@angular/common/http';
import { Component, inject, HostBinding, Input, input, Output, EventEmitter, ElementRef } from '@angular/core';



@Component({
  selector: 'icon',
  imports: [],

  templateUrl: 'icon.component.html',
  styleUrl: 'icon.component.less'
})


export class IconsModule {

  HttpClient = inject(HttpClient)
  ElementRef = inject(ElementRef)

  private IconSRC:string = ''
  SVGSource:string = ''

  @Input() fill:boolean|string = false
  @Input() strokewidth:number = 2
  @Input() color:string = 'currentcolor'
  @Input() size:string = '18px'



  @Input()
  set type(value: string) {
    this.IconSRC = value;
    this.LoadSVG()
  }

  get type() {
    return this.IconSRC;
  }


    private LoadSVG(){
    const IconURL = 'Icons/'+this.IconSRC+'.svg'
    this.HttpClient.get(IconURL, { responseType: 'text' }).subscribe(SVGResult => {
      this.SVGSource = SVGResult

      const wrapper = this.ElementRef.nativeElement.querySelector('.icon-wrapper');
      wrapper.innerHTML = SVGResult;

      const SVG = wrapper.querySelector('svg');
      if (SVG) {
        SVG.setAttribute('strokewidth', this.strokewidth);
        SVG.setAttribute('color', this.color);
        SVG.style.width = this.size
        SVG.style.height = this.size
        if (this.fill){
          SVG.setAttribute('fill', 'currentcolor');
        }
      }
    })
  }
}

