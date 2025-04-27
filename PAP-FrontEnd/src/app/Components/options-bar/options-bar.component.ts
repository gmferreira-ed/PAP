import { Component, inject, HostBinding, Input, input, Output, EventEmitter } from '@angular/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';



interface Option {
  label:string,
  value:string,
  active:boolean,
  status:string
}

@Component({
  selector: 'options-bar',
  imports: [NzSpinModule, NzToolTipModule],

  templateUrl: 'options-bar.component.html',
  styleUrl: 'options-bar.component.less'
})


export class OptionsBar {

  private _Options:Option[] = []

   @Input() 
   get Options(): Option[]{
    return this._Options
   }
   set Options(NewOptions:Option[]){
      this._Options = NewOptions
      this.OptionsChanged.emit(NewOptions)
   }

   // VARIABLES

   @Input() Loading = false
   @Input() SelectedOption:any = null
   @Input() UnselectableDisabledOptions:any = true

   // EVENTS
   
   @Output() OptionsChanged = new EventEmitter();     
   @Output() SelectionChanged = new EventEmitter();      
   
   
   // METHODS

   SelectFirstValidOption():boolean|Option{
    for (let Option of this.Options){
        if (Option.active){
          this.SelectedOption = Option
          return Option
        }
    }
    return false
   }

   ChangeSelection(TargetOption:any){
    if (TargetOption.active || !this.UnselectableDisabledOptions){
      TargetOption.selected = true
      this.SelectedOption = TargetOption
      this.SelectionChanged.emit(TargetOption.value)
    }
   }
}

