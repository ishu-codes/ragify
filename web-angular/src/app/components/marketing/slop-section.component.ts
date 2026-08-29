import { Component } from '@angular/core';
import { SectionComponent, SectionHeaderComponent } from './section.component';
import { DashedPanelComponent } from './dashed-panel.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { QuoteFlickerComponent } from './quote-flicker.component';
import { SLOP_COPY } from './sections';

@Component({
  standalone: true,

  selector: 'app-slop-section',
  imports: [SectionComponent, SectionHeaderComponent, DashedPanelComponent, RevealDirective, QuoteFlickerComponent],
  template: `
    <app-section class="bg-muted/20">
      <app-section-header class="mx-auto text-center">{{ copy.heading }}</app-section-header>

      <div class="mt-14 grid gap-6 lg:grid-cols-2">
        <div appReveal direction="left">
          <app-dashed-panel class="flex h-full flex-col bg-card p-6 sm:p-8">
            <div class="flex items-center justify-between">
              <span class="font-mono text-xs uppercase tracking-widest text-muted-foreground">{{ copy.without.label }}</span>
              <div class="flex gap-1.5">
                @for (badge of copy.without.badges; track badge) {
                  <span class="rounded-full border border-border bg-muted px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {{ badge }}
                  </span>
                }
              </div>
            </div>
            <p class="mt-6 text-sm leading-relaxed text-muted-foreground sm:text-base">{{ copy.without.answer }}</p>
          </app-dashed-panel>
        </div>

        <div appReveal direction="right" [delay]="100">
          <app-dashed-panel class="flex h-full flex-col bg-card p-6 ring-1 ring-brand/30 sm:p-8">
            <div class="flex items-center justify-between">
              <span class="font-mono text-xs uppercase tracking-widest text-brand-text">{{ copy.with.label }}</span>
              <div class="flex gap-1.5">
                @for (badge of copy.with.badges; track badge) {
                  <span class="rounded-full border border-brand/30 bg-brand/10 px-2.5 py-0.5 font-mono text-[10px] text-brand-text">
                    {{ badge }}
                  </span>
                }
              </div>
            </div>
            <app-quote-flicker [text]="copy.with.answer" class="mt-6 text-sm text-foreground sm:text-base" />
          </app-dashed-panel>
        </div>
      </div>
    </app-section>
  `,
})
export class SlopSectionComponent {
  readonly copy = SLOP_COPY;
}
