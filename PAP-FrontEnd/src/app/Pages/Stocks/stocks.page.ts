import { Component, inject } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonComponent, NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { IconsModule } from '../../Components/icon/icon.component';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { FileSelectComponent } from '../../Components/image-cropper/image-cropper.component';
import { StockItem } from '../../../types/stock-item';
import { Supplier } from '../../../types/supplier';
import { PurchaseOrder } from '../../../types/purchase-order';
import { NoDataComponent } from '../../Components/no-data/no-data';
import { HttpService } from '../../Services/Http.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AppSettings } from '../../Services/AppSettings';
import { StocksService } from '../../Services/Stocks.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import GlobalUtils from '../../Services/GlobalUtils';
import { NzTableModule } from 'ng-zorro-antd/table';
import { EditableDirective } from '../../Directives/editable-field.directive';
import { StatusTagComponent } from "../../Components/status-tag/status-tag.component";
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { CurrencyPipe } from '@angular/common';
import { LoadingScreen } from "../../Components/loading-screen/loading-screen.component";
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexChartOptions } from '../../../types/apex-chart';



type StockTotalData = {
  quantity: number,
  unit: string
}

@Component({
  selector: 'stocks-page',
  imports: [PageLayoutComponent, NzModalModule, NzButtonModule, NzInputModule, NzFormModule, FormsModule, ReactiveFormsModule, NzIconModule, IconsModule,
    NzTabsModule, FileSelectComponent, NoDataComponent, NzSelectModule, NzDatePickerModule, NzTableModule, EditableDirective, StatusTagComponent,
    NzInputNumberModule, NzCheckboxModule, CurrencyPipe, LoadingScreen, NgApexchartsModule],
  templateUrl: './stocks.page.html',
  styleUrl: './stocks.page.less'
})
export class StocksPage {

  // SERVICES
  HttpService = inject(HttpService)
  MessageService = inject(NzMessageService)
  StocksService = inject(StocksService)
  GlobalUtils = GlobalUtils

  // DATA
  Items: StockItem[] = []
  Ingredients: StockItem[] = []
  TotalItems: number = 0

  // TopSuppliers: {Supplier:Supplier, Orders:number}[] = []

  // STATES
  SuppliersModalVisible = false
  SupplierAddModalVisible = false
  StockOrderAddModalVisible = false
  StockItemAddModalVisible = false

  AddingStockOrder = false
  AddingSuplier = false
  AddingStockItem = false


  // ORDER ITEMS
  StockOrderItems: { item_id: number, quantity: number, cost: number }[] = [];

  // VARIABLES
  SelectedStockItem?: StockItem

  // FORMS
  SupplierForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl(''),
    phone: new FormControl(''),
    address: new FormControl(''),
    notes: new FormControl(''),
  });

  StockItemForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    SKU: new FormControl(''),
    quantity_in_stock: new FormControl(0, [Validators.required]),
    unit_of_measure: new FormControl(''),
    purchase_price: new FormControl(0),
    supplier_id: new FormControl(null, [Validators.required]),
    description: new FormControl(''),
  });

  StockOrderForm = new FormGroup({
    supplier_id: new FormControl(null, [Validators.required]),
    order_date: new FormControl('', [Validators.required]),
    delivery_date: new FormControl(''),
  });

  async AddSupplier() {
    this.AddingSuplier = true

    const [Result] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'suppliers', 'POST', 'Failed to add supplier', this.SupplierForm.value);
    if (Result) {
      this.MessageService.success('Supplier added');
      this.SupplierAddModalVisible = false;
      this.SupplierForm.reset()
      this.StocksService.LoadSuppliers();
    }

    this.AddingSuplier = false
  }

  async AddStockItem() {
    this.AddingStockItem = true

    const [Result] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'stock-items', 'POST', 'Failed to add stock item', this.StockItemForm.value);
    if (Result) {
      this.MessageService.success('Stock item added');
      this.StockItemAddModalVisible = false;
      this.StockItemForm.reset()
      this.StocksService.LoadStocks();
    }

    this.AddingStockItem = false
  }

  async AddStockOrder() {
    this.AddingStockOrder = true

    const order = { ...this.StockOrderForm.value, items: this.StockOrderItems };
    const [Result] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'purchase-orders', 'POST', 'Failed to add stock order', order);
    if (Result) {
      this.MessageService.success('Stock order added');
      this.StockOrderAddModalVisible = false;
      this.StockOrderForm.reset()
      this.StocksService.LoadStockOrders()
    }

    this.AddingStockOrder = false
  }

  AddOrderItem() {
    this.StockOrderItems.push({ item_id: 1, quantity: 1, cost: 0 })
  }

  RemoveOrderItem(index: number) {
    this.StockOrderItems.splice(index, 1)
  }

  GetSupplierByID(ID: number) {
    return this.StocksService.Suppliers.find((sup) => sup.id == ID)
  }

  async ToggleSupplierActive(Supplier: Supplier) {
    Supplier.TogglingActive = true

    const TargetVal = Supplier.active ? 0 : 1
    const Sucess = await this.ChangeSupplierData(Supplier, 'active')(TargetVal)
    if (Sucess)
      Supplier.active = TargetVal == 1


    Supplier.TogglingActive = false
  }
  ChangeSupplierData = this.HttpService.GetInstancePatchCallback(AppSettings.APIUrl + 'suppliers', 'Failed to update supplier', 'Sucessfully updated supplier')


  async LoadStocks() {
    const Stocks = await this.StocksService.LoadStocks() as StockItem[]

    const Items: StockItem[] = []
    const Ingredients: StockItem[] = []
    let TotalItems = 0

    for (const StockItem of Stocks) {
      if (!StockItem.unit_of_measure) {
        Items.push(StockItem)
        TotalItems += StockItem.quantity_in_stock
      } else {
        Ingredients.push(StockItem)
      }
    }

    this.Ingredients = Ingredients
    this.Items = Items
    this.TotalItems = TotalItems
  }

  async ngOnInit() {
    await this.StocksService.LoadSuppliers();
    this.LoadStocks()
  }


}
