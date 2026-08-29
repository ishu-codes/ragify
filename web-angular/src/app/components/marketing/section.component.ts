import { Component, input } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  standalone: true,

  selector: 'app-section',
  template: `
    <section [id]="id()" [class]="'relative border-b border-border py-20 lg:py-28 ' + class()">
      <div class="container relative z-10">
        <ng-content />
      </div>
    </section>
  `,
})
export class SectionComponent {
  readonly id = input('');
  readonly class = input('');
}

@Component({
  standalone: true,

  selector: 'app-section-header',
  template: `
    <div appReveal [class]="'max-w-2xl space-y-4 ' + class()">
      @if (kicker()) {
        <p class="font-mono text-xs uppercase tracking-widest text-muted-foreground">{{ kicker() }}</p>
      }
      <h2 class="text-3xl font-semibold tracking-tighter text-balance sm:text-4xl lg:text-5xl">
        <ng-content />
      </h2>
      @if (subhead()) {
        <p class="text-base leading-relaxed text-muted-foreground sm:text-lg">{{ subhead() }}</p>
      }
    </div>
  `,
})
export class SectionHeaderComponent {
  readonly kicker = input('');
  readonly subhead = input('');
  readonly class = input('');
}
