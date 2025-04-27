import { Component, inject, HostBinding, Input, input } from '@angular/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';
@Component({
  selector: 'loading-screen',
  imports: [NzSpinModule],

  templateUrl: 'loading-screen.component.html',
  styleUrl: 'loading-screen.component.less'
})



export class LoadingScreen {
    @Input() IsLoading = false
    @Input() Unselectable = false
    @Input() Fullscreen = false
    @Input() LoaderStyle: "Modern" = "Modern"

    @HostBinding('class') get Classes(): string {
        const classes = [
            this.Unselectable ? "unselectable" : "",
            this.Fullscreen ? "fullscreen" : "",
            this.IsLoading ? "" : "invisible"
        ];

        return classes.join(' ');
    }
}

