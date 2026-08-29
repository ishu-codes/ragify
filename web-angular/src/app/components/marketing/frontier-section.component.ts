import { Component } from '@angular/core';
import { SectionComponent, SectionHeaderComponent } from './section.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { TerminalMockupComponent } from './terminal-mockup.component';
import { FRONTIER_COPY } from './sections';

@Component({
  standalone: true,

  selector: 'app-frontier-section',
  imports: [SectionComponent, SectionHeaderComponent, RevealDirective, TerminalMockupComponent],
  template: `
    <app-section id="demo" class="bg-background">
      <div class="grid items-center gap-12 lg:grid-cols-2">
        <app-section-header [subhead]="copy.subhead">{{ copy.heading }}</app-section-header>
        <div appReveal direction="right" [delay]="120">
          <app-terminal-mockup />
        </div>
      </div>
    </app-section>
  `,
})
export class FrontierSectionComponent {
  readonly copy = FRONTIER_COPY;
}
