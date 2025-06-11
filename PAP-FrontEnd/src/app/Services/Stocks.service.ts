import { inject, Injectable, signal } from '@angular/core';
import { AppSettings } from './AppSettings';
import { HttpService } from './Http.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { StockItem } from '../../types/stock-item';
import { PurchaseOrder } from '../../types/purchase-order';
import { Supplier } from '../../types/supplier';
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
  PurchaseOrders: PurchaseOrder[] = []

  // VARIABLES

  // STATES
  LoadingStocks = false
  LoadingSuppliers = false
  LoadingStockOrders = false


  async LoadStocks(){
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
    const [StockOrders]= await this.HttpService.MakeRequest(AppSettings.APIUrl+'stock-items', 'GET', 'Failed to load stock orders')

    this.PurchaseOrders = StockOrders
    this.LoadingStockOrders = false

    return StockOrders

  }
}
