import { Component, inject, HostBinding, Input, input, Output, EventEmitter, ChangeDetectorRef, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ProgressComponent } from '../progress/progress.component';
import { HttpClient, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IconsModule } from '../icon/icon.component';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'image-cropper',
  imports: [CommonModule, TranslateModule],

  templateUrl: 'image-cropper.component.html',
  styleUrl: 'image-cropper.component.less'
})


export class ImageCropperComponent {

  @Input() EditingImage: null | string = null

  @ViewChild('CropperContainer') CropperContainer!: ElementRef;
  @ViewChild('EditableImage') Image!: ElementRef;

  @Input() CropResult: null | string = null

  DragStartX = 0
  DragStartY = 0
  LastImageX = 0
  LastImageY = 0
  ImageX = 0
  ImageY = 0
  Zoom = 1

  Dragging = false

  ChangeZoom(Event: WheelEvent) {
    Event.preventDefault()
    const ZoomDelta = 1 + (Event.deltaY / 1000) * -1

    const ContainerRect = this.CropperContainer.nativeElement.getBoundingClientRect()
    const ImageRect = this.Image.nativeElement.getBoundingClientRect()


    const TargetZoom = Math.max(Math.min(this.Zoom * ZoomDelta, 5), 1)
    const TrueZoomDelta = TargetZoom - this.Zoom

    this.Zoom = TargetZoom

    const [TargetX, TargetY] = this.ClampPosition(
      this.ImageX - ContainerRect.width / 2 * TrueZoomDelta,
      this.ImageY - ContainerRect.height / 2 * TrueZoomDelta
    )

    this.ImageX = TargetX
    this.ImageY = TargetY

  }

  StartDrag(Event: MouseEvent) {
    this.DragStartX = Event.clientX
    this.DragStartY = Event.clientY
    this.LastImageX = this.ImageX
    this.LastImageY = this.ImageY
    this.Dragging = true
  }

  ClampPosition(X: number, Y: number) {
    const ContainerRect = this.CropperContainer.nativeElement.getBoundingClientRect()
    const AbsZoom = this.Zoom - 1
    const XMaxLimit = -ContainerRect.width * AbsZoom;
    const YMaxLimit = -ContainerRect.height * AbsZoom;

    return [
      Math.min(Math.max(XMaxLimit, X), 0),
      Math.min(Math.max(YMaxLimit, Y), 0)
    ]
  }

  @HostListener('document:mousemove', ['$event'])
  MouseMove(event: MouseEvent) {
    if (this.Dragging) {

      const MoveDeltaX = event.clientX - this.DragStartX
      const MoveDeltaY = event.clientY - this.DragStartY

      const [X, Y] = this.ClampPosition(
        this.LastImageX + MoveDeltaX,
        this.LastImageY + MoveDeltaY,
      )


      this.ImageX = X;
      this.ImageY = Y;
    }
  }

  // Mouse up globally
  @HostListener('document:mouseup', ['$event'])
  DragEnd(event: MouseEvent) {
    this.Dragging = false
    //this.TransformImage()
  }




  TransformImage() {

    const ContainerRect = this.CropperContainer.nativeElement.getBoundingClientRect()
    const image = this.Image.nativeElement as HTMLImageElement
    const imagerect = image.getBoundingClientRect()

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return;

    const OutputSize = 400
    const COriginalWidth = Math.min(image.naturalWidth, OutputSize)
    const COriginalHeight = Math.min(image.naturalHeight, OutputSize)
    canvas.width = COriginalWidth
    canvas.height = COriginalHeight

    const scaledWidth = COriginalWidth * this.Zoom
    const scaledHeight = COriginalHeight * this.Zoom


    const offsetX = (scaledWidth - COriginalWidth) / 2
    const offsetY = (scaledHeight - COriginalHeight) / 2

    const WidthDiff = (ContainerRect.width * this.Zoom - ContainerRect.width) / 2
    const HeightDiff = (ContainerRect.height * this.Zoom - ContainerRect.height) / 2

    const ManualOffsetX = WidthDiff + this.ImageX
    const ManualOffsetY = HeightDiff + this.ImageY

    
    ctx.drawImage(
      image,
      -offsetX + ManualOffsetX,
      -offsetY + ManualOffsetY,
      scaledWidth,
      scaledHeight
    );

    const ResultBase64 = canvas.toDataURL('image/png')
    this.CropResult = ResultBase64

    // const a = document.createElement('a')
    // a.href = dataUrl
    // a.download = 'zoomed-crop.png'
    // a.click()

    this.EditingImage = null

    this.Zoom = 1
    this.ImageX = 0
    this.ImageY = 0
    
    canvas.remove();
  }
}

