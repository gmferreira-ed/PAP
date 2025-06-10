import { HttpClient } from '@angular/common/http';
import { inject, Injectable, isDevMode, signal } from '@angular/core';



@Injectable({
  providedIn: 'root'
})

export class IconService {

  SVG_CACHE: { [key: string]: string } = {};
  SVG_PROMISES: { [key: string]: Promise<string> } = {}


  HttpClient = inject(HttpClient)

  async LoadSVG(SVGName: string): Promise<string> {
    const IconURL = 'Icons/' + SVGName + '.svg';

    const CachedIcon = this.SVG_CACHE[IconURL];
    if (CachedIcon) {
      return CachedIcon;
    }

    const ExistingPromise = this.SVG_PROMISES[IconURL]
    if (ExistingPromise) {
      return ExistingPromise
    }

    const svgPromise = new Promise<string>((resolve, reject) => {
      this.HttpClient.get(IconURL, { responseType: 'text' }).subscribe({
        next: (SVGResult) => {
          this.SVG_CACHE[IconURL] = SVGResult;
          resolve(SVGResult);
        },
        error: reject
      })
    })

    this.SVG_PROMISES[IconURL] = svgPromise;
    return svgPromise;
  }
}
