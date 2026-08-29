import { Component } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { IconComponent } from './icon.component';

@Component({
  standalone: true,
  selector: 'app-toaster',
  imports: [IconComponent],
  template: `
    <div class="pointer-events-none fixed top-4 right-4 z-100 flex w-full max-w-sm flex-col gap-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          role="status"
          class="pointer-events-auto flex items-start gap-2.5 border bg-popover p-3 text-sm text-popover-foreground shadow-2xl"
          [class.border-emerald-500/40]="toast.kind === 'success'"
          [class.border-destructive/40]="toast.kind === 'error'"
          [class.border-brand/40]="toast.kind === 'info'"
        >
          <app-icon
            [name]="toast.kind === 'success' ? 'Check' : toast.kind === 'error' ? 'CircleAlert' : 'Lightbulb'"
            class="mt-0.5 size-4 shrink-0"
            [class.text-emerald-500]="toast.kind === 'success'"
            [class.text-destructive]="toast.kind === 'error'"
            [class.text-brand-text]="toast.kind === 'info'"
          />
          <span class="min-w-0 flex-1 leading-relaxed">{{ toast.message }}</span>
          <button
            type="button"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Dismiss notification"
            class="cursor-pointer rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <app-icon name="X" class="size-3.5" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToasterComponent {
  constructor(protected readonly toastService: ToastService) {}
}
