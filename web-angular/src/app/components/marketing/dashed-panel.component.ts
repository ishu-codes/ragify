import { Component, input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-dashed-panel',
  template: `
    <div class="dashed-panel" [class]="class()">
      <ng-content />
    </div>
  `,
})
export class DashedPanelComponent {
  readonly class = input<string>('');
}
