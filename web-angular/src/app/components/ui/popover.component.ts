import { isPlatformBrowser } from '@angular/common';
import { Component, effect, inject, input, model, PLATFORM_ID, ElementRef } from '@angular/core';

@Component({
  standalone: true,

  selector: 'app-popover',
  template: `
    <div class="relative inline-flex">
      <ng-content select="[popoverTrigger]" />
    </div>
    @if (open()) {
      <div
        class="fixed z-50 flex w-72 flex-col gap-4 rounded-2xl border bg-popover p-3 text-sm text-popover-foreground shadow-2xl ring-1 ring-foreground/5"
        [style]="positionStyle"
        (click)="$event.stopPropagation()"
      >
        <ng-content select="[popoverContent]" />
      </div>
    }
  `,
})
export class PopoverComponent {
  readonly open = model(false);
  readonly align = input<'start' | 'center' | 'end'>('center');

  positionStyle: { top: string; right: string; left: string } = { top: '0px', right: 'auto', left: '0px' };

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      if (this.open()) {
        this.positionPopover();
        const onKey = (event: KeyboardEvent): void => {
          if (event.key === 'Escape') {
            this.open.set(false);
          }
        };
        const onClick = (event: MouseEvent): void => {
          if (!this.host.nativeElement.contains(event.target as Node)) {
            this.open.set(false);
          }
        };
        document.addEventListener('keydown', onKey);
        document.addEventListener('mousedown', onClick);
        return () => {
          document.removeEventListener('keydown', onKey);
          document.removeEventListener('mousedown', onClick);
        };
      }
      return undefined;
    });
  }

  private positionPopover(): void {
    const trigger = this.host.nativeElement.firstElementChild as HTMLElement | null;
    if (!trigger) {
      return;
    }
    const rect = trigger.getBoundingClientRect();
    this.positionStyle = {
      top: `${rect.bottom + 4}px`,
      right: this.align() === 'end' ? `${Math.max(0, window.innerWidth - rect.right)}px` : 'auto',
      left: this.align() === 'end' ? 'auto' : `${rect.left}px`,
    };
  }
}
