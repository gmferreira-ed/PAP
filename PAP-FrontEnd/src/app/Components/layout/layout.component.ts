import { Component, inject, HostBinding, Input, input, Output, EventEmitter, HostListener, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { PageLayoutComponent } from "../page-layout/page-layout.component";
import { HttpService } from '../../Services/Http.service';
import LayoutConfigs from './layout.config';
import GlobalUtils from '../../Services/GlobalUtils';
import { Vector2 } from '../../../types/vector';
import { LoadingScreen } from '../loading-screen/loading-screen.component';
import { AppSettings } from '../../Services/AppSettings';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateModule, TranslateService } from '@ngx-translate/core';



class LayoutComponent {
  Type: string = 'RoundTable';

  Size: Vector2 = new Vector2(15, 15)
  MinSize: Vector2 = new Vector2(0, 0)

  Position: Vector2 = new Vector2(0, 0)
  Rotation: number = 0

  id: number | string | null = null
  tableid: number | string | null = null
  processing: boolean = false


  constructor(Type: string = 'RoundTable') {
    this.Type = Type;
    this.MinSize = new Vector2(this.Size.X / 2, this.Size.Y / 2)
    this.id = Date.now()

    const ComponentConfigs = LayoutConfigs.Components[Type]
    if (ComponentConfigs) {
      if (ComponentConfigs.Size) {
        this.Size = new Vector2(ComponentConfigs.Size.X, ComponentConfigs.Size.Y)
        this.MinSize = new Vector2(ComponentConfigs.Size.X, ComponentConfigs.Size.Y)
      }
      if (ComponentConfigs.MinSize) {
        this.MinSize = new Vector2(ComponentConfigs.MinSize.X, ComponentConfigs.MinSize.Y)
      }
    }
  }
}

type HistoryAction =
  | { type: "create", ComponentData: LayoutComponent }
  | { type: "delete", ComponentData: LayoutComponent }
  | { type: "update", ComponentData: LayoutComponent, PreviousComponentData: LayoutComponent }
  | { type: "import", NewLayout: LayoutComponent[], PreviousLayout: LayoutComponent[] }

import { FormsModule } from '@angular/forms';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import { IconsModule } from "../icon/icon.component";
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FloatingContainer } from "../floating-container/floating-container";
import { NzIconModule } from 'ng-zorro-antd/icon';
import { RouterModule } from '@angular/router';
import { OrdersService } from '../../Services/Orders.service';
import { Table } from '../../../shared/table';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../Services/Auth.service';
import { DynamicDatePipe } from '../../Pipes/dynamic-date.pipe';

@Component({
  selector: 'restaurant-layout',
  imports: [LoadingScreen, NzInputNumberModule, NzSliderModule, NzGridModule, FormsModule, NzIconModule, IconsModule, TranslateModule,
    RouterModule, NzButtonModule, FloatingContainer, DynamicDatePipe],
  templateUrl: 'layout.component.html',
  styleUrl: 'layout.component.less'
})


export class RestaurantLayout {

  @Input() Components: LayoutComponent[] = [];

  // States
  @Input() SelectedComponent: LayoutComponent | undefined = undefined
  @Input() DraggingComponent: LayoutComponent | null = null
  @Input() ResizingComponent: LayoutComponent | null = null
  @Input() ShowProperties: boolean = true
  @Input() DraggingViewport: boolean = false
  @Input() LoadingLayout: boolean = true
  @Input() ProcessingComponent: boolean = false
  @Input() EditMode: boolean = false
  @Input() SelectionMode: boolean = false

  @Output() TableSelected = new EventEmitter();

  ContextMenuVisible: boolean | Vector2 = false
  HasClipboardContent = false


  // Config
  private _snapping = Number(localStorage.getItem('Snapping')) || 5
  @Input()
  get Snapping() {
    return this._snapping
  }
  set Snapping(Val: number) {
    this._snapping = Val
    localStorage.setItem('Snapping', String(Val))
  }

  private _rotationsnapping = Number(localStorage.getItem('RotationSnapping')) || 90
  @Input()
  get RotationSnapping() {
    return this._rotationsnapping
  }
  set RotationSnapping(Val: number) {
    this._rotationsnapping = Val
    localStorage.setItem('RotationSnapping', String(Val))
  }

  @Input() GridVisible: boolean = localStorage.getItem('gridvisible') != 'true' ? false : true

  ToggleGrid() {
    this.GridVisible = !this.GridVisible
    localStorage.setItem('gridvisible', String(this.GridVisible))
  }

  // DOM Elements
  @ViewChild('PageLayout', { read: PageLayoutComponent }) PageLayout!: PageLayoutComponent;
  @ViewChild('MainContainer') MainContainer!: ElementRef;
  ContainerRect = this.MainContainer?.nativeElement?.getBoundingClientRect();
  @ViewChild('Viewport') Viewport!: ElementRef;



  // Services
  MessageService = inject(NzMessageService)
  AuthService = inject(AuthService)
  OrdersService = inject(OrdersService)
  HttpService = inject(HttpService)
  Renderer = inject(Renderer2)
  TranslateService = inject(TranslateService)



  // Variables
  Handles: any = ['top', 'bottom', 'left', 'right']
  RatioHandles: any = ['top-left', 'bottom-right', 'bottom-left', 'top-right']
  Tables: Record<any, Table> = {}

  StatusDisplayNames: { [key: string]: string } = {
    OnGoing: 'Occupied'
  }

  CanEditLayout = this.AuthService.HasEndpointPermission('layout', 'PATCH')

  //Imports
  GlobalUtils = GlobalUtils
  LayoutConfigs = LayoutConfigs
  NewComponent = (Type: string, IsView: boolean = false) => {
    const NewComp = new LayoutComponent(Type)
    if (!IsView) {
      const ViewportSize = this.GetViewportSize()
      NewComp.Position.X = (this.ViewportX * -1) / this.Zoom + ViewportSize.X / 2
      NewComp.Position.Y = (this.ViewportY * -1) / this.Zoom + ViewportSize.Y / 2
      this.SelectedComponent = NewComp
    }
    return NewComp
  }


  // Viewport variables
  Scaling = 5
  Zoom = 1 * this.Scaling
  MaxZoom = 5 * this.Scaling
  ViewportX = 0
  ViewportY = 0
  ResizingType = ''

  LayoutDragInitialPos = new Vector2()
  DragStartMousePosition = new Vector2()
  DragComponentInitial = new LayoutComponent()

  LayoutAPI = AppSettings.APIUrl + 'layout/'

  DefaultViewportSize = new Vector2(2000, 2000)


  @Input() History: HistoryAction[] = [];
  @Input() CurrentHistoryIndex: number = -1

  async NavigateHistory(IndexChange: number) {
    const TargetIndex = this.CurrentHistoryIndex + IndexChange
    const HistoryLenght = this.History.length



    if (!this.ProcessingComponent) {
      if (TargetIndex >= -1 && HistoryLenght >= TargetIndex + 1) {
        this.CurrentHistoryIndex += IndexChange
        const IsUndo = IndexChange == -1


        this.LoadingLayout = true
        this.ProcessingComponent = true

        const TargetAction = IsUndo && this.History[TargetIndex + 1] || this.History[TargetIndex]

        if (TargetAction) {

          if (TargetAction.type == 'delete' && IsUndo || TargetAction.type == 'create' && !IsUndo) {
            this.AddComponent(TargetAction.ComponentData, true)
          }
          else if (TargetAction.type == 'create' && IsUndo || TargetAction.type == 'delete' && !IsUndo) {
            const TargetComponent = !IsUndo ? TargetAction.ComponentData : this.GetComponentById(TargetAction.ComponentData.id!)
            if (TargetComponent)
              this.DeleteComponent(TargetComponent, true)
            else
              console.warn('Failed to undo component creation', TargetAction.ComponentData.id)
          }
          else if (TargetAction.type == 'update') {
            const TargetComponentData = IsUndo && TargetAction.PreviousComponentData || TargetAction.ComponentData

            const ExistingComponent = this.GetComponentById(TargetAction.ComponentData.id!)
            if (ExistingComponent) {
              Object.assign(ExistingComponent, TargetComponentData);
              this.SaveComponentInfo(ExistingComponent)
            } else {
              console.warn('Failed to undo. ID', TargetAction.ComponentData.id, 'not found')
            }
          } else if (TargetAction.type == 'import') {
            let TargetLayout: any[] = []
            if (IsUndo) {
              TargetLayout = TargetAction.PreviousLayout
            } else {
              TargetLayout = TargetAction.NewLayout
            }

            const ConvertedLayout = this.ComponentArrayToSQLCollumns(TargetLayout)
            const [Result] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'layout/import', 'POST',
              this.TranslateService.instant('Failed to import layout. Invalid content format.'),
              ConvertedLayout
            )

            this.Components = TargetLayout
          }
        }

      } else {
        console.warn('Failed to navigate history')
      }

      this.ProcessingComponent = false
    } else {
      console.warn('Rate limited')
    }


    this.LoadingLayout = false
  }

  ComponentArrayToSQLCollumns(Components: LayoutComponent[]) {
    return Components.map((Component: LayoutComponent) => {
      return {
        left: Component.Position.X,
        top: Component.Position.Y,
        width: Component.Size.X,
        height: Component.Size.Y,
        rotation: Component.Rotation,
        type: Component.Type,
        tableid: Component.tableid,
      }
    })
  }

  async ClearLayout(TrackHistory: boolean = true) {

    const OldLayout = this.CloneLayout(this.Components)

    this.Components = []
    if (TrackHistory) {
      this.TrackHistory('import', OldLayout)
    }

    this.LoadingLayout = true
    const [DeleteResult] = await this.HttpService.MakeRequest(this.LayoutAPI, 'DELETE', this.TranslateService.instant('Failed to clear layout'), {
      clear: true,
    })
    this.LoadingLayout = false
  }

  GetComponentById(id: number | string): LayoutComponent | undefined {
    const Component = this.Components.find((comp) => comp.id == id)
    return Component
  }

  ComponentSnapshot(Component: LayoutComponent) {
    const SavedCompomentState = new LayoutComponent(Component.Type)
    SavedCompomentState.Position = new Vector2(Component.Position.X, Component.Position.Y)
    SavedCompomentState.Size = new Vector2(Component.Size.X, Component.Size.Y)
    SavedCompomentState.Rotation = Component.Rotation * 1 // Multiplication ensures Rotation is not a reference
    SavedCompomentState.id = Component.id
    SavedCompomentState.tableid = Component.tableid
    return SavedCompomentState
  }

  CloneLayout(Layout: LayoutComponent[]): LayoutComponent[] {
    return Layout.map(Component => Object.assign(Object.create(Object.getPrototypeOf(Component)), Component));
  }

  TrackHistory(Type: 'create' | 'delete' | 'update' | 'import', ObjectToSave: LayoutComponent | LayoutComponent[]) {
    const CurrentHistoryIndex = this.CurrentHistoryIndex
    const CurrentHistoryLenght = this.History.length
    if (CurrentHistoryIndex + 1 < CurrentHistoryLenght) {
      this.History = this.History.splice(0, CurrentHistoryIndex + 1)
      this.CurrentHistoryIndex = this.History.length - 1
    }

    const SavedCompomentState = !Array.isArray(ObjectToSave) && this.ComponentSnapshot(ObjectToSave)

    const HistoryAction: HistoryAction =

      SavedCompomentState && ((Type == 'create' || Type == 'delete') && {
        type: Type,
        ComponentData: SavedCompomentState
      }

        || Type == 'update' && {
          type: Type,
          ComponentData: SavedCompomentState,
          PreviousComponentData: this.DragComponentInitial,
        })

      || {
        type: 'import',
        NewLayout: [...this.Components],
        PreviousLayout: Array.isArray(ObjectToSave) ? ObjectToSave : [ObjectToSave]
      }


    this.History.push(HistoryAction)
    this.CurrentHistoryIndex++

    console.log(this.History)
  }

  GetRawViewportSize() {
    return new Vector2(this.Zoom * this.DefaultViewportSize.X, this.Zoom * this.DefaultViewportSize.Y)
  }

  ClampContainerPosition(X: number, Y: number) {
    const ContainerRect = this.MainContainer.nativeElement.getBoundingClientRect()
    const ViewportSize = this.GetRawViewportSize()

    const Zoom = this.Zoom
    const XMaxLimit = ViewportSize.X - ContainerRect.width
    const YMaxLimit = ViewportSize.Y - ContainerRect.height
    return [
      Math.min(Math.max(-XMaxLimit, X), 0),
      Math.min(Math.max(-YMaxLimit, Y), 0)
    ]
  }

  ClampSize(Component: LayoutComponent, TargetX: number, TargetY: number) {

    return [
      Math.max(Math.min(800, TargetX), Component.MinSize.X),
      Math.max(Math.min(800, TargetY), Component.MinSize.Y)
    ]
  }


  GetViewportSize() {
    const ContainerRect = (this.MainContainer.nativeElement as HTMLElement).getBoundingClientRect()
    return new Vector2(ContainerRect.width / this.Zoom, ContainerRect.height / this.Zoom)
  }

  ChangeZoom(Event?: WheelEvent, DeltaY?: number) {
    Event?.preventDefault();

    const ZoomDelta = 1 + ((Event?.deltaY || DeltaY!) / 1000) * -1;

    const ContainerRect = this.MainContainer.nativeElement.getBoundingClientRect();

    const TargetZoom = Math.max(Math.min(this.Zoom * ZoomDelta, this.MaxZoom), 1);

    const CenterX = ContainerRect.width / 2;
    const CenterY = ContainerRect.height / 2;

    const LayoutCenterX = (CenterX - this.ViewportX) / this.Zoom;
    const LayoutCenterY = (CenterY - this.ViewportY) / this.Zoom;


    let newViewportX = CenterX - LayoutCenterX * TargetZoom;
    let newViewportY = CenterY - LayoutCenterY * TargetZoom;


    this.Zoom = TargetZoom;

    const [TargetX, TargetY] = this.ClampContainerPosition(
      newViewportX,
      newViewportY
    );

    this.ViewportX = TargetX;
    this.ViewportY = TargetY;
  }



  GetTotalDragDelta(event: MouseEvent) {
    const DragStartMousePos = this.DragStartMousePosition
    return [DragStartMousePos.X - event.clientX, DragStartMousePos.Y - event.clientY]
  }

  getSnapStep(CompSize: number) {
    if (CompSize >= this.Snapping) {
      return this.Snapping
    } else {
      return CompSize
    }
  }

  private DraggingStep(event: MouseEvent, DraggingComponent: LayoutComponent) {
    const Snapping = this.Snapping != 0 && this.Snapping

    const InitialPos = this.DragComponentInitial.Position
    const [TotalDeltaX, TotalDeltaY] = this.GetTotalDragDelta(event)

    let X = (InitialPos.X - TotalDeltaX / this.Zoom)
    let Y = (InitialPos.Y - TotalDeltaY / this.Zoom)


    const SmallestSize = Math.min(DraggingComponent.Size.X, DraggingComponent.Size.Y)
    const SnapStep = this.getSnapStep(SmallestSize)


    let SnappedX = Snapping ? Math.round(X / SnapStep) * SnapStep : X
    let SnappedY = Snapping ? Math.round(Y / SnapStep) * SnapStep : Y


    DraggingComponent.Position.X = SnappedX
    DraggingComponent.Position.Y = SnappedY
  }


  private RotateStep = (event: MouseEvent) => {

    if (!this.RotatingComponent) return

    const dx = event.clientX - this._rotationCenter.x
    const dy = event.clientY - this._rotationCenter.y
    let angle = Math.atan2(dy, dx) * 180 / Math.PI
    angle = angle + 90
    const snap = this.RotationSnapping || 1
    angle = Math.round(angle / snap) * snap
    this.RotatingComponent.Rotation = angle
  };


  private ResizeStep(event: MouseEvent, DraggingComponent: LayoutComponent) {
    const Snapping = this.Snapping != 0 && this.Snapping
    const InitialSize = this.DragComponentInitial.Size
    const InitialPos = this.DragComponentInitial.Position
    const ResizingType = this.ResizingType
    let [TotalDeltaX, TotalDeltaY] = this.GetTotalDragDelta(event)


    const SnapStepX = this.getSnapStep(DraggingComponent.MinSize.X)
    const SnapStepY = this.getSnapStep(DraggingComponent.MinSize.Y)

    if (ResizingType == 'left') {
      let X = (InitialPos.X - TotalDeltaX / this.Zoom)
      let SnappedX = Snapping ? Math.round(X / SnapStepX) * SnapStepX : X
      if (SnappedX < InitialPos.X + InitialSize.X) {
        DraggingComponent.Position.X = SnappedX
      }
      TotalDeltaX *= -1
    }
    if (ResizingType == 'top') {
      let Y = (InitialPos.Y - TotalDeltaY / this.Zoom)
      let SnappedY = Snapping ? Math.round(Y / SnapStepY) * SnapStepY : Y
      if (SnappedY < InitialPos.Y + InitialSize.Y)
        DraggingComponent.Position.Y = SnappedY
      TotalDeltaY *= -1
    }

    let X = (InitialSize.X - TotalDeltaX / this.Zoom)
    let Y = (InitialSize.Y - TotalDeltaY / this.Zoom)

    let SnappedX = Snapping ? Math.round(X / SnapStepX) * SnapStepX : X
    let SnappedY = Snapping ? Math.round(Y / SnapStepY) * SnapStepY : Y

    const [FinalX, FinalY] = this.ClampSize(DraggingComponent, SnappedX, SnappedY)
    DraggingComponent.Size.X = FinalX
    DraggingComponent.Size.Y = FinalY
  }

  LayoutDragStep(event: MouseEvent) {

    const InitialPos = this.LayoutDragInitialPos
    const [TotalDeltaX, TotalDeltaY] = this.GetTotalDragDelta(event)

    let X = (InitialPos.X - TotalDeltaX)
    let Y = (InitialPos.Y - TotalDeltaY)

    const [FinalX, FinalY] = this.ClampContainerPosition(X, Y)


    this.ViewportX = FinalX
    this.ViewportY = FinalY
  }


  // Dragging Component/Layout and Resizing
  @HostListener('document:mousemove', ['$event'])
  MouseMove(event: MouseEvent) {
    const DraggingComponent = this.DraggingComponent
    const ResizingComponent = this.ResizingComponent

    if (DraggingComponent) {
      this.DraggingStep(event, DraggingComponent)
    } else if (ResizingComponent) {
      this.ResizeStep(event, ResizingComponent)
    } else if (this.DraggingViewport) {
      this.LayoutDragStep(event)
    }
  }

  // Mouse up globally
  @HostListener('document:mouseup', ['$event'])
  DragEnd(event: MouseEvent) {


    document.body.classList.remove('cursor-grabbing');

    let Component = this.DraggingComponent || this.ResizingComponent || this.RotatingComponent
    if (Component) {

      if (!Component.Size.equals(this.DragComponentInitial.Size)
        || !Component.Position.equals(this.DragComponentInitial.Position)
        || Component.Rotation != this.DragComponentInitial.Rotation) {

        this.TrackHistory('update', Component)

        const ComponentID = Component.id
        if (ComponentID) {
          this.SaveComponentInfo(Component)
        } else {
          console.warn('Component doesnt have ID, ignoring save')
        }
      }
    }

    this.DraggingComponent = null
    this.ResizingComponent = null
    this.RotatingComponent = undefined
    this.DraggingViewport = false

    const TargetComp = event.target as HTMLElement
    if (!TargetComp.classList.contains('selection-box')
      && !this.ContextMenuVisible
      && !TargetComp.classList.contains('dragger')
      && !TargetComp.classList.contains('component')) {
      this.SelectedComponent = undefined
    }
  }

  SaveComponentInfo(Component: LayoutComponent) {
    const Body: any = {
      left: Component.Position.X,
      top: Component.Position.Y,

      width: Component.Size.X,
      height: Component.Size.Y,

      rotation: Component.Rotation,

      componentid: Component.id
    }

    Component.processing = true
    this.HttpService.MakeRequest(this.LayoutAPI, 'PATCH', this.TranslateService.instant('Failed to update component data'), Body).then(() => {
      Component.processing = false
    })
  }


  // Mouse down for multiple component events
  ComponentInteract(Event: MouseEvent, Component: LayoutComponent) {
    this.DragStartMousePosition = new Vector2(Event.clientX, Event.clientY)

    if (Event.button == 0) {
      Event.stopPropagation()
      this.ContextMenuVisible = false
      this.DragComponentInitial = this.ComponentSnapshot(Component)
      return true
    }
    return false
  }

  // Start dragging
  DragStart(Event: MouseEvent, Component: LayoutComponent) {
    const DragStartSucess = this.ComponentInteract(Event, Component)


    const CanSelect = (this.EditMode || Component.Type == 'Table' || Component.Type == 'RoundTable') && DragStartSucess
    if (CanSelect) {

      this.SelectedComponent = Component
      this.TableSelected.emit(Component)
    }

    if (DragStartSucess && this.EditMode)
      this.DraggingComponent = Component
  }

  // Start dragging
  ResizeStart(Event: MouseEvent, Component: LayoutComponent, HandleType: string) {
    const ResizeStartSucess = this.ComponentInteract(Event, Component)
    if (ResizeStartSucess && this.EditMode)
      this.ResizingType = HandleType
    this.ResizingComponent = Component
  }


  LayoutDragStart(Event: MouseEvent) {
    if (Event.button != 2) { // Not right button
      this.ContextMenuVisible = false
      this.LayoutDragInitialPos = new Vector2(this.ViewportX, this.ViewportY)
      this.DragStartMousePosition = new Vector2(Event.clientX, Event.clientY)
      this.DraggingViewport = true

      document.body.classList.add('cursor-grabbing');
    }
  }

  // CONTEXT MENU
  OnContextMenu(Event: MouseEvent) {
    if (this.EditMode) {
      Event.preventDefault()

      this.DragStartMousePosition = new Vector2(Event.clientX, Event.clientY)
      const ContainerRect = this.MainContainer.nativeElement.getBoundingClientRect();
      const layoutX = (Event.clientX - ContainerRect.left - this.ViewportX) / this.Zoom;
      const layoutY = (Event.clientY - ContainerRect.top - this.ViewportY) / this.Zoom;
      this.ContextMenuVisible = new Vector2(layoutX, layoutY)
    }
  }

  async DeleteComponent(Component: LayoutComponent, IgnoreTrack: boolean = false) {
    if (Component.id) {
      Component.processing = true
      const [DeleteResult] = await this.HttpService.MakeRequest(this.LayoutAPI, 'DELETE', this.TranslateService.instant('Failed to delete component'), {
        componentid: Component.id,
      })
      Component.processing = false
    }

    if (!IgnoreTrack)
      this.TrackHistory('delete', Component)

    const IndexToRemove = this.Components.indexOf(Component)
    if (IndexToRemove !== -1) {
      this.Components.splice(IndexToRemove, 1);
    }
    if (this.SelectedComponent == Component) {
      this.SelectedComponent = undefined
    }
    this.ContextMenuVisible = false
  }


  // DUPLICATE
  DuplicateComponent(TargetComponent?: LayoutComponent, IgnoreTrack: boolean = false) {
    if (TargetComponent) {
      const DuplicatedComponent = new LayoutComponent();
      DuplicatedComponent.Type = TargetComponent.Type;
      DuplicatedComponent.Size = new Vector2(TargetComponent.Size.X, TargetComponent.Size.Y)
      DuplicatedComponent.Position = new Vector2(TargetComponent.Position.X, TargetComponent.Position.Y)
      DuplicatedComponent.Rotation = TargetComponent.Rotation
      if (!IgnoreTrack) {
        this.AddComponent(DuplicatedComponent)
      } else {
        DuplicatedComponent.tableid = TargetComponent.tableid
        this.Components.push(DuplicatedComponent)
      }
      this.SelectedComponent = DuplicatedComponent;
      this.ContextMenuVisible = false

      return DuplicatedComponent
    }
    return undefined
  }

  // PASTE
  async PasteClipboardComponent(MouseEvent?: MouseEvent) {
    if (navigator.clipboard) {
      const ClipboardContent = await navigator.clipboard.readText()
      const ParsedComponent = JSON.parse(ClipboardContent)
      if (ParsedComponent && ParsedComponent.Type) {
        const NewComp = new LayoutComponent()
        NewComp.Type = ParsedComponent.Type
        NewComp.Rotation = ParsedComponent.Rotation
        NewComp.Size = new Vector2(ParsedComponent.Size.X, ParsedComponent.Size.Y)

        if (MouseEvent && this.ContextMenuVisible instanceof Vector2) {
          NewComp.Position = new Vector2(this.ContextMenuVisible.X, this.ContextMenuVisible.Y);
        } else {
          NewComp.Position = new Vector2(ParsedComponent.Position.X, ParsedComponent.Position.Y)
        }
        this.AddComponent(NewComp)
        this.SelectedComponent = NewComp;
        this.ContextMenuVisible = false
      }
    } else {
      this.MessageService.error(this.TranslateService.instant('Clipboard unavailable'))
    }
  }

  // COPY
  CopySelectedComponent() {
    const SelectedComponent = this.SelectedComponent
    if (SelectedComponent) {
      const StringifiedComponent = JSON.stringify(SelectedComponent);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(StringifiedComponent);
      } else {
        this.MessageService.error(this.TranslateService.instant('Clipboard unavailable'))
      }
      this.HasClipboardContent = true
      this.ContextMenuVisible = false
    }
  }

  CutSelectedComponent() {
    const SelectedComponent = this.SelectedComponent
    if (SelectedComponent) {
      this.CopySelectedComponent()
      this.DeleteComponent(SelectedComponent)
    }
  }


  // Copy / Paste / Duplicate
  @HostListener('document:keydown', ['$event'])
  async OnKeyPress(event: KeyboardEvent) {

    if (this.EditMode) {
      const Key = event.key
      const ControlCombo = event.ctrlKey || event.metaKey
      const ShiftCombo = event.shiftKey
      const AltCombo = event.altKey

      if (ControlCombo) {

        // COPY
        if (Key == 'c') {
          this.CopySelectedComponent()

          // PASTE
        } else if (Key == 'v') {
          this.PasteClipboardComponent()

        } else if (Key == 'z') {
          this.NavigateHistory(-1)

        } else if (Key == 'y' || (Key == 'Z' && ShiftCombo)) {
          this.NavigateHistory(1)

          // CUT
        } else if (Key == 'x' && this.SelectedComponent) {
          this.CutSelectedComponent()
          // DUPLICATE
        } else if (Key == 'd') {
          this.DuplicateComponent(this.SelectedComponent)
        }

      }

      // DELETE
      else if (Key == 'Delete' && this.SelectedComponent) {
        this.DeleteComponent(this.SelectedComponent)
      }

      else if (Key == 'r' && this.SelectedComponent) {
        this.SelectedComponent.Rotation = (this.SelectedComponent.Rotation + this.RotationSnapping) % 360
      }
    }
  }


  async ShowHandles(component: LayoutComponent) {
    this.SelectedComponent = component;
  }


  // Only call when saving info
  async AddComponent(component: LayoutComponent, IgnoreTrack: boolean = false) {
    this.Components.push(component)
    component.processing = true


    const [CreateResult] = await this.HttpService.MakeRequest(this.LayoutAPI, 'POST', this.TranslateService.instant('Failed to save component data'), {
      left: component.Position.X,
      top: component.Position.Y,
      width: component.Size.X,
      height: component.Size.Y,
      rotation: component.Rotation,
      type: component.Type,
      componentid: IgnoreTrack && component.id,
    })

    component.processing = false

    if (CreateResult) {
      component.id = Number(CreateResult.id)
      component.tableid = Number(CreateResult.tableid)

      if (!IgnoreTrack)
        this.TrackHistory('create', component)

    } else {
      console.warn('No creation ID')
    }
  }


  ngAfterViewInit() {
    const NativeElement = this.MainContainer?.nativeElement
    this.ContainerRect = NativeElement?.getBoundingClientRect();
  }

  CenterLayout() {

    const Viewport = this.Viewport.nativeElement as HTMLElement
    const ViewportRect = Viewport.getBoundingClientRect()
    const ContainerRect = (this.MainContainer.nativeElement as HTMLElement).getBoundingClientRect();

    const ViewPortCenterX = -ViewportRect.width / 2
    const ViewPortCenterY = -ViewportRect.height / 2

    if (this.Components.length > 0) {
      var SmallestX = 9999
      var SmallestY = 9999
      var BiggestXComponent = new LayoutComponent()
      var BiggestYComponent = new LayoutComponent()
      for (const Component of this.Components) {
        const CompPos = Component.Position

        if (CompPos.X < SmallestX) {
          SmallestX = CompPos.X
        }

        if (CompPos.Y < SmallestY) {
          SmallestY = CompPos.Y
        }

        if (CompPos.X > BiggestXComponent.Position.X) {
          BiggestXComponent = Component
        }

        if (CompPos.Y > BiggestYComponent.Position.Y) {
          BiggestYComponent = Component
        }
      }


      const BiggestX = BiggestXComponent.Position.X + BiggestXComponent.Size.X
      const BiggestY = BiggestYComponent.Position.Y + BiggestYComponent.Size.Y


      let LayoutCenterX = SmallestX
      let LayoutCenterY = SmallestY

      const LayoutSize = new Vector2(BiggestX - SmallestX, BiggestY - SmallestY)


      let AbsLayoutSize = new Vector2(LayoutSize.X * this.Zoom, LayoutSize.Y * this.Zoom)

      // Zoom off if needed
      if (AbsLayoutSize.X > ContainerRect.width && AbsLayoutSize.X > AbsLayoutSize.Y) {
        const ZoomDiff = AbsLayoutSize.X / ContainerRect.width
        this.Zoom -= ZoomDiff
      }
      if (AbsLayoutSize.Y > ContainerRect.height && AbsLayoutSize.X < AbsLayoutSize.Y) {
        const ZoomDiff = AbsLayoutSize.Y / ContainerRect.height
        this.Zoom -= ZoomDiff
      }

      // Center the viewport
      AbsLayoutSize = new Vector2(LayoutSize.X * this.Zoom, LayoutSize.Y * this.Zoom)
      const SizeDiffX = ContainerRect.width - AbsLayoutSize.X
      const SizeDiffY = ContainerRect.height - AbsLayoutSize.Y

      LayoutCenterX -= SizeDiffX / this.Zoom / 2
      LayoutCenterY -= SizeDiffY / this.Zoom / 2


      this.ViewportX = -LayoutCenterX * this.Zoom
      this.ViewportY = -LayoutCenterY * this.Zoom
    } else {
      this.ViewportX = ViewPortCenterX
      this.ViewportY = ViewPortCenterY
    }
  }


  ExportLayout() {
    const jsonData = JSON.stringify(this.Components, null, 2)
    const DataBlob = new Blob([jsonData], { type: "application/json" })

    const url = URL.createObjectURL(DataBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "RestroLink_Layout.dl";
    a.click();
    URL.revokeObjectURL(url);
  }

  async ImportLayout(event: Event) {
    const input = event.target as HTMLInputElement;
    const LayoutFile = input.files && input.files[0]

    if (LayoutFile) {
      const reader = new FileReader()

      reader.onload = async () => {
        try {
          const content = reader.result as string
          const LayoutData = JSON.parse(content)
          input.value = '';
          const OldLayout = this.CloneLayout(this.Components)


          const ImportBody = this.ComponentArrayToSQLCollumns(LayoutData)

          const [Result] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'layout/import', 'POST',
            this.TranslateService.instant('Failed to import layout. Invalid content format.'),
            ImportBody
          )

          if (Result) {
            this.Components = []
            for (const Component of LayoutData) {
              this.DuplicateComponent(Component, true)
              //this.Components.push(Component)
            }

            this.TrackHistory('import', OldLayout)

            this.CenterLayout()

            this.MessageService.success(this.TranslateService.instant('Sucessfully imported layout!'))
          }
        } catch (error) {
          this.MessageService.error(this.TranslateService.instant('Failed to import layout. Invalid content format.'))
        }
      };

      reader.readAsText(LayoutFile);
    }
  }


  async LoadLayout() {
    this.LoadingLayout = true
    const [LayoutData] = await this.HttpService.MakeRequest(this.LayoutAPI)
    if (LayoutData) {

      // Load components
      for (const ComponentData of LayoutData) {
        const Component = new LayoutComponent(ComponentData.type)
        Component.Position = new Vector2(ComponentData.left, ComponentData.top)
        Component.Size = new Vector2(ComponentData.width, ComponentData.height)
        Component.Rotation = ComponentData.rotation
        Component.id = ComponentData.componentid
        Component.tableid = ComponentData.tableid
        this.Components.push(Component)
      }

      this.CenterLayout()
    } else {
      this.MessageService.error(this.TranslateService.instant('Failed to load restaurant layout'))
    }







    this.LoadingLayout = false
  }

  async ngOnInit() {
    this.LoadLayout()

    // Listen to tables change and update the record according to it
    this.Tables = await this.OrdersService.Tables.Get()
  }


  // Rotation
  private RotatingComponent?: LayoutComponent
  private rotateStartAngle: number = 0;
  private rotateStartMouse: { x: number, y: number } = { x: 0, y: 0 };
  private _rotationCenter: { x: number, y: number } = { x: 0, y: 0 };


  RotateStart(event: MouseEvent, component: any) {
    event.stopPropagation()
    event.preventDefault()

    this.ComponentInteract(event, component)
    this.RotatingComponent = component

    const rect = (event.target as HTMLElement).closest('.component')!.getBoundingClientRect()
    this.rotateStartMouse = { x: event.clientX, y: event.clientY }

    this.rotateStartAngle = component.Rotation || 0;
    this._rotationCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    }
    window.addEventListener('mousemove', this.RotateStep)
  }






  // Mobile functions
  private lastTouchDistance: number | null = null;

  onTouchStart(event: TouchEvent) {
    if (event.touches.length === 2) {
      this.lastTouchDistance = this.getTouchDistance(event.touches);
    }
  }

  onTouchMove(event: TouchEvent) {
    if (event.touches.length === 2 && this.lastTouchDistance !== null) {
      const newDistance = this.getTouchDistance(event.touches);
      const delta = newDistance - this.lastTouchDistance;

      // Simulate a wheel-like event
      this.ChangeZoom(undefined, -delta); // Negate to match wheel direction

      this.lastTouchDistance = newDistance;
      event.preventDefault();
    }
  }

  onTouchEnd(event: TouchEvent) {
    if (event.touches.length < 2) {
      this.lastTouchDistance = null;
    }
  }

  private getTouchDistance(touches: TouchList): number {
    const [touch1, touch2] = [touches[0], touches[1]];
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

