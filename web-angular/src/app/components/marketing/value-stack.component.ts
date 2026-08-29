import { Component } from '@angular/core';
import { SectionComponent, SectionHeaderComponent } from './section.component';
import { DashedPanelComponent } from './dashed-panel.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { VALUE_PROPS, VALUE_STACK_COPY } from './sections';

@Component({
  standalone: true,

  selector: 'app-value-stack',
  imports: [SectionComponent, SectionHeaderComponent, DashedPanelComponent, RevealDirective],
  template: `
    <app-section class="bg-background">
      <app-section-header>{{ copy.heading }}</app-section-header>

      <div class="mt-14 grid gap-6 sm:grid-cols-3">
        @for (stat of stats; track stat.label; let index = $index) {
          <div appReveal [delay]="index * 80">
            <app-dashed-panel class="flex flex-col items-center bg-card p-8 text-center">
              <span class="font-mono text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">{{ stat.value }}</span>
              <span class="mt-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">{{ stat.label }}</span>
            </app-dashed-panel>
          </div>
        }
      </div>
    </app-section>
  `,
})
export class ValueStackComponent {
  readonly copy = VALUE_STACK_COPY;
  readonly stats = VALUE_PROPS;
}
