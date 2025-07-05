import {
  Directive,
  ElementRef,
  HostListener,
  Renderer2,
  Output,
  EventEmitter,
  Input,
  SimpleChanges,
  ViewContainerRef,
  ComponentRef
} from '@angular/core'
import { LoaderComponent } from '../Components/loader/loader.component';

function toNumber(string: string) {
  return Number(string.replace(/[^0-9.]/g, ''))
}

@Directive({
  selector: '[editable]',
  exportAs: 'editable'
})
export class EditableDirective {
  @Output() ValueChanged = new EventEmitter<string>()

  @Input('editable') onEditCallback?: ((NewValue: string) => Promise<any> | void) | string;

  @Input() IgnoreInputField: Boolean = false
  @Input() Editing: Boolean = false
  @Input() NumberOnly: Boolean = false
  @Input() Editable: Boolean = true

  private OriginalText: string = ''
  private loaderEl?: HTMLElement
  private loaderComponentRef?: ComponentRef<LoaderComponent>;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private viewContainerRef: ViewContainerRef
  ) {
    this.renderer.setAttribute(this.el.nativeElement, 'tabindex', '0')
    this.renderer.addClass(this.el.nativeElement, 'editable-field')
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    event.stopPropagation()
    this.Editing = true

    if (!this.IgnoreInputField && this.Editable) {

      this.OriginalText = this.el.nativeElement.innerText
      this.renderer.addClass(this.el.nativeElement, 'editing-content')
      this.renderer.setAttribute(this.el.nativeElement, 'contenteditable', 'true')
      this.el.nativeElement.focus()
    }
  }

  @HostListener('keydown.enter', ['$event'])
  onEnter(event: KeyboardEvent) {
    event.preventDefault()
    this.el.nativeElement.blur()
  }

  @HostListener('blur')
  onBlur() {
    this.Editing = false
    if (!this.IgnoreInputField) {
      this.FinalizeChange()
    }
  }

  private CallbackEnd(Result: any) {
    if (!Result) {
      this.el.nativeElement.innerText = this.OriginalText
    }
    this.DestroyLoader()
  }

  private FinalizeChange() {

    if (this.Editable) {
      var newValue = this.el.nativeElement.innerText.trim()
      this.renderer.removeClass(this.el.nativeElement, 'editing-content')
      this.renderer.removeAttribute(this.el.nativeElement, 'contenteditable')



      if (this.NumberOnly) {
        newValue = toNumber(newValue)
      }


      if (newValue == this.OriginalText || (this.NumberOnly && newValue == toNumber(this.OriginalText))) {
        //if (this.NumberOnly)
        this.el.nativeElement.innerText = this.OriginalText
        return
      }

      if (newValue || newValue == '') {

        this.ValueChanged.emit(newValue)

        if (this.onEditCallback && typeof (this.onEditCallback) != 'string') {
          this.showLoader()

          const CallbackResult = this.onEditCallback(newValue)
          if (CallbackResult instanceof Promise) {
            CallbackResult.then((result) => { this.CallbackEnd(result) })
          } else {
            this.CallbackEnd(CallbackResult)
          }
        }
      } else {
        this.el.nativeElement.innerText = this.OriginalText
      }
    }
  }

  private showLoader() {
    if (this.loaderComponentRef) return

    this.loaderComponentRef = this.viewContainerRef.createComponent(LoaderComponent);
    this.loaderComponentRef.instance.Loading = true;
    this.loaderComponentRef.instance.LoaderStyle = 'Spinner';
    this.renderer.insertBefore(
      this.el.nativeElement,
      this.loaderComponentRef.location.nativeElement,
      this.el.nativeElement.firstChild
    );
  }

  private DestroyLoader() {
    if (this.loaderComponentRef) {
      this.loaderComponentRef.destroy();
      this.loaderComponentRef = undefined;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['Editing'] && this.Editing) {
      this.onClick(new MouseEvent('a'))
    } else if (changes['Editable']) {
      if (this.Editable) {
        this.renderer.setAttribute(this.el.nativeElement, 'tabindex', '0')
        this.renderer.addClass(this.el.nativeElement, 'editable-field')
      } else {
        this.renderer.setAttribute(this.el.nativeElement, 'tabindex', '0')
        this.renderer.removeClass(this.el.nativeElement, 'editable-field')
      }
    }
  }
}
