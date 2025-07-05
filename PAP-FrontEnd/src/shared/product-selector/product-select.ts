import { HttpClient } from '@angular/common/http';
import { Component, inject, HostBinding, Input, input, Output, EventEmitter, ElementRef } from '@angular/core';
import { MenuService } from '../../app/Services/menu.service';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { FormsModule } from '@angular/forms';
import { LoadingScreen } from '../../app/Components/loading-screen/loading-screen.component';
import { IconsModule } from '../../app/Components/icon/icon.component';
import { TranslateModule } from '@ngx-translate/core';




@Component({
  selector: 'menu-product-select',
  imports: [NzInputModule, NzRadioModule, NzIconModule, FormsModule, LoadingScreen, IconsModule, TranslateModule],

  templateUrl: 'product-select.html',
  styleUrl: 'product-select.less'
})


export class MenuProductSelect {
  // Component variables
  @Input() CanSelect = true
  @Output() ProductSelected = new EventEmitter<any>()

  //Services
  MenuService = inject(MenuService)

  // Varaibles
  SelectedCategory:string = 'All'
  
  MenuProducts:any[] = []

   GetFilteredMenuProducts(){
    if (this.SelectedCategory != 'All'){
      return this.MenuProducts.filter((Product:any)=>Product.category == this.SelectedCategory)
    }else{
      return this.MenuProducts
    }
  }

  async ngOnInit(){
    this.MenuProducts = await this.MenuService.MenuProducts.Get()

    this.MenuService.GetCategories()
  }
}

