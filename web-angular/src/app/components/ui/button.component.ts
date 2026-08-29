import { Component, computed, input } from '@angular/core';

export type ButtonVariant =
  | 'default'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'destructive'
  | 'link'
  | 'pill'
  | 'outlinePill';

export type ButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'pill' | 'pillLg' | 'icon' | 'iconSm' | 'iconLg';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/80',
  outline: 'border-border bg-input/30 hover:bg-input/50 hover:text-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-muted hover:text-foreground',
  destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
  link: 'text-primary underline-offset-4 hover:underline',
  pill: 'bg-brand text-brand-foreground hover:bg-brand/85 shadow duration-300 rounded-[100px] font-medium',
  outlinePill: 'border border-input! bg-transparent text-foreground rounded-[100px] shadow hover:bg-muted/80 duration-300 font-medium',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  default: 'h-9 gap-1.5 px-3',
  xs: 'h-6 gap-1 px-2.5 text-xs',
  sm: 'h-8 gap-1 px-3',
  lg: 'h-10 gap-1.5 px-4',
  pill: 'h-10 gap-2 px-6 sm:px-[20px]',
  pillLg: 'h-12 gap-2 px-7 text-base sm:px-[24px]',
  icon: 'size-9',
  iconSm: 'size-8',
  iconLg: 'size-10',
};

@Component({
  standalone: true,
  selector: 'button[appButton], a[appButton]',
  template: '<ng-content />',
  host: {
    '[class]': 'allClasses()',
  },
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('default');
  readonly size = input<ButtonSize>('default');

  readonly allClasses = computed(() => {
    const base =
      'group/button inline-flex shrink-0 items-center justify-center border border-transparent text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50';
    return `${base} ${VARIANT_CLASS[this.variant()]} ${SIZE_CLASS[this.size()]}`;
  });
}
