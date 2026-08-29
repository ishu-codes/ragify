import { isPlatformBrowser } from '@angular/common';
import { Component, signal, inject, effect, PLATFORM_ID } from '@angular/core';
import { TERMINAL_DEMO } from './sections';

@Component({
  standalone: true,

  selector: 'app-terminal-mockup',
  template: `
    <div class="relative overflow-hidden border border-border bg-card font-mono text-xs sm:text-sm">
      <div class="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <span class="size-2.5 rounded-full bg-[#ff5f57]"></span>
        <span class="size-2.5 rounded-full bg-[#febc2e]"></span>
        <span class="size-2.5 rounded-full bg-[#28c840]"></span>
        <span class="ml-2 text-muted-foreground">terminal</span>
      </div>
      <div class="p-4 sm:p-5">
        <div class="text-muted-foreground">
          <span class="text-brand-text">$</span> {{ demo.command }}
        </div>
        <div class="mt-1 text-muted-foreground/80">{{ demo.body }}</div>
        <div class="mt-4 transition-opacity duration-500" [class.opacity-0]="step() < 1" [class.opacity-100]="step() >= 1">
          <span class="text-muted-foreground">// [Thinking]</span>
        </div>
        <pre
          class="mt-2 overflow-x-auto whitespace-pre-wrap text-foreground transition-opacity duration-700"
          [class.opacity-0]="step() < 2"
          [class.opacity-100]="step() >= 2"
        >{{ demo.response }}</pre>
      </div>
    </div>
  `,
})
export class TerminalMockupComponent {
  readonly demo = TERMINAL_DEMO;
  readonly step = signal(0);

  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) {
        this.step.set(2);
        return;
      }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.step.set(2);
        return;
      }
      this.step.set(0);
      const timers: ReturnType<typeof setTimeout>[] = [];
      timers.push(setTimeout(() => this.step.set(1), 600));
      timers.push(setTimeout(() => this.step.set(2), 1800));
      return () => timers.forEach((timer) => clearTimeout(timer));
    });
  }
}
