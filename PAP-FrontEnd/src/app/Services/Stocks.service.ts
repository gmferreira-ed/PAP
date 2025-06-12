import { inject, Injectable, signal } from '@angular/core';
import { AppSettings } from './AppSettings';
import { HttpService } from './Http.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { StockItem } from '../../types/stock-item';
import { Supplier } from '../../types/supplier';
import { StockOrder } from '../../types/purchase-order';
@Injectable({
  providedIn: 'root'
})

export class StocksService {

  // SERVICES
  HttpService = inject(HttpService)
  MessageService = inject(NzMessageService)

  // DATA
  StockItems: StockItem[] = []
  Suppliers: Supplier[] = []
  StockOrders: StockOrder[] = []

  // VARIABLES

  // STATES
  LoadingStocks = false
  LoadingSuppliers = false
  LoadingStockOrders = false


  async LoadStocks(Force?:Boolean){
    this.LoadingStocks = true
    const [Stocks]= await this.HttpService.MakeRequest(AppSettings.APIUrl+'stock-items', 'GET', 'Failed to load stock items')

    this.StockItems = Stocks
    this.LoadingStocks = false

    return Stocks
  }

  async LoadSuppliers(){
    this.LoadingSuppliers = true
    const [Suppliers]= await this.HttpService.MakeRequest(AppSettings.APIUrl+'suppliers', 'GET', 'Failed to load suppliers')
    this.Suppliers = Suppliers
    
    this.LoadingSuppliers = false
    return Suppliers

  }

  async LoadStockOrders(){
    this.LoadingStockOrders = true
    const [StockOrders]= await this.HttpService.MakeRequest(AppSettings.APIUrl+'stock-orders', 'GET', 'Failed to load stock orders')

    this.StockOrders = StockOrders
    this.LoadingStockOrders = false

    return StockOrders

  }
}
