import { Component, input } from '@angular/core';

@Component({
  standalone: true,

  selector: 'app-skeleton',
  template: '',
  host: {
    class: 'animate-pulse rounded-xl bg-muted',
  },
})
export class SkeletonComponent {
  readonly class = input('animate-pulse rounded-xl bg-muted');
}
