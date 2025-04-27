import { Directive, ElementRef, Renderer2, HostListener, Component, Input, ContentChild } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
    selector: 'expander-menu' ,
    templateUrl: 'expander.component.html',
    styleUrl: 'expander.component.scss',
    imports: [NzIconModule, NzButtonModule]
})

export class ExpanderComponent {
    @Input() Open = false
    ManualOpen = false

    Toggle(){
        this.Open = !this.Open
    }

    MouseLeave(){
        if (!this.ManualOpen) 
            this.Open=false
    }
}