import { isPlatformBrowser } from '@angular/common';
import { Directive, input, signal, effect, inject, ElementRef, PLATFORM_ID } from '@angular/core';

export type RevealDirection = 'up' | 'left' | 'right';

const DIRECTION_CLASS: Record<RevealDirection, string> = {
  up: 'reveal-up',
  left: 'reveal-left',
  right: 'reveal-right',
};

@Directive({
  standalone: true,

  selector: '[appReveal]',
  host: {
    class: 'reveal',
  },
})
export class RevealDirective {
  readonly direction = input<RevealDirection>('up');
  readonly delay = input(0);

  private readonly visible = signal(false);
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    effect(() => {
      const host = this.el.nativeElement;
      const base = DIRECTION_CLASS[this.direction()];
      host.classList.toggle(base, true);
      host.classList.toggle('reveal-visible', this.visible());
      host.style.transitionDelay = `${this.delay()}ms`;
    });

    if (isPlatformBrowser(this.platformId)) {
      this.observe();
    } else {
      this.visible.set(true);
    }
  }

  private observe(): void {
    const host = this.el.nativeElement;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.visible.set(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.visible.set(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(host);
  }
}
