import { Component } from '@angular/core';

@Component({
  standalone: true,

  selector: 'app-noise-overlay',
  template: '',
  host: {
    class: 'noise-overlay',
    'aria-hidden': 'true',
  },
})
export class NoiseOverlayComponent {}
