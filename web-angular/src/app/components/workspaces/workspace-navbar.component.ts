import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { SidebarService } from '../../services/sidebar.service';
import { ThemeToggleComponent } from '../navbar/theme-toggle.component';
import { SidebarTriggerComponent } from '../ui/sidebar.component';
import { AvatarComponent } from '../ui/avatar.component';
import { ButtonComponent } from '../ui/button.component';
import { IconComponent } from '../shared/icon.component';
import { WordmarkComponent } from '../marketing/wordmark.component';

@Component({
  standalone: true,

  selector: 'app-workspace-navbar',
  imports: [RouterLink, ThemeToggleComponent, SidebarTriggerComponent, AvatarComponent, ButtonComponent, IconComponent],
  template: `
    <div class="flex h-[57px] w-full items-center justify-between gap-4 border-b border-border bg-background px-4 sm:px-6">
      <div class="flex items-center gap-3">
        @if (inSidebarShell()) {
          <app-sidebar-trigger>
            <app-icon name="Menu" class="size-4" />
          </app-sidebar-trigger>
        }
        <ng-content />
      </div>

      <div class="flex items-center gap-3">
        <app-theme-toggle />
        @if (sessionService.user()) {
          <div class="relative">
            <button
              type="button"
              (click)="profileOpen.set(!profileOpen())"
              [attr.aria-expanded]="profileOpen()"
              aria-label="Open profile menu"
              class="cursor-pointer rounded-full transition-transform hover:scale-105"
            >
              <app-avatar [image]="sessionService.user()?.image" [alt]="'Profile'" [fallback]="userInitial()" />
            </button>
            @if (profileOpen()) {
              <div class="absolute right-0 z-50 mt-2 w-72 border bg-popover p-3 text-sm text-popover-foreground shadow-2xl ring-1 ring-foreground/5">
                <div class="flex items-center gap-3 px-2 py-2">
                  <app-avatar [image]="sessionService.user()?.image" [alt]="'Profile'" [fallback]="userInitial()" />
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-semibold leading-none">{{ sessionService.user()?.name }}</p>
                    <p class="mt-1 truncate text-xs text-muted-foreground">{{ sessionService.user()?.email }}</p>
                  </div>
                </div>
                <div class="space-y-1">
                  <button appButton variant="outline" class="h-9 w-full justify-start gap-2 text-xs font-medium" routerLink="/workspaces" (click)="profileOpen.set(false)">
                    <app-icon name="LayoutDashboard" class="size-3.5" />
                    Workspaces
                  </button>
                  <button appButton variant="outline" class="h-9 w-full justify-start gap-2 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive" (click)="logout()">
                    <app-icon name="LogOut" class="size-3.5" />
                    Logout
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class WorkspaceNavbarComponent {
  protected readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);

  readonly profileOpen = signal(false);

  inSidebarShell(): boolean {
    return true;
  }

  userInitial(): string {
    return this.sessionService.user()?.name?.charAt(0)?.toUpperCase() || 'U';
  }

  logout(): void {
    this.sessionService.clearSession();
    void this.router.navigate(['/sign-in'], { replaceUrl: true });
  }
}
