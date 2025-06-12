import { Component, inject, ViewChild } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonComponent, NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { IconsModule } from '../../Components/icon/icon.component';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { StockItem } from '../../../types/stock-item';
import { Supplier } from '../../../types/supplier';
import { StockOrderItem } from '../../../types/purchase-order';
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
import { ApexXAxis, ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { ApexChartOptions } from '../../../types/apex-chart';
import { StatCardComponent } from "../../Components/stats/stat-card.component";
import { ActivatedRoute, Router } from '@angular/router';
import { FileSelectComponent } from '../../Components/file-selector/file-select.component';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeService } from '../../Services/Theme.service';

var DefaultChartOptions: Partial<ApexChartOptions> = {
  chart: {
    type: 'area',
    toolbar: { show: false },
    height: '100%',
  },
  markers: {
    size: 0
  },
  dataLabels: {
    enabled: false
  },
  tooltip: {
    x: {
      format: "dd MMM yyyy"
    }
  },
  xaxis: {
    tooltip: {
      enabled: false
    },
    type: 'datetime',
  },
}


type StockTotalData = {
  quantity: number,
  unit: string
}

@Component({
  selector: 'stocks-page',
  imports: [PageLayoutComponent, NzModalModule, NzButtonModule, NzInputModule, NzFormModule, FormsModule, ReactiveFormsModule, NzIconModule,
    NzTabsModule, FileSelectComponent, NoDataComponent, NzSelectModule, NzDatePickerModule, NzTableModule, EditableDirective, StatusTagComponent,
    NzInputNumberModule, NzCheckboxModule, CurrencyPipe, LoadingScreen, NgApexchartsModule, StatCardComponent, TranslatePipe, IconsModule],
  templateUrl: './stocks.page.html',
  styleUrl: './stocks.page.less'
})
export class StocksPage {

  // SERVICES
  HttpService = inject(HttpService)
  MessageService = inject(NzMessageService)
  StocksService = inject(StocksService)
  Router = inject(Router)
  ActiveRoute = inject(ActivatedRoute)
  ThemeService = inject(ThemeService)
  GlobalUtils = GlobalUtils

  // DATA
  Items: StockItem[] = []
  Ingredients: StockItem[] = []

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
  StockOrderItems: StockOrderItem[] = [];

  // VARIABLES
  SelectedItems: number[] = []

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

  // constructor
  // constructor(){
  //   DefaultChartOptions = {
  //     ...DefaultChartOptions,
  //     theme:{
  //       mode:this.ThemeService.Theme()
  //     }
  //   } as ApexChartOptions
  // }

  // ASYNC ACTIONS
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

    const FormValues = this.StockOrderForm.value
    const order = {
      ...this.StockOrderForm.value,
      order_date: GlobalUtils.ToSQLDate(FormValues.order_date),
      delivery_date: GlobalUtils.ToSQLDate(FormValues.delivery_date),
      items: this.StockOrderItems,
    };
    const [Result] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'stock-orders', 'POST', 'Failed to add stock order', order);
    if (Result) {
      this.MessageService.success('Stock order added');
      this.StockOrderAddModalVisible = false;
      this.StockOrderForm.reset()
      this.StocksService.LoadStockOrders()
    }

    this.AddingStockOrder = false
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




  // ACTIONS
  AddOrderItem() {
    this.StockOrderItems.push({ item_id: 1, quantity: 1, cost: 0 })
  }

  OrderItemChanged(OrderItem: StockOrderItem) {
    const StockItem = this.GetStockItemByID(OrderItem.item_id)!
    OrderItem.cost = StockItem.purchase_price * OrderItem.quantity
  }


  RemoveOrderItem(index: number) {
    this.StockOrderItems.splice(index, 1)
  }

  CreateOrder() {
    this.StockOrderItems = []
    for (const ItemID of this.SelectedItems) {
      const StockItem = this.GetStockItemByID(ItemID)!
      this.StockOrderItems.push({ item_id: ItemID, quantity: 1, cost: StockItem.purchase_price })
    }
    this.SelectedItems = []
    this.StockOrderAddModalVisible = true
  }




  // UTILS
  GetSupplierByID(ID: number) {
    return this.StocksService.Suppliers.find((sup) => sup.id == ID)
  }
  GetStockItemByID(ID: number) {
    return this.StocksService.StockItems.find((item) => item.id == ID)
  }


  // LOADING
  async LoadStockItems() {
    const Stocks = await this.StocksService.LoadStocks() as StockItem[]

    const Items: StockItem[] = []
    const Ingredients: StockItem[] = []

    for (const StockItem of Stocks) {
      if (!StockItem.unit_of_measure) {
        Items.push(StockItem)
      } else {
        Ingredients.push(StockItem)
      }
    }

    this.Ingredients = Ingredients
    this.Items = Items
  }

  // ON INIT

  async ngOnInit() {
    await this.StocksService.LoadSuppliers();
    await this.LoadStockItems();
    await this.StocksService.LoadStockOrders();
    this.LoadGeneralCharts()

    const SelectedItemID = Number(this.ActiveRoute.snapshot.paramMap.get('itemid'));
    const SelectedItem = SelectedItemID && this.StocksService.StockItems.find(item => item.id == SelectedItemID);
    if (SelectedItem) {
      this.SelectedStockItem = SelectedItem;
    }
  }

  // STOCK ITEMS CHART
  StockItemsChartOptions = {
    ...DefaultChartOptions,
    chart: {
      ...DefaultChartOptions.chart,
      type: 'pie',
      height: '100%',
      width: '100%',
    }
  } as ApexChartOptions


  StockOrdersDisChartOptions = {
    ...DefaultChartOptions,
    chart: {
      ...DefaultChartOptions.chart,
      type: 'bar', // switched from 'radar' to 'bar'
      height: '100%',
      width: '100%',
    }
  } as ApexChartOptions

  LoadGeneralCharts() {
    const Labels: string[] = []
    const StockItemsSeries: number[] = []
    const StockItemsDistributions: string[] = []

    // Prepare data for two series: quantity bought and money spent
    const purchaseStats: { [itemName: string]: { totalQuantity: number, totalSpent: number } } = {}

    for (const StockOrder of this.StocksService.StockOrders) {
      const StockItem = this.GetStockItemByID(StockOrder.item_id)
      if (StockItem) {
        if (!purchaseStats[StockItem.name]) {
          purchaseStats[StockItem.name] = { totalQuantity: 0, totalSpent: 0 }
        }
        purchaseStats[StockItem.name].totalQuantity += StockOrder.quantity || 0
        purchaseStats[StockItem.name].totalSpent += StockOrder.cost || 0
      }
    }

    const StockItemsDistributionQuantitySeries: number[] = []
    const StockItemsDistributionSpentSeries: number[] = []

    for (const StockItem of this.StocksService.StockItems) {
      Labels.push(StockItem.name)
      StockItemsSeries.push(StockItem.quantity_in_stock)
      StockItemsDistributions.push(StockItem.name)
      StockItemsDistributionQuantitySeries.push(purchaseStats[StockItem.name]?.totalQuantity || 0)
      StockItemsDistributionSpentSeries.push(purchaseStats[StockItem.name]?.totalSpent || 0)
    }

    this.StockItemsChartOptions = {
      ...this.StockItemsChartOptions,
      labels: Labels,
      series: StockItemsSeries
    }

    this.StockOrdersDisChartOptions = {
      ...this.StockOrdersDisChartOptions,
      xaxis: {
        categories: StockItemsDistributions,
      },
      series: [
        { name: 'Total Quantity Bought', data: StockItemsDistributionQuantitySeries },
        { name: 'Total Money Spent', data: StockItemsDistributionSpentSeries }
      ]
    }
  }


  // STOCK ITEM SELECTION 
  set SelectedStockItem(item: StockItem | undefined) {
    if (item) {
      console.log('NAVIGATING')
      this.Router.navigate(['/stocks', item.id])
      this.CalculateItemStats(item);
    } else {
      this._selectedStockItem = undefined
    }
  }
  get SelectedStockItem(): StockItem | undefined {
    return this._selectedStockItem;
  }
  private _selectedStockItem?: StockItem;


  LoadingItemStats = false

  GetOrderTotal(Property: string, StockItem: StockItem, ViewType: 'Week' | 'Month' | 'Year' | 'All' | string) {
    let Total = 0;
    const now = new Date();

    let filterFn = (_: any) => true;

    if (ViewType === 'Week') {
      const startOfWeek = new Date(now);
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      filterFn = (order: any) => {
        const d = new Date(order.order_date);
        return d >= startOfWeek && d <= endOfWeek;
      };
    } else if (ViewType === 'Month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      filterFn = (order: any) => {
        const d = new Date(order.order_date);
        return d >= startOfMonth && d <= endOfMonth;
      };
    } else if (ViewType === 'Year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      filterFn = (order: any) => {
        const d = new Date(order.order_date);
        return d >= startOfYear && d <= endOfYear;
      };
    }

    const FilteredItems = StockItem.Orders.filter(filterFn);
    for (const PurchaseOrderItem of FilteredItems) {
      Total += PurchaseOrderItem[Property];
    }
    return Total;
  }

  async CalculateItemStats(item: StockItem) {

    this._selectedStockItem = item;
    if (!item.Orders) {

      this.LoadingItemStats = true

      const [StockItemOrders] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'stock-orders', 'GET', 'Failed to load product stats', {
        item_id: item.id
      })
      item.Orders = StockItemOrders


      const months: number[] = [];
      const expenses: [number, number][] = [];
      const quantities: [number, number][] = [];

      for (const PurchaseOrderItem of StockItemOrders) {
        const PurchaseTimestamp = new Date(PurchaseOrderItem.order_date).getTime()
        expenses.push([PurchaseTimestamp, PurchaseOrderItem.cost])
        quantities.push([PurchaseTimestamp, PurchaseOrderItem.quantity])
      }

      const now = new Date()
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(d.getTime());
      }


      item.QuantityChartOptions = {
        ...DefaultChartOptions,
        series: [{ name: 'Quantity', data: quantities }],
      } as ApexChartOptions

      item.ExpensesChartOptions = {
        ...DefaultChartOptions,
        tooltip: {
          ...DefaultChartOptions.tooltip,
          y: {
            formatter: (val: number) => `$${val.toFixed(2)}`
          },
        },
        series: [{ name: 'Expenses', data: expenses }],
      } as ApexChartOptions


      this.LoadingItemStats = false
    }


  }

}