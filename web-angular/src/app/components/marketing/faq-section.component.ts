import { Component, signal } from '@angular/core';
import { SectionComponent, SectionHeaderComponent } from './section.component';
import { DashedPanelComponent } from './dashed-panel.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { IconComponent } from '../shared/icon.component';
import { FAQ_COPY, FAQ_ITEMS } from './sections';

@Component({
  standalone: true,

  selector: 'app-faq-section',
  imports: [SectionComponent, SectionHeaderComponent, DashedPanelComponent, RevealDirective, IconComponent],
  template: `
    <app-section class="bg-muted/20">
      <app-section-header class="mx-auto text-center">{{ copy.heading }}</app-section-header>

      <div class="mx-auto mt-14 max-w-3xl space-y-3">
        @for (faq of items; track faq.q; let index = $index) {
          <div appReveal [delay]="index * 40">
            <app-dashed-panel class="bg-card">
              <button
                type="button"
                (click)="toggle(index)"
                [attr.aria-expanded]="openIndex() === index"
                class="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium transition-colors hover:bg-muted/30 sm:px-6 sm:py-5"
              >
                {{ faq.q }}
                <app-icon
                  name="ChevronDown"
                  [class]="
                    'size-4 shrink-0 transition-transform duration-200 ' +
                    (openIndex() === index ? 'rotate-180 text-brand-text' : 'text-muted-foreground')
                  "
                />
              </button>
              @if (openIndex() === index) {
                <div class="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground sm:px-6">
                  {{ faq.a }}
                </div>
              }
            </app-dashed-panel>
          </div>
        }
      </div>
    </app-section>
  `,
})
export class FaqSectionComponent {
  readonly copy = FAQ_COPY;
  readonly items = FAQ_ITEMS;
  readonly openIndex = signal<number | null>(0);

  toggle(index: number): void {
    this.openIndex.update((current) => (current === index ? null : index));
  }
}
