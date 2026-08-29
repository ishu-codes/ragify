import { Component } from '@angular/core';
import { SectionComponent, SectionHeaderComponent } from './section.component';
import { DashedPanelComponent } from './dashed-panel.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { LATEST_FEED, LATEST_FEED_COPY, type ChangelogEntry } from './sections';

const TYPE_COLOR: Record<ChangelogEntry['type'], string> = {
  feature: 'border-brand/30 bg-brand/10 text-brand-text',
  fix: 'border-warning/30 bg-warning/10 text-warning',
  breaking: 'border-destructive/30 bg-destructive/10 text-destructive',
};

@Component({
  standalone: true,

  selector: 'app-latest-feed',
  imports: [SectionComponent, SectionHeaderComponent, DashedPanelComponent, RevealDirective],
  template: `
    <app-section id="changelog" class="bg-background">
      <app-section-header [subhead]="copy.subhead">{{ copy.heading }}</app-section-header>

      <div class="mt-14 space-y-3">
        @for (entry of entries; track entry.version; let index = $index) {
          <div appReveal [delay]="index * 50">
            <app-dashed-panel
              class="flex flex-col gap-3 bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div class="flex items-center gap-4">
                <span class="rounded-full border border-border bg-muted px-3 py-1 font-mono text-xs font-semibold text-foreground">
                  {{ entry.version }}
                </span>
                <span class="text-sm font-medium text-foreground sm:text-base">{{ entry.title }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="font-mono text-xs text-muted-foreground">{{ entry.date }}</span>
                <span
                  class="rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest"
                  [class]="typeColor(entry.type)"
                >
                  {{ entry.type }}
                </span>
              </div>
            </app-dashed-panel>
          </div>
        }
      </div>
    </app-section>
  `,
})
export class LatestFeedComponent {
  readonly copy = LATEST_FEED_COPY;
  readonly entries = LATEST_FEED;

  typeColor(type: ChangelogEntry['type']): string {
    return TYPE_COLOR[type];
  }
}
