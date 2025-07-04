
import { inject, Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { AppSettings } from '../Services/AppSettings';

@Pipe({ name: 'dcurrency', pure: false }) 
export class DynamicCurrencyPipe {

  CurrencyPipe = inject(CurrencyPipe)

  transform(value: any, currencyCode?: string, ...args: any[]): any {
    const currency = currencyCode || AppSettings.Currency
    return this.CurrencyPipe.transform(value, currency, ...args);
  }
}
