import { Component, input } from '@angular/core';

@Component({
  standalone: true,

  selector: 'app-avatar',
  template: `
    @if (image(); as src) {
      <img [src]="src" [alt]="alt()" class="aspect-square size-full rounded-full object-cover" />
    } @else {
      <span class="flex size-full items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand-text">
        {{ fallback() }}
      </span>
    }
  `,
  host: {
    class: 'relative flex size-8 shrink-0 overflow-hidden rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten',
  },
})
export class AvatarComponent {
  readonly image = input<string | null | undefined>(null);
  readonly alt = input('');
  readonly fallback = input('U');
}
