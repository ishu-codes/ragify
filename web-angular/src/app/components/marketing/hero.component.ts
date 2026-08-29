import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NoiseOverlayComponent } from './noise-overlay.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { ANNOUNCEMENT_STRIP, HERO_COPY } from './sections';
import { PillLinkComponent } from './pill.component';
import { IconComponent } from '../shared/icon.component';

@Component({
  standalone: true,

  selector: 'app-hero',
  imports: [RouterLink, NoiseOverlayComponent, RevealDirective, PillLinkComponent, IconComponent],
  template: `
    <section class="relative mt-[84px] border border-border border-b-0 bg-background">
      <app-noise-overlay />

      <div class="relative z-10 flex items-center justify-between border-b border-border px-4 py-3 text-xs sm:px-6 sm:text-sm">
        <a href="#pricing" class="flex items-center gap-2 text-foreground/80 transition-colors hover:text-foreground">
          <span class="size-2 rounded-full bg-brand" aria-hidden="true"></span>
          <span class="underline decoration-foreground/40 underline-offset-2 hover:decoration-foreground">
            {{ announcement.left }}
          </span>
        </a>
        <div class="hidden items-center gap-4 text-foreground/60 lg:flex">
          @for (item of announcement.right; track item.label) {
            <span class="whitespace-nowrap inline-flex gap-1">
              <span class="text-muted-foreground">{{ item.label }}</span>
              <span class="font-mono font-semibold tabular-nums text-foreground">{{ item.value }}</span>
            </span>
          }
        </div>
      </div>

      <div class="relative z-10 grid grid-cols-1 gap-0 px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div class="grid grid-cols-10 gap-0">
          @for (col of dashColumns; track col) {
            <div class="col-span-1 dash-right hidden sm:block"></div>
          }
          <div class="col-span-1"></div>
        </div>

        <div appReveal direction="up">
          <div class="mx-auto max-w-4xl text-center">
            <p class="font-mono text-xs uppercase tracking-widest text-muted-foreground">{{ hero.kicker }}</p>
            <h1 class="mt-4 text-4xl font-semibold tracking-tighter text-balance sm:text-5xl lg:text-7xl">
              {{ hero.headline1 }}
              <br />
              {{ hero.headline2 }}
            </h1>
            <p class="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {{ hero.subhead }}
            </p>

            <div class="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a appPill routerLink="/sign-up" class="font-mono text-sm sm:text-base">
                {{ hero.primary.label }}
                <app-icon name="ArrowRight" class="size-4" />
              </a>
              <a appPill [outline]="true" href="#features">{{ hero.secondary.label }}</a>
            </div>
          </div>
        </div>

        <div class="mt-16 grid grid-cols-10 gap-0">
          @for (col of dashColumns; track col) {
            <div class="col-span-1 dash-right hidden sm:block"></div>
          }
          <div class="col-span-1"></div>
        </div>
      </div>
    </section>
  `,
})
export class HeroComponent {
  readonly announcement = ANNOUNCEMENT_STRIP;
  readonly hero = HERO_COPY;
  readonly dashColumns = [0, 1, 2, 3, 4, 5, 6, 7, 8];
}
