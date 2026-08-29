import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionComponent, SectionHeaderComponent } from './section.component';
import { DashedPanelComponent } from './dashed-panel.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { PillLinkComponent } from './pill.component';
import { IconComponent } from '../shared/icon.component';
import { PRICING, PRICING_COPY } from './sections';

@Component({
  standalone: true,

  selector: 'app-plans-pricing',
  imports: [RouterLink, SectionComponent, SectionHeaderComponent, DashedPanelComponent, RevealDirective, PillLinkComponent, IconComponent],
  template: `
    <app-section id="pricing" class="bg-muted/20">
      <app-section-header [subhead]="copy.subhead">{{ copy.heading }}</app-section-header>

      <div class="mt-14 grid gap-6 md:grid-cols-3">
        @for (plan of plans; track plan.name; let index = $index) {
          <div appReveal [delay]="index * 80" class="h-full">
            <app-dashed-panel
              [class]="'relative flex h-full flex-col bg-card p-7' + (plan.highlight ? ' ring-1 ring-brand/50' : '')"
            >
              @if (plan.highlight) {
                <span
                  class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-foreground"
                >
                  Most popular
                </span>
              }

              <h3 class="text-lg font-semibold tracking-tight">{{ plan.name }}</h3>
              <p class="mt-1 text-sm text-muted-foreground">{{ plan.description }}</p>

              <div class="mt-6 flex items-baseline gap-1.5">
                <span class="font-mono text-4xl font-semibold tracking-tight tabular-nums">{{ plan.price }}</span>
                @if (plan.period) {
                  <span class="text-sm text-muted-foreground">{{ plan.period }}</span>
                }
              </div>

              <ul class="mt-7 flex-1 space-y-3">
                @for (feature of plan.features; track feature) {
                  <li class="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <app-icon name="Check" class="mt-0.5 size-4 shrink-0 text-brand-text" />
                    {{ feature }}
                  </li>
                }
              </ul>

              <div class="mt-8">
                <a appPill [outline]="!plan.highlight" routerLink="/sign-up" [queryParams]="plan.name === 'Free' ? undefined : { plan: plan.name.toLowerCase() }" class="w-full justify-center">
                  {{ plan.cta }}
                </a>
              </div>
            </app-dashed-panel>
          </div>
        }
      </div>
    </app-section>
  `,
})
export class PlansPricingComponent {
  readonly copy = PRICING_COPY;
  readonly plans = PRICING;
}
