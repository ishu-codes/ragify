import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionComponent } from './section.component';
import { DashedPanelComponent } from './dashed-panel.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { PillLinkComponent } from './pill.component';
import { NoiseOverlayComponent } from './noise-overlay.component';
import { SECONDARY_CTA } from './sections';

@Component({
  standalone: true,

  selector: 'app-secondary-cta',
  imports: [RouterLink, SectionComponent, DashedPanelComponent, RevealDirective, PillLinkComponent, NoiseOverlayComponent],
  template: `
    <app-section class="bg-muted/20">
      <div appReveal>
        <app-dashed-panel class="relative overflow-hidden bg-card px-6 py-16 text-center sm:px-12 lg:py-24">
          <app-noise-overlay />
          <div class="relative z-10 mx-auto max-w-xl space-y-5">
            <h2 class="text-3xl font-semibold tracking-tighter text-balance sm:text-4xl lg:text-5xl">
              {{ cta.heading }}
            </h2>
            <p class="text-base leading-relaxed text-muted-foreground sm:text-lg">{{ cta.subhead }}</p>
            <div class="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
              <a appPill routerLink="/sign-up">{{ cta.primary.label }}</a>
              <a appPill [outline]="true" routerLink="/sign-in">{{ cta.secondary.label }}</a>
            </div>
          </div>
        </app-dashed-panel>
      </div>
    </app-section>
  `,
})
export class SecondaryCtaComponent {
  readonly cta = SECONDARY_CTA;
}
