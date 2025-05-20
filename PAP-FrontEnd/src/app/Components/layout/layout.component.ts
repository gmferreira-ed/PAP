import { Component, inject, HostBinding, Input, input, Output, EventEmitter, HostListener, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { PageLayoutComponent } from "../page-layout/page-layout.component";
import { HttpService } from '../../Services/Http.service';
import LayoutConfigs from './layout.config';
import GlobalUtils from '../../Services/GlobalUtils';
import { Vector2 } from '../../../types/vector';
import { LoadingScreen } from '../loading-screen/loading-screen.component';
import { AppSettings } from '../../Services/AppSettings';
import { NzMessageService } from 'ng-zorro-antd/message';



class LayoutComponent {
  Type: string = 'RoundTable';

  Size: Vector2 = new Vector2(10, 10)
  MinSize: Vector2 = new Vector2(0, 0)

  Position: Vector2 = new Vector2(0, 0);

  id: number | string | null = null
  processing: boolean = false

  constructor(Type: string = 'RoundTable') {
    this.Type = Type;
    this.MinSize = new Vector2(this.Size.X / 2, this.Size.Y / 2)
    this.id =  Date.now()

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
  | { type: "import", Layout: LayoutComponent[], PreviousLayout: LayoutComponent[] }

import { FormsModule } from '@angular/forms';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import { IconsModule } from "../icon/icon.component";

@Component({
  selector: 'restaurant-layout',
  imports: [LoadingScreen, NzInputNumberModule, NzSliderModule, NzGridModule, FormsModule, IconsModule],

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
  @Input() EditMode: boolean = false

  ContextMenuVisible = false
  HasClipboardContent = false


  // Config
  @Input() Snapping: number = 5
  @Input() GridVisible: boolean = true



  // DOM Elements
  @ViewChild('PageLayout', { read: PageLayoutComponent }) PageLayout!: PageLayoutComponent;
  @ViewChild('MainContainer') MainContainer!: ElementRef;
  ContainerRect = this.MainContainer?.nativeElement?.getBoundingClientRect();
  @ViewChild('Viewport') Viewport!: ElementRef;



  // Services
  MessageService = inject(NzMessageService)
  HttpService = inject(HttpService)
  Renderer = inject(Renderer2)



  // Variables
  Handles: any = ['top', 'bottom', 'left', 'right']
  RatioHandles: any = ['top-left', 'bottom-right', 'bottom-left', 'top-right']


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

  DefaultViewportSize = new Vector2(1250, 1250)


  @Input() History: HistoryAction[] = [];
  @Input() CurrentHistoryIndex: number = -1

  NavigateHistory(IndexChange: number) {
    const TargetIndex = this.CurrentHistoryIndex + IndexChange
    const HistoryLenght = this.History.length



    if (TargetIndex >= -1 && HistoryLenght >= TargetIndex + 1) {
      this.CurrentHistoryIndex += IndexChange
      const IsUndo = IndexChange == -1


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
          } else {
            console.warn('Failed to undo. ID', TargetAction.ComponentData.id, 'not found')
          }
        } else if (TargetAction.type == 'import') {
          this.Components = TargetAction.PreviousLayout
        }
      }

    } else {
      console.warn('Failed to navigate history')
    }
  }

  async ClearLayout() {

    const OldLayout = this.CloneLayout(this.Components)
    this.TrackHistory('import', OldLayout)
    this.Components = []

    this.LoadingLayout = true
    const [DeleteResult] = await this.HttpService.MakeRequest(this.LayoutAPI, 'DELETE', 'Failed to clear layout', {
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
    SavedCompomentState.id = Component.id
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
        Layout: [...this.Components],
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
    Event?.preventDefault()

    const ZoomDelta = 1 + ((Event?.deltaY || DeltaY!) / 1000) * -1

    const ContainerRect = this.MainContainer.nativeElement.getBoundingClientRect()


    const TargetZoom = Math.max(Math.min(this.Zoom * ZoomDelta, this.MaxZoom), 1)
    const TrueZoomDelta = TargetZoom - this.Zoom

    this.Zoom = TargetZoom

    const [TargetX, TargetY] = this.ClampContainerPosition(
      this.ViewportX - ContainerRect.width / 2 * TrueZoomDelta,
      this.ViewportY - ContainerRect.height / 2 * TrueZoomDelta
    )

    this.ViewportX = TargetX
    this.ViewportY = TargetY
  }



  GetTotalDragDelta(event: MouseEvent) {
    const DragStartMousePos = this.DragStartMousePosition
    return [DragStartMousePos.X - event.clientX, DragStartMousePos.Y - event.clientY]
  }


  DraggingStep(event: MouseEvent, DraggingComponent: LayoutComponent) {
    const Snapping = this.Snapping != 0 && this.Snapping

    const InitialPos = this.DragComponentInitial.Position
    const [TotalDeltaX, TotalDeltaY] = this.GetTotalDragDelta(event)

    let X = (InitialPos.X - TotalDeltaX / this.Zoom)
    let Y = (InitialPos.Y - TotalDeltaY / this.Zoom)


    let SnappedX = Snapping ? Math.round(X / Snapping) * Snapping : X
    let SnappedY = Snapping ? Math.round(Y / Snapping) * Snapping : Y

    DraggingComponent.Position.X = SnappedX
    DraggingComponent.Position.Y = SnappedY
  }




  ResizeStep(event: MouseEvent, DraggingComponent: LayoutComponent) {
    const Snapping = this.Snapping != 0 && this.Snapping
    const InitialSize = this.DragComponentInitial.Size
    const InitialPos = this.DragComponentInitial.Position
    const ResizingType = this.ResizingType
    let [TotalDeltaX, TotalDeltaY] = this.GetTotalDragDelta(event)


    if (ResizingType == 'left') {
      let X = (InitialPos.X - TotalDeltaX / this.Zoom)
      let SnappedX = Snapping ? Math.round(X / Snapping) * Snapping : X
      if (SnappedX < InitialPos.X + InitialSize.X) {
        DraggingComponent.Position.X = SnappedX
      }
      TotalDeltaX *= -1
    }
    if (ResizingType == 'top') {
      let Y = (InitialPos.Y - TotalDeltaY / this.Zoom)
      let SnappedY = Snapping ? Math.round(Y / Snapping) * Snapping : Y
      if (SnappedY < InitialPos.Y + InitialSize.Y)
        DraggingComponent.Position.Y = SnappedY
      TotalDeltaY *= -1
    }

    let X = (InitialSize.X - TotalDeltaX / this.Zoom)
    let Y = (InitialSize.Y - TotalDeltaY / this.Zoom)

    let SnappedX = Snapping ? Math.round(X / Snapping) * Snapping : X
    let SnappedY = Snapping ? Math.round(Y / Snapping) * Snapping : Y

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

    const Component = this.DraggingComponent || this.ResizingComponent
    if (Component) {

      if (!Component.Size.equals(this.DragComponentInitial.Size) || !Component.Position.equals(this.DragComponentInitial.Position))
        this.TrackHistory('update', Component)

      const ComponentID = Component.id
      if (ComponentID) {
        const Body: any = {
          left: Component.Position.X,
          top: Component.Position.Y,

          width: Component.Size.X,
          height: Component.Size.Y,

          componentid: Component.id
        }

        this.HttpService.MakeRequest(this.LayoutAPI, 'PATCH', 'Failed to update component data', Body)
      } else {
        console.warn('Component doesnt have ID, ignoring save')
      }
    }
    this.DraggingComponent = null
    this.ResizingComponent = null
    this.DraggingViewport = false

    const TargetComp = event.target as HTMLElement
    if (!TargetComp.classList.contains('selection-box')
      && !this.ContextMenuVisible
      && !TargetComp.classList.contains('dragger')
      && !TargetComp.classList.contains('component')) {
      this.SelectedComponent = undefined
    }
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
    this.SelectedComponent = Component

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
      this.ContextMenuVisible = true
    }
  }

  async DeleteComponent(Component: LayoutComponent, IgnoreTrack: boolean = false) {
    if (Component.id) {
      Component.processing = true
      const [DeleteResult] = await this.HttpService.MakeRequest(this.LayoutAPI, 'DELETE', 'Failed to delete component', {
        componentid: Component.id,
      })
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
  DuplicateComponent(TargetComponent?: LayoutComponent, IgnoreTrack:boolean=false) {
    if (TargetComponent) {
      const DuplicatedComponent = new LayoutComponent();
      DuplicatedComponent.Type = TargetComponent.Type;
      DuplicatedComponent.Size = new Vector2(TargetComponent.Size.X, TargetComponent.Size.Y)
      DuplicatedComponent.Position = new Vector2(TargetComponent.Position.X, TargetComponent.Position.Y)
      if (!IgnoreTrack){
          this.AddComponent(DuplicatedComponent)
      }else{
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
    const ClipboardContent = await navigator.clipboard.readText()
    const ParsedComponent = JSON.parse(ClipboardContent)
    if (ParsedComponent && ParsedComponent.Type) {
      const NewComp = new LayoutComponent()
      NewComp.Type = ParsedComponent.Type
      NewComp.Size = { ...ParsedComponent.Size }

      if (MouseEvent) {

      } else {
        NewComp.Position = { ...ParsedComponent.Position }
      }
      this.AddComponent(NewComp)
      this.SelectedComponent = NewComp;
      this.ContextMenuVisible = false
    }
  }

  // COPY
  CopySelectedComponent() {
    const SelectedComponent = this.SelectedComponent
    if (SelectedComponent) {
      const StringifiedComponent = JSON.stringify(SelectedComponent);
      navigator.clipboard.writeText(StringifiedComponent);
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

          // CUT
        } else if (Key == 'x' && this.SelectedComponent) {
          this.CutSelectedComponent()
          // DUPLICATE
        } else if (AltCombo && Key == 'd') {
          this.DuplicateComponent(this.SelectedComponent)
        }

      }

      // DELETE
      else if (Key == 'Delete' && this.SelectedComponent) {
        this.DeleteComponent(this.SelectedComponent)
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


    const [CreateResult] = await this.HttpService.MakeRequest(this.LayoutAPI, 'POST', 'Failed to save component data', {
      left: component.Position.X,
      top: component.Position.Y,
      width: component.Size.X,
      height: component.Size.Y,
      type: component.Type,
      componentid: IgnoreTrack && component.id,
    })


    if (CreateResult) {
      component.id = Number(CreateResult.id)

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
    a.download = "DinnerLink_Layout.dl";
    a.click();
    URL.revokeObjectURL(url);
  }

  ImportLayout(event: Event) {
    const input = event.target as HTMLInputElement;
    const LayoutFile = input.files && input.files[0]
    if (LayoutFile) {
      const reader = new FileReader()

      reader.onload = () => {
        try {
          const content = reader.result as string
          const LayoutData = JSON.parse(content)
          const OldLayout = this.CloneLayout(this.Components)

          this.Components = []
          for (const Component of LayoutData){
            this.DuplicateComponent(Component, true)
            this.Components.push()
          }

          this.TrackHistory('import', OldLayout)

          this.CenterLayout()

          this.MessageService.success('Sucessfully imported layout!')
        } catch (error) {
          this.MessageService.error('Failed to import layout. Invalid content format.')
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
        Component.id = ComponentData.componentid
        this.Components.push(Component)
      }

      this.CenterLayout()
    } else {
      this.MessageService.error('Failed to load restaurant layout')
    }







    this.LoadingLayout = false
  }

  async ngOnInit() {
    this.LoadLayout()
  }
}

