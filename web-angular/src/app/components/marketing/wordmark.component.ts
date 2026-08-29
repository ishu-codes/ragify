import { Component, computed, input } from '@angular/core';

type WordmarkSize = 'sm' | 'md' | 'lg';

const HEIGHTS: Record<WordmarkSize, number> = { sm: 18, md: 24, lg: 32 };
const FONT_SIZES: Record<WordmarkSize, string> = { sm: '0.875rem', md: '1.125rem', lg: '1.5rem' };

@Component({
  standalone: true,

  selector: 'app-wordmark',
  template: `
    <span
      class="inline-flex items-baseline gap-0 font-sans font-semibold tracking-tight text-foreground select-none"
      [style.height.px]="height()"
      [style.font-size]="fontSize()"
      [style.line-height]="'1'"
      aria-label="Ragify"
    >
      <span class="font-mono text-brand-text">//</span>
      <span>ragify</span>
    </span>
  `,
})
export class WordmarkComponent {
  readonly size = input<WordmarkSize>('md');

  readonly height = computed(() => HEIGHTS[this.size()]);
  readonly fontSize = computed(() => FONT_SIZES[this.size()]);
}
