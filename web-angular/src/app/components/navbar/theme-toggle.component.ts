import { isPlatformBrowser } from '@angular/common';
import { Component, signal, inject, effect, PLATFORM_ID } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { IconComponent } from '../shared/icon.component';

@Component({
  standalone: true,
  selector: 'app-theme-toggle',
  imports: [IconComponent],
  styles: `.invisible { scale:0; rotate:-90deg; }`,
  template: `
    <button
      type="button"
      (click)="toggle()"
      aria-label="Toggle theme"
      class="relative inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      @if (mounted()) {
        <app-icon
          name="Sun"
          class="size-[1.2rem] transition-all"
          [class.invisible]="currentTheme() !== 'light'"
        />
        <app-icon
          name="Moon"
          class="absolute size-[1.2rem] transition-all"
          [class.invisible]="currentTheme() !== 'dark'"
        />
        <app-icon
          name="Monitor"
          class="absolute size-[1.2rem] transition-all"
          [class.invisible]="currentTheme() !== 'system'"
        />
      } @else {
        <span class="size-[1.2rem]"></span>
      }
    </button>
  `,
})
export class ThemeToggleComponent {
  readonly mounted = signal(false);

  private readonly themeService = inject(ThemeService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly currentTheme = this.themeService.theme;

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.mounted.set(true);
      }
    });
  }

  toggle(): void {
    this.themeService.toggle();
  }
}
