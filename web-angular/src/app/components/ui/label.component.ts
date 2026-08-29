import { Component } from '@angular/core';

@Component({
  standalone: true,

  selector: 'label[appLabel]',
  template: '<ng-content />',
  host: {
    class: 'font-bold text-xs uppercase text-muted-foreground',
  },
})
export class LabelComponent {}
