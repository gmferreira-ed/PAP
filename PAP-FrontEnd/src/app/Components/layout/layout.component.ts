import { Component, inject, HostBinding, Input, input, Output, EventEmitter, HostListener, ViewChild, ElementRef } from '@angular/core';
import { PageLayoutComponent } from "../page-layout/page-layout.component";
import { HttpService } from '../../Services/Http.service';
import LayoutConfigs from './layout.config';
import GlobalUtils from '../../Services/GlobalUtils';

class Vector2 {
  X: number = 0;
  Y: number = 0;
}
class LayoutComponent {
  Type: string = 'RoundTable';
  Size: Vector2 = { X: 40, Y: 40 };
  Position: Vector2 = { X: 0, Y: 0 };

  constructor(Type: string = 'RoundTable') {
    this.Type = Type;
  }
}

@Component({
  selector: 'restaurant-layout',
  imports: [PageLayoutComponent],

  templateUrl: 'layout.component.html',
  styleUrl: 'layout.component.less'
})


export class RestaurantLayout {

  @Input() Components: LayoutComponent[] = [];

  // States
  @Input() SelectedComponent: LayoutComponent | null = null;
  @Input() DraggingComponent: LayoutComponent | null = null;
  @Input() ResizingComponent: LayoutComponent | null = null;
  @Input() ShowProperties: boolean | null = null;
  @Input() DraggingLayout: boolean = false;


  // Config
  @Input() Snapping: number = 20;


  // DOM Elements
  @ViewChild('PageLayout', { read: PageLayoutComponent }) PageLayout!: PageLayoutComponent;
  @ViewChild('MainContainer') MainContainer!: ElementRef;
  ContainerRect = this.MainContainer?.nativeElement?.getBoundingClientRect();

  // Services

  HttpService = inject(HttpService);

  // Variables
  Handles: any = ['top', 'bottom', 'left', 'right']
  RatioHandles: any = ['top-left', 'bottom-right', 'bottom-left', 'top-right']

  //Imports
  GlobalUtils = GlobalUtils
  LayoutConfigs = LayoutConfigs
  NewComponent = (Type:string) => new LayoutComponent(Type);

  DraggingStep(event: MouseEvent, DraggingComponent: LayoutComponent) {
    const Snapping = this.Snapping
    const CompSize = DraggingComponent.Size

    const ScrollXOffset = this.PageLayout?.LayoutContainer.nativeElement.scrollLeft
    const ScrollYOffset = this.PageLayout?.LayoutContainer.nativeElement.scrollTop
    
    let X = event.clientX + ScrollXOffset - this.ContainerRect.left - CompSize.X / 2
    let Y = event.clientY + ScrollYOffset - this.ContainerRect.top - CompSize.Y / 2


    let SnappedX = Math.round(X / Snapping) * Snapping
    let SnappedY = Math.round(Y / Snapping) * Snapping

    DraggingComponent.Position.X = SnappedX;
    DraggingComponent.Position.Y = SnappedY;
  }

  // Dragging Component/Layout and Resizing
  @HostListener('document:mousemove', ['$event'])
  MouseMove(event: MouseEvent) {
    const DraggingComponent = this.DraggingComponent

    if (DraggingComponent) {
      this.DraggingStep(event, DraggingComponent)
    }
  }

  // Mouse up globally
  @HostListener('document:mouseup', ['$event'])
  DragEnd(event: MouseEvent) {
    this.DraggingComponent = null;
    this.SelectedComponent = null;
  }

  // Start dragging
  DragStart(Component: LayoutComponent) {
    this.SelectedComponent = Component;
    this.DraggingComponent = Component;
  }

  // Start dragging
  ResizeStart(Component: LayoutComponent) {
    this.SelectedComponent = Component;
    this.DraggingComponent = Component;
  }

  @HostListener('document:keydown', ['$event'])
  async OnKeyPress(event: KeyboardEvent) {
    const Key = event.key
    const ControlCombo = event.ctrlKey || event.metaKey
    const ShiftCombo = event.shiftKey
    const AltCombo = event.altKey
    const SelectedComponent = this.SelectedComponent

    if (ControlCombo) {
      const ClipboardContent = await navigator.clipboard.readText()

      // COPY
      if (Key == 'c' && SelectedComponent) {
        const StringifiedComponent = JSON.stringify(SelectedComponent);
        navigator.clipboard.writeText(StringifiedComponent);

        // PASTE
      } else if (Key == 'v' && ClipboardContent) {
        const ParsedComponent = JSON.parse(ClipboardContent);
        if (ParsedComponent && ParsedComponent.Type) {
          const NewComp = new LayoutComponent();
          NewComp.Type = ParsedComponent.Type;
          NewComp.Size = { ...ParsedComponent.Size };
          NewComp.Position = { ...ParsedComponent.Position };
          this.Components.push(NewComp);
          this.SelectedComponent = NewComp;
        }

        // DUPLICATE
      } else if (AltCombo && Key == 'd' && SelectedComponent) {
        const DuplicatedComponent = this.CopyComponent(SelectedComponent);
        this.Components.push(DuplicatedComponent);
        this.SelectedComponent = DuplicatedComponent;
      }
    }
  }

  //Context menu
  ShowOptions(event: MouseEvent, component: LayoutComponent) {
    event.preventDefault();
    this.SelectedComponent = component;
  }

  CopyComponent(Component: LayoutComponent) {
    const NewComp = new LayoutComponent();
    NewComp.Type = Component.Type;
    NewComp.Size = { ...Component.Size };
    NewComp.Position = { ...Component.Position };
    return NewComp;
  }

  async ShowHandles(component: LayoutComponent) {
    await this.HttpService.wait(0.05)
    this.SelectedComponent = component;
  }

  AddComponent(component: LayoutComponent) {
    this.Components.push(component);
  }

  constructor() {
    this.AddComponent(new LayoutComponent())
  }

  ngAfterViewInit() {
    this.PageLayout.MenuCollapsed = true
    const NativeElement = this.MainContainer?.nativeElement
    this.ContainerRect = NativeElement?.getBoundingClientRect();
    //this.Container = NativeElement
  }
}

