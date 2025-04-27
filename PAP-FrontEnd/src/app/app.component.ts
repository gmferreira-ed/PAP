
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Topbar } from './Components/topbar/topbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Topbar],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
}
