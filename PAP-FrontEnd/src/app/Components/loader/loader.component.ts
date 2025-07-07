import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, HostBinding, Input, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'loader',
    imports: [NgTemplateOutlet, TranslateModule],

    templateUrl: 'loader.component.html',
    styleUrl: 'loader.component.less'
})



export class LoaderComponent {
    @Input() Loading = false
    @Input() LoaderStyle: "Squares" | "ThinkingDots" | "Spinner" = "Squares"


    @HostBinding('style.display') get displayStyle() {
        return this.Loading ? 'inline-block' : 'none';
    }
}

