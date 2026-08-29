import { Component, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { WordmarkComponent } from '../../components/marketing/wordmark.component';
import { DashedPanelComponent } from '../../components/marketing/dashed-panel.component';
import { ThemeToggleComponent } from '../../components/navbar/theme-toggle.component';

@Component({
  standalone: true,

  selector: 'app-auth-layout',
  imports: [RouterLink, RouterOutlet, WordmarkComponent, DashedPanelComponent, ThemeToggleComponent],
  template: `
    <div class="relative flex min-h-dvh flex-col bg-background text-foreground">
      <header class="border-b border-border bg-background">
        <div class="container flex h-[85px] items-center justify-between">
          <a routerLink="/" aria-label="Ragify home">
            <app-wordmark size="lg" />
          </a>
          <app-theme-toggle />
        </div>
      </header>

      <main class="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div class="w-full max-w-md">
          <app-dashed-panel class="bg-card p-7 sm:p-9">
            <router-outlet />
          </app-dashed-panel>
        </div>
      </main>

      <footer class="border-t border-border bg-background py-6">
        <div class="container flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <app-wordmark size="sm" />
          <p>Grounded answers from your documents. Every response cites its source.</p>
        </div>
      </footer>
    </div>
  `,
})
export class AuthLayoutComponent {
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      if (this.sessionService.user()) {
        void this.router.navigate(['/workspaces'], { replaceUrl: true });
      }
    });
  }
}
