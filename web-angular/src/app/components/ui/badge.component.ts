import { Component, computed, input } from '@angular/core';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  destructive: 'bg-destructive/10 text-destructive',
  outline: 'border-border bg-input/30 text-foreground',
  ghost: 'hover:bg-muted hover:text-muted-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
};

@Component({
  standalone: true,

  selector: 'span[appBadge]',
  template: '<ng-content />',
  host: {
    '[class]': 'allClasses()',
  },
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');

  readonly allClasses = computed(() => {
    const base =
      'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all';
    return `${base} ${VARIANT_CLASS[this.variant()]}`;
  });
}
