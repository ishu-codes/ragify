import { isPlatformBrowser } from '@angular/common';
import { Component, input, signal, inject, effect, PLATFORM_ID } from '@angular/core';

@Component({
  standalone: true,

  selector: 'app-quote-flicker',
  template: `
    <p [class]="'leading-relaxed ' + class()">
      {{ text().slice(0, visibleChars()) }}
      @if (visibleChars() < text().length) {
        <span class="ml-0.5 inline-block h-4 w-2 animate-pulse bg-foreground align-middle"></span>
      }
    </p>
  `,
})
export class QuoteFlickerComponent {
  readonly text = input.required<string>();
  readonly class = input('');

  readonly visibleChars = signal(0);

  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    effect(() => {
      const fullText = this.text();
      this.visibleChars.set(0);
      if (!isPlatformBrowser(this.platformId)) {
        this.visibleChars.set(fullText.length);
        return;
      }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.visibleChars.set(fullText.length);
        return;
      }
      let i = 0;
      const interval = window.setInterval(() => {
        i += 1;
        this.visibleChars.set(i);
        if (i >= fullText.length) {
          window.clearInterval(interval);
        }
      }, 12);
      return () => window.clearInterval(interval);
    });
  }
}
