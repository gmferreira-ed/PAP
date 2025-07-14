import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { PageLayoutComponent } from '../../Components/page-layout/page-layout.component';
import { NzModalComponent, NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonComponent, NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { IconsModule } from '../../Components/icon/icon.component';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { StockItem } from '../../../shared/stock-item';
import { Supplier } from '../../../types/supplier';
import { StockOrder, StockOrderItem } from '../../../shared/stock-order';
import { NoDataComponent } from '../../Components/no-data/no-data';
import { HttpService } from '../../Services/Http.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AppSettings } from '../../Services/AppSettings';
import { StocksService } from '../../Services/Stocks.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import GlobalUtils, { DefaultChartOptions } from '../../Services/GlobalUtils';
import { NzTableModule } from 'ng-zorro-antd/table';
import { EditableDirective } from '../../Directives/editable-field.directive';
import { StatusTagComponent } from "../../Components/status-tag/status-tag.component";
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { LoadingScreen } from "../../Components/loading-screen/loading-screen.component";
import { ApexAxisChartSeries, ApexXAxis, ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { ApexChartOptions } from '../../../types/apex-chart';
import { StatCardComponent } from "../../Components/stats-card/stat-card.component";
import { ActivatedRoute, Router } from '@angular/router';
import { FileSelectComponent } from '../../Components/file-selector/file-select.component';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeService } from '../../Services/Theme.service';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { MenuProductSelect } from "../../../shared/product-selector/product-select";
import { OptionsBar } from "../../Components/options-bar/options-bar.component";
import { FloatingContainer } from "../../Components/floating-container/floating-container";
import { MenuService } from '../../Services/menu.service';
import { UFile } from '../../../types/ufile';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { DynamicCurrencyPipe } from '../../Pipes/dynamic-currency.pipe';
import { AuthService } from '../../Services/Auth.service';
import { UnavailableInfo } from '../../Components/unavailable-info/unavailable-info';
import { TranslateService } from '@ngx-translate/core';
import { DynamicDatePipe } from '../../Pipes/dynamic-date.pipe';
import { FValidators } from '../../Services/Validators';


type StockTotalData = {
  quantity: number,
  unit: string
}

@Component({
  selector: 'stocks-page',
  imports: [PageLayoutComponent, NzModalModule, NzButtonModule, NzInputModule, NzFormModule, FormsModule, ReactiveFormsModule, NzIconModule, NzToolTipModule,
    NzTabsModule, FileSelectComponent, NoDataComponent, NzSelectModule, NzDatePickerModule, NzTableModule, EditableDirective, StatusTagComponent, NzRadioModule,
    NzInputNumberModule, NzCheckboxModule, DynamicCurrencyPipe, LoadingScreen, NgApexchartsModule, StatCardComponent, TranslatePipe, IconsModule, NzDropDownModule,
    MenuProductSelect, FloatingContainer, UnavailableInfo, DynamicDatePipe
  ],
  templateUrl: './stocks.page.html',
  styleUrl: './stocks.page.less'
})
export class StocksPage {

  // Components
  @ViewChild('StockItemImage') StockItemImage!: ElementRef<HTMLImageElement>;

  // SERVICES
  HttpService = inject(HttpService)
  MessageService = inject(NzMessageService)
  MenuService = inject(MenuService)
  StocksService = inject(StocksService)
  Router = inject(Router)
  ActiveRoute = inject(ActivatedRoute)
  ThemeService = inject(ThemeService)
  ModalService = inject(NzModalService)
  NotificationService = inject(NzNotificationService)
  AuthService = inject(AuthService)
  GlobalUtils = GlobalUtils
  TranslateService = inject(TranslateService)

  // DATA
  Items: StockItem[] = []
  Ingredients: StockItem[] = []

  // TopSuppliers: {Supplier:Supplier, Orders:number}[] = []

  // STATES
  SuppliersModalVisible = false
  SupplierAddModalVisible = false
  StockOrderAddModalVisible = false
  StockItemAddModalVisible = false
  MenuItemSelectModalVisible = false
  InventoryReportModalVisible = false

  ReportingInventory = false
  AddingStockOrder = false
  AddingSuplier = false
  AddingStockItem = false


  // ORDER ITEMS
  StockOrderItems: StockOrderItem[] = [];
  InventoryReportItems: ItemReport[] = [];

  // VARIABLES
  SelectedItems: number[] = []
  ConsumptionStartDate = new Date()
  ConsumptionEndDate = new Date()
  OrdersStartDate = new Date()
  OrdersEndDate = new Date()

  CanViewOrders = this.AuthService.HasEndpointPermission('stock-orders', 'GET')
  CanMakeOrders = this.AuthService.HasEndpointPermission('stock-orders', 'POST')

  CanViewAdjustments = this.AuthService.HasEndpointPermission('inventory-reports', 'GET')
  CanMakeAdjustments = this.AuthService.HasEndpointPermission('inventory-reports', 'POST')

  CanModifySuppliers = this.AuthService.HasEndpointPermission('suppliers', 'POST')

  CanCreateItems = this.AuthService.HasEndpointPermission('stock-items', 'POST')

  UserImagesURL = AppSettings.UserImagesURL

  ActiveView: 'General View' | 'Order History' | 'Stocks List' | string = 'General View'
  ReportActions = ['SET', 'REMOVE']
  StockImagesURL = AppSettings.APIUrl + 'images/stocks/'
  MenuImagesURL = AppSettings.APIUrl + 'images/menu/'

  constructor() {
    this.ConsumptionStartDate.setDate(this.ConsumptionStartDate.getDate() - 7)
    this.OrdersStartDate.setDate(this.OrdersStartDate.getDate() - 7)
  }

  EnforceNumbers = GlobalUtils.EnforceNumber

  // FORMS
  SupplierForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [FValidators.email]),
    phone: new FormControl('', [FValidators.phone]),
    address: new FormControl(''),
    notes: new FormControl(''),
  });

  StockItemForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    SKU: new FormControl(''),
    quantity_in_stock: new FormControl(0, [Validators.required]),
    unit_of_measure: new FormControl(''),
    purchase_price: new FormControl(0),
    supplier_id: new FormControl<null | number>(null, [Validators.required]),
    description: new FormControl(''),
  });

  StockOrderForm = new FormGroup({
    supplier_id: new FormControl<null | number>(null, [Validators.required]),
    order_date: new FormControl('', [Validators.required]),
    delivery_date: new FormControl(''),
  });

  CheckInvalidOrderItem() {
    return this.StockOrderItems.find((Item) => {
      if (!Item.item_id) {
        console.log('No item id')
        return true
      }
      return false
    })
  }

  SupplierFieldChanged(NewVal: number) {
    this.StockOrderItems = this.StockOrderItems.filter((Item) => {
      const StockItem = this.GetStockItemByID(Item.item_id)
      return !StockItem || StockItem.supplier_id == NewVal
    })
  }

  FindReportItemWithID(ID: number) {
    return this.InventoryReportItems.find((i) => i.item_id == ID)
  }

  // ASYNC ACTIONS
  async AddSupplier() {
    this.AddingSuplier = true

    const [Result] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'suppliers', 'POST', this.TranslateService.instant('Failed to add supplier'), this.SupplierForm.value);
    if (Result) {
      this.MessageService.success(this.TranslateService.instant('Supplier added'));
      this.SupplierAddModalVisible = false;
      this.SupplierForm.reset()
      this.StocksService.LoadSuppliers();
    }

    this.AddingSuplier = false
  }

  async AddStockItem() {
    this.AddingStockItem = true

    const [Result] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'stock-items', 'POST', this.TranslateService.instant('Failed to add stock item'), this.StockItemForm.value);
    if (Result) {
      this.MessageService.success(this.TranslateService.instant('Stock item added'));
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
    const [Result] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'stock-orders', 'POST', this.TranslateService.instant('Failed to add stock order'), order);
    if (Result) {
      this.MessageService.success(this.TranslateService.instant('Stock order added'));
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
  ChangeSupplierData = this.HttpService.GetInstancePatchCallback(AppSettings.APIUrl + 'suppliers',
    this.TranslateService.instant('Failed to update supplier'),
    this.TranslateService.instant('Sucessfully updated supplier'))



  TogglingStockItemActive = false
  async ToggleStockitemActive(StockItem?: StockItem) {

    if (!StockItem) {
      StockItem = this.StocksService.StockItems.find((i) => i.id == this.SelectedItems[0])
    }

    if (StockItem) {
      this.TogglingStockItemActive = true

      const TargetVal = StockItem.active ? 0 : 1
      const [Result] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'stock-items', 'PATCH', this.TranslateService.instant("Failed to save component data"), {
        active: TargetVal,
        id: StockItem.id
      })
      if (Result) {
        this.SelectedItems = []
        this.MessageService.success('Sucess!')
        this.LoadStockItems()
      }
    }


    this.TogglingStockItemActive = false
  }

  LinkingProduct = false
  UnlinkingProduct = false

  async UnlinkLinkItemToProduct() {
    this.UnlinkingProduct = true

    const [UnlinkResult] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'stock-items', 'PATCH',
      this.TranslateService.instant('Failed to disconnect product'), {
      connected_product_id: null,
      id: this.SelectedStockItem!.id
    })
    if (UnlinkResult) {
      this.MessageService.success(this.TranslateService.instant('DISCONNECT_SUCCESS', {
        name: this.SelectedStockItem!.name
      }))
      this.SelectedStockItem!.product_name = undefined

      const ProductImage = this.StockItemImage.nativeElement
      if (ProductImage && ProductImage.src.includes('/menu/')) {
        ProductImage.src = ''
      }
    }

    this.UnlinkingProduct = false
  }

  async LinkItemToProduct(ProductInfo: any) {
    this.LinkingProduct = true

    const [LinkResult] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'stock-items', 'PATCH', this.TranslateService.instant('Failed to link product'), {
      connected_product_id: ProductInfo.id,
      id: this.SelectedStockItem!.id
    })
    if (LinkResult) {
      this.MessageService.success(
        this.TranslateService.instant('CONNECT_SUCCESS', {
          stock: this.SelectedStockItem!.name,
          product: ProductInfo.name
        })
      );
      this.MenuItemSelectModalVisible = false
      this.SelectedStockItem!.product_name = ProductInfo.name
      this.SelectedStockItem!.selling_price = ProductInfo.price

      const ProductImage = this.StockItemImage.nativeElement
      if (ProductImage && ProductImage.src.includes('.svg')) {
        ProductImage.src = this.MenuImagesURL + ProductInfo.name
      }
    }

    this.LinkingProduct = false
  }

  async CreateInventoryReport() {
    this.ReportingInventory = true

    const [ReportResult] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'inventory-reports', 'POST', this.TranslateService.instant('Failed to submit inventory report'),
      { items: this.InventoryReportItems })

    if (ReportResult) {
      this.MessageService.success(this.TranslateService.instant('Sucessfully submitted inventory report'))
      await this.LoadStockItems()
      await this.StocksService.LoadReportsHistory()
      this.InventoryReportModalVisible = false
      this.InventoryReportItems = []
    }
    this.ReportingInventory = false
  }

  PromptInventoryReportSubmit() {

    const NegativeItem = this.InventoryReportItems.find((RItem) => {
      const StockItem = this.GetStockItemByID(RItem.item_id)!
      const TargetAmount = RItem.action == 'REMOVE' ? StockItem.quantity_in_stock - RItem.amount : RItem.amount
      return TargetAmount < 0
    })

    if (NegativeItem) {
      this.ModalService.confirm({
        nzTitle: this.TranslateService.instant('Confirm Inventory Report'),
        nzContent: this.TranslateService.instant('You have one or more items that reach a negative stock amount. Are you sure? <br>This may tamper with certain RestroLink features'),
        nzOnOk: async () => { await this.CreateInventoryReport() },
        nzOkLoading: this.ReportingInventory,
        nzCentered: true
      })
    } else {
      this.CreateInventoryReport()
    }

  }


  PromptStockStatusChange(StockOrder: StockOrder, Status: string) {
    this.ModalService.confirm({
      nzTitle: this.TranslateService.instant('Are you sure?'),
      nzContent: this.TranslateService.instant(`ORDER_STATE_UPDATE`, {
        state: this.TranslateService.instant(Status)
      }),
      nzOnOk: async () => {
        await this.ChangeStockOrderData(StockOrder, 'status')(Status)
        this.LoadStockOrders()
        this.LoadStockItems()
      },
      nzCentered: true
    })
  }
  ChangeStockOrderData = this.HttpService.GetInstancePatchCallback(AppSettings.APIUrl + 'stock-orders', this.TranslateService.instant('Failed to update stock order'), this.TranslateService.instant('Sucessfully updated stock order'))



  async ChangeItemImage(Product: StockItem, Files: UFile[]) {
    const File = Files[0]
    if (File) {
      const FileData = new FormData();
      FileData.append('name', Product.name)
      FileData.append('image', File);

      const [UploadResult] = await this.HttpService.MakeRequest(this.StockImagesURL, 'POST', this.TranslateService.instant('Failed to upload stock item image'), FileData)

      if (UploadResult) {
        this.MessageService.success(this.TranslateService.instant('Successfully changed item image'))
      }
    }
  }



  // ACTIONS
  AddOrderItem() {
    const CurrentSupplierID = this.StockOrderForm.value.supplier_id
    if (CurrentSupplierID) {
      const DefaultItem: StockItem | undefined = this.StocksService.StockItems.find((Stockitem) => Stockitem.supplier_id == CurrentSupplierID)
      if (DefaultItem) {
        this.StockOrderItems.push({ item_id: DefaultItem.id, quantity: 1, cost: DefaultItem.purchase_price })
      } else {
        this.NotificationService.error('Error', this.TranslateService.instant(`This supplier doesn't have linked items. Switch suppliers or link stock items first`))
      }
    } else {
      this.NotificationService.error('Error', this.TranslateService.instant('Selected a valid supplier first'))
    }
  }

  AddReportItem() {
    const ReportItemsMap = Object.fromEntries(
      this.InventoryReportItems.map(Report => [Report.item_id, Report])
    );
    const DefaultReportItemID = this.StocksService.StockItems.find((Stockitem) => {
      return !ReportItemsMap[Stockitem.id]
    })?.id

    if (DefaultReportItemID) {
      this.InventoryReportItems.push({
        action: 'REMOVE',
        item_id: DefaultReportItemID,
        amount: 1,
      })
    }
  }

  OrderItemChanged(OrderItem: StockOrderItem) {
    const StockItem = this.GetStockItemByID(OrderItem.item_id)!
    OrderItem.cost = StockItem.purchase_price * OrderItem.quantity
  }

  SetTemplateImage(Event: Event, StockItem?: StockItem | ItemReport) {
    const ImageEl = (Event.target as HTMLImageElement)

    StockItem = StockItem || this.SelectedStockItem!
    ImageEl.src = StockItem.product_name && this.MenuImagesURL + StockItem.product_name || 'Icons/package.svg'
  }

  RemoveOrderItem(index: number) {
    this.StockOrderItems.splice(index, 1)
  }

  CreateOrder() {
    this.StockOrderItems = []
    for (const ItemID of this.SelectedItems) {
      const StockItem = this.GetStockItemByID(ItemID)!
      this.StockOrderForm.get('supplier_id')?.setValue(StockItem.supplier_id)
      this.StockOrderItems.push({ item_id: ItemID, quantity: 1, cost: StockItem.purchase_price })
    }
    this.SelectedItems = []
    this.StockOrderAddModalVisible = true
  }

  OpenProductSelectModal() {
    this.MenuItemSelectModalVisible = true

  }


  // UTILS
  GetSupplierByID(ID: number) {
    return this.StocksService.Suppliers.find((sup) => sup.id == ID)
  }
  GetStockItemByID(ID: number) {
    return this.StocksService.StockItems.find((item) => item.id == ID)
  }

  SelectedItemsHaveSameSupplier(): boolean {
    const firstStockItem = this.GetStockItemByID(this.SelectedItems[0])
    if (!firstStockItem) return false

    const firstSupplierId = firstStockItem.supplier_id
    return this.SelectedItems.every(id => {
      const item = this.GetStockItemByID(id);
      const supllier = item && this.GetSupplierByID(item.supplier_id);
      return item && item.supplier_id === firstSupplierId && supllier?.active
    });
  }

  // LOADING
  async LoadStockItems() {
    const Stocks = await this.StocksService.LoadStocks() as StockItem[]

    const Items: StockItem[] = []
    const Ingredients: StockItem[] = []

    for (const StockItem of Stocks) {
      if (StockItem.active) {
        if (!StockItem.unit_of_measure) {
          Items.push(StockItem)
        } else {
          Ingredients.push(StockItem)
        }
      }
    }

    this.Ingredients = Ingredients
    this.Items = Items


    this.LoadStocksPieChart()
  }

  // ON INIT

  PurchaseDistributionView = 'All'

  async LoadData(): Promise<void> {
    await Promise.all([
      this.StocksService.LoadSuppliers(),
      this.CanViewAdjustments && this.StocksService.LoadReportsHistory(),
      this.LoadStockItems(),
      this.LoadStockOrders()
    ]);
  }

  async LoadStockOrders() {

    if (this.CanViewOrders) {
      await this.StocksService.LoadStockOrders()

      const SelectedStockOrderID = this.SelectedStockOrder?.id

      if (SelectedStockOrderID) {
        const NewOrderInfo = this.StocksService.StockOrders.find((Order) => Order.id == SelectedStockOrderID)

        if (NewOrderInfo) {
          this.SelectedStockOrder = NewOrderInfo
        }
      }
    }

  }

  async ngOnInit() {
    await this.LoadData()
    this.LoadPurchaseDistributionChart()

    this.OnSelectionChange()
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
      type: 'bar',
      width: '100%',
      height: '',
      stacked: true
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        borderRadiusApplication: 'end',
      }
    },
    series: []
  } as ApexChartOptions

  LoadPurchaseDistributionChart(dateRange?: [number?, number?]) {
    if (this.CanViewOrders) {
      const purchaseStats: { [itemName: string]: { totalQuantity: number, totalSpent: number } } = {};

      for (const StockOrder of this.StocksService.StockOrders) {
        const orderDate = new Date(StockOrder.order_date).getTime()

        if (dateRange && dateRange[0] && dateRange[1] && (orderDate < dateRange[0] || orderDate > dateRange[1])) continue;

        for (const StockOrderItem of StockOrder.items) {
          const StockItem = this.GetStockItemByID(StockOrderItem.item_id!);
          if (StockItem) {
            if (!purchaseStats[StockItem.name]) {
              purchaseStats[StockItem.name] = { totalQuantity: 0, totalSpent: 0 };
            }
            purchaseStats[StockItem.name].totalQuantity += StockOrderItem.quantity || 0;
            purchaseStats[StockItem.name].totalSpent += StockOrderItem.cost || 0;
          }
        }
      }



      const StockItemsDistributionQuantitySeries: number[] = [];
      const StockItemsDistributionSpentSeries: number[] = [];
      const StockItemNames: string[] = [];

      for (const StockItem of this.StocksService.StockItems) {
        const ItemStats = purchaseStats[StockItem.name]
        StockItemsDistributionQuantitySeries.push(ItemStats?.totalQuantity || 0);
        StockItemsDistributionSpentSeries.push(ItemStats?.totalSpent || 0);
        StockItemNames.push(StockItem.name);
      }


      if (StockItemNames.length > 0)
        this.StockOrdersDisChartOptions = {
          ...this.StockOrdersDisChartOptions,
          xaxis: {
            categories: StockItemNames,
          },
          series: [
            { name: this.TranslateService.instant('Total Quantity Bought'), data: StockItemsDistributionQuantitySeries },
            { name: this.TranslateService.instant('Total Money Spent'), data: StockItemsDistributionSpentSeries }
          ]
        };
    }
  }

  LoadStocksPieChart() {
    const Labels: string[] = [];
    const StockItemsSeries: number[] = [];

    for (const StockItem of this.StocksService.StockItems) {
      if (StockItem.active) {
        Labels.push(StockItem.name);
        StockItemsSeries.push(StockItem.quantity_in_stock);
      }
    }


    this.StockItemsChartOptions = {
      ...this.StockItemsChartOptions,
      labels: Labels,
      series: StockItemsSeries
    };



    this.ActiveRoute.params.subscribe((params) => {
      this.OnSelectionChange()
    });

    this.ActiveRoute.queryParams.subscribe((queryParams) => {
      this.OnSelectionChange()
    });
  }

  ResetView(Context?: string) {
    this.ActiveView = Context || 'General View'
    this.SelectedStockItem = undefined
    this.SelectedStockOrder = undefined
    this.SelectedInventoryAdjustment = undefined
  }

  OnSelectionChange() {
    const ItemID = Number(this.ActiveRoute.snapshot.paramMap.get('itemid'));
    const Context = this.ActiveRoute.snapshot.queryParamMap.get('context');

    if (Context) {
      this.ActiveView = Context;
      if (ItemID) {
        const SelectedStockItem = Context == 'Stocks List' && this.StocksService.StockItems.find(item => item.id == ItemID);
        const SelectedStockOrder = Context == 'Order History' && this.StocksService.StockOrders.find(item => item.id == ItemID);
        const SelectedInventoryAdjustment = Context == 'Adjustments History' && this.StocksService.InventoryReports.find(item => item.id == ItemID);

        if (SelectedStockItem) {
          this.SelectedStockItem = SelectedStockItem
        } else if (SelectedStockOrder) {
          this.SelectedStockOrder = SelectedStockOrder
        } else if (SelectedInventoryAdjustment) {
          this.SelectedInventoryAdjustment = SelectedInventoryAdjustment
        } else {
          this.ResetView(Context)
        }
      } else {
        this.ResetView(Context)
      }
    } else {
      this.ResetView()
    }
  }

  private _selectedStockItem?: StockItem;
  private _selectedStockOrder?: StockOrder;
  private _SelectedInventoryAdjustment?: InventoryReport;

  // STOCK ORDER SELECTION 
  set SelectedStockOrder(Order: StockOrder | undefined) {
    if (Order) {
      this.Router.navigate(
        ['/stocks', Order.id],
        { queryParams: { context: 'Order History' } }
      );
      this._selectedStockOrder = Order;
    } else {
      this.Router.navigate(['/stocks/'], { queryParams: { context: this.ActiveView } })
      this._selectedStockOrder = undefined
    }
  }
  get SelectedStockOrder(): StockOrder | undefined {
    return this._selectedStockOrder;
  }

  // INVENTORY REPORT SELECTION
  set SelectedInventoryAdjustment(Report: InventoryReport | undefined) {
    if (Report) {
      this.Router.navigate(
        ['/stocks', Report.id],
        { queryParams: { context: 'Adjustments History' } }
      );
      this._SelectedInventoryAdjustment = Report;
    } else {
      this.Router.navigate(['/stocks/'], { queryParams: { context: this.ActiveView } })
      this._SelectedInventoryAdjustment = undefined
    }
  }
  get SelectedInventoryAdjustment(): InventoryReport | undefined {
    return this._SelectedInventoryAdjustment;
  }

  // STOCK ITEM SELECTION 
  set SelectedStockItem(item: StockItem | undefined) {
    if (item) {
      this.Router.navigate(
        ['/stocks', item.id],
        { queryParams: { context: 'Stocks List' } }
      );
      this.CalculateItemStats(item);
    } else {
      this.Router.navigate(['/stocks/'], { queryParams: { context: this.ActiveView } })
      this._selectedStockItem = undefined
    }
  }
  get SelectedStockItem(): StockItem | undefined {
    return this._selectedStockItem;
  }





  LoadingItemStats = false

  TotalCost = 0
  TotalQuantity = 0
  async GetOrderTotal(Property: string, StockItem: StockItem | undefined = this.SelectedStockItem, dateRange?: [number?, number?]) {
    let Total = 0;

    if (StockItem) {
      while (!StockItem.Orders) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      for (const PurchaseOrderItem of StockItem.Orders) {
        const TimeStamp = new Date(PurchaseOrderItem.order_date).getTime()
        if (dateRange && dateRange[0] && dateRange[1] && (TimeStamp < dateRange[0] || TimeStamp > dateRange[1])) continue;
        Total += PurchaseOrderItem[Property]
      }

      if (Property == 'cost') {
        this.TotalCost = Total
      } else {
        this.TotalQuantity = Total
      }
    }

    return Total
  }

// LOAD STAT TOTALS
  OrdersQuickDateChanged(Option: string) {
    const now = new Date();
    if (Option == 'Week') {
      const day = now.getDay();
      const diffToMonday = (day === 0 ? -6 : 1) - day; // Sunday is 0
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      this.OrdersStartDate = monday;
      this.OrdersEndDate = sunday;
    } else if (Option == 'Month') {
      const startOfMonth = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0);
      const endOfMonth = new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999);
      this.OrdersStartDate = startOfMonth;
      this.OrdersEndDate = endOfMonth;
    } else if (Option == 'Year') {
      const startOfYear = new Date(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
      const endOfYear = new Date(now.getUTCFullYear(), 11, 31, 23, 59, 59, 999);
      this.OrdersStartDate = startOfYear;
      this.OrdersEndDate = endOfYear;
    }
  }

  // LOAD STAT TOTALS
  GetOrdersInfo(StockItem: StockItem) {
    const FilteredItems = StockItem.Orders && StockItem.Orders.filter((order) => {
      const OrderDate = new Date(order.order_date)
      return OrderDate >= this.OrdersStartDate && OrderDate <= this.OrdersEndDate
    });
    let Expenses = 0
    let Received = 0
    if (FilteredItems) {
      for (const PurchaseOrderItem of FilteredItems) {
        Expenses += PurchaseOrderItem.cost;
        Received += PurchaseOrderItem.quantity;
      }
    }
    return { expenses: Expenses, received: Received };
  }

  // LOADING ITEM INFO ON SELECT
  async CalculateItemStats(item: StockItem) {

    this._selectedStockItem = item;
    this.LoadingItemStats = true

    if (!item.Orders && this.CanViewOrders) {


      const [StockItemOrders] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'stock-orders', 'GET', this.TranslateService.instant('Failed to load product stats'), {
        item_id: item.id
      }) as [StockOrder[]]
      item.Orders = StockItemOrders


      const months: number[] = []
      const expenses: [number, number][] = []
      const quantities: [number, number][] = []


      for (const StockPurchaseOrder of StockItemOrders) {
        const PurchaseTimestamp = new Date(StockPurchaseOrder.order_date).getTime()
        expenses.push([PurchaseTimestamp, StockPurchaseOrder.cost])
        for (const PurchaseOrderItem of StockPurchaseOrder.items) {
          quantities.push([PurchaseTimestamp, PurchaseOrderItem.quantity])
        }
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


    }

    this.GetOrderTotal('quantity')
    this.GetOrderTotal('cost')
    this.LoadingItemStats = false
  }


  // STOCK ITEM EDITING
  EditingStockItem = false

  StockItemEditForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    SKU: new FormControl(''),
    unit_of_measure: new FormControl(''),
    purchase_price: new FormControl(0),
    supplier_id: new FormControl<null | number>(null, [Validators.required]),
    description: new FormControl(''),
  });

  StartEditingStockItem() {
    if (this.SelectedStockItem) {
      this.StockItemEditForm.patchValue({
        name: this.SelectedStockItem.name,
        SKU: this.SelectedStockItem.SKU,
        unit_of_measure: this.SelectedStockItem.unit_of_measure,
        purchase_price: this.SelectedStockItem.purchase_price,
        supplier_id: this.SelectedStockItem.supplier_id,
        description: this.SelectedStockItem.description
      });
      this.EditingStockItem = true;
    }
  }

  CancelEditingStockItem() {
    this.EditingStockItem = false;
    this.StockItemEditForm.reset();
  }

  UpdatingStockItem = false

  async SaveStockItem() {
    if (this.SelectedStockItem && this.StockItemEditForm.valid) {
      this.UpdatingStockItem = true;

      const [Result] = await this.HttpService.MakeRequest(
        AppSettings.APIUrl + 'stock-items',
        'PATCH',
        this.TranslateService.instant('Failed to update stock item'),
        {
          ...this.StockItemEditForm.value,
          id: this.SelectedStockItem.id
        }
      );

      if (Result) {
        this.MessageService.success(this.TranslateService.instant('Stock item updated successfully'));

        Object.assign(this.SelectedStockItem, this.StockItemEditForm.value);

        this.EditingStockItem = false;
        this.LoadStockItems(); 
      }

      this.UpdatingStockItem = false;
    }
  }

}