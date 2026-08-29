import { Component } from '@angular/core';
import { SectionComponent, SectionHeaderComponent } from './section.component';
import { DashedPanelComponent } from './dashed-panel.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { EXPLAINER_COPY } from './sections';

@Component({
  standalone: true,
  selector: 'app-ragify-explainer',
  imports: [SectionComponent, SectionHeaderComponent, DashedPanelComponent, RevealDirective],
  template: `
    <app-section id="features" class="bg-background">
      <app-section-header [subhead]="copy.subhead">{{ copy.heading }}</app-section-header>

      <div class="mt-14 grid gap-0">
        @for (item of copy.items; track item.num; let index = $index) {
          <div appReveal [delay]="index * 60">
            <app-dashed-panel
              class="w-full group flex flex-col gap-4 bg-card transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between box-border p-6"
            >
              <div class="flex items-start gap-5 sm:items-center">
                <span class="font-mono text-sm font-semibold text-brand-text">{{ item.num }}</span>
                <div>
                  <h3 class="text-base font-semibold tracking-tight sm:text-lg">{{ item.title }}</h3>
                  <p class="mt-1 text-sm leading-relaxed text-muted-foreground">{{ item.description }}</p>
                </div>
              </div>
              <code class="font-mono text-xs text-muted-foreground/80 sm:text-sm">{{ item.command }}</code>
            </app-dashed-panel>
          </div>
        }
      </div>
    </app-section>
  `,
})
export class RagifyExplainerComponent {
  readonly copy = EXPLAINER_COPY;
}
