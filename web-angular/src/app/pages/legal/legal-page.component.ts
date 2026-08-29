import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashedPanelComponent } from '../../components/marketing/dashed-panel.component';
import { ButtonComponent } from '../../components/ui/button.component';
import { IconComponent } from '../../components/shared/icon.component';

@Component({
  standalone: true,

  selector: 'app-legal-page',
  imports: [RouterLink, DashedPanelComponent, ButtonComponent, IconComponent],
  template: `
    <div class="min-h-dvh bg-background py-12">
      <div class="container max-w-3xl">
        <div class="mb-8 flex items-center justify-between">
          <a appButton variant="ghost" size="sm" routerLink="/" class="gap-2">
            <app-icon name="ArrowLeft" class="size-4" />
            Back to home
          </a>
          <div class="flex size-10 items-center justify-center bg-brand/10 text-brand-text ring-1 ring-brand/20">
            <app-icon [name]="icon()" class="size-5" />
          </div>
        </div>

        <app-dashed-panel class="bg-card p-8 sm:p-12">
          <div class="space-y-10">
            <header class="space-y-3">
              <h1 class="text-3xl font-semibold tracking-tight">{{ title() }}</h1>
              <p class="font-mono text-xs text-muted-foreground">{{ meta() }}</p>
            </header>
            <ng-content />
            <footer class="border-t pt-6">
              <p class="text-center text-xs text-muted-foreground">{{ footer() }}</p>
            </footer>
          </div>
        </app-dashed-panel>
      </div>
    </div>
  `,
})
export class LegalPageComponent {
  readonly title = input('');
  readonly meta = input('');
  readonly footer = input('');
  readonly icon = input<'Shield' | 'FileText'>('Shield');
}
