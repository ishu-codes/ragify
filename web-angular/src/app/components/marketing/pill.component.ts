import { Component, computed, input } from '@angular/core';

@Component({
  standalone: true,

  selector: 'a[appPill]',
  template: '<ng-content />',
  host: {
    '[class]': 'allClasses()',
  },
})
export class PillLinkComponent {
  readonly outline = input(false);
  readonly to = input<string | null>(null);
  readonly href = input<string | null>(null);

  readonly allClasses = computed(() => {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-[100px] duration-300 font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring px-5 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base';
    const variant = this.outline()
      ? 'border border-input bg-transparent text-foreground shadow hover:bg-muted/80'
      : 'bg-brand text-brand-foreground shadow hover:bg-brand/85';
    return `${base} ${variant}`;
  });
}
