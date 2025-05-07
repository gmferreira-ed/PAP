
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Topbar } from './Components/topbar/topbar.component';
import { ThemeService } from './Services/Theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Topbar],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  ThemeService = inject(ThemeService)
}
