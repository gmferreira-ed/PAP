import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, HostBinding, Input, input } from '@angular/core';
import { LoaderComponent } from '../loader/loader.component';
@Component({
    selector: 'loading-screen',
    imports: [LoaderComponent, NgTemplateOutlet],

    templateUrl: 'loading-screen.component.html',
    styleUrl: 'loading-screen.component.less'
})



export class LoadingScreen {
    @Input() IsLoading = false
    @Input() Unselectable = false
    @Input() Fullscreen = false
    @Input() ShowContainer = false
    @Input() LoaderStyle: "Squares" | "ThinkingDots" | "Spinner" = "Squares"

    @Input() ShowBackground = true;

    @HostBinding('class.nobackground')
    get NoBackground(): boolean {
        return !this.ShowBackground
    }

    @HostBinding('class') get Classes(): string {
        const classes = [
            this.Unselectable ? "unselectable" : "",
            this.Fullscreen ? "fullscreen" : "",
            this.IsLoading ? "" : "invisible"
        ];

        return classes.join(' ');
    }
}

