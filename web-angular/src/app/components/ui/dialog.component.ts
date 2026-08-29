import { isPlatformBrowser } from '@angular/common';
import { Component, effect, inject, input, model, PLATFORM_ID } from '@angular/core';

@Component({
  standalone: true,

  selector: 'app-dialog',
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 bg-black/80" (click)="close()" aria-hidden="true"></div>
      <div
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="ariaLabel() || undefined"
        class="fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 border bg-background p-6 shadow-lg"
      >
        <ng-content />
      </div>
    }
  `,
})
export class DialogComponent {
  readonly open = model(false);
  readonly ariaLabel = input('');

  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      if (this.open()) {
        const onKey = (event: KeyboardEvent): void => {
          if (event.key === 'Escape') {
            this.close();
          }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
      }
      return undefined;
    });
  }

  close(): void {
    this.open.set(false);
  }
}
