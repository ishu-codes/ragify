import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToasterComponent } from './components/shared/toaster.component';

@Component({
  standalone: true,

  imports: [RouterOutlet, ToasterComponent],
  selector: 'app-root',
  template: `
    <router-outlet />
    <app-toaster />
  `,
})
export class App {}
