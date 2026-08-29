import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { ThemeToggleComponent } from './theme-toggle.component';
import { WordmarkComponent } from '../marketing/wordmark.component';
import { PillLinkComponent } from '../marketing/pill.component';
import { AvatarComponent } from '../ui/avatar.component';
import { BadgeComponent } from '../ui/badge.component';
import { ButtonComponent } from '../ui/button.component';
import { IconComponent } from '../shared/icon.component';

const NAV_LINKS = [
  { label: 'Docs', href: '#' },
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Demo', href: '/#demo' },
  { label: 'Blog', href: '#' },
];

@Component({
  standalone: true,

  selector: 'app-navbar',
  imports: [RouterLink, ThemeToggleComponent, WordmarkComponent, PillLinkComponent, AvatarComponent, BadgeComponent, ButtonComponent, IconComponent],
  template: `
    <header class="fixed top-0 z-50 w-full border-b border-border bg-background">
      <div class="container flex h-[85px] items-center justify-between">
        <a routerLink="/" aria-label="Ragify home">
          <app-wordmark size="lg" />
        </a>

        <nav class="hidden items-center gap-1 lg:flex" aria-label="Main">
          @for (link of navLinks; track link.label) {
            <a
              [href]="link.href"
              class="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground/80 transition-colors duration-300 hover:bg-foreground hover:text-background"
            >
              {{ link.label }}
            </a>
          }
        </nav>

        <div class="hidden items-center gap-3 lg:flex">
          <app-theme-toggle />
          @if (sessionService.hasHydrated() && sessionService.user()) {
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
                <div
                  class="absolute right-0 z-50 mt-2 w-72 border bg-popover p-3 text-sm text-popover-foreground shadow-2xl ring-1 ring-foreground/5"
                >
                  <div class="flex items-center gap-3 px-2 py-2">
                    <app-avatar [image]="sessionService.user()?.image" [alt]="'Profile'" [fallback]="userInitial()" />
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <p class="truncate text-sm font-semibold leading-none">{{ sessionService.user()?.name }}</p>
                        @if (sessionService.user()?.role === 'ADMIN') {
                          <span appBadge variant="default" class="rounded-full px-1.5 py-0 text-[9px] font-semibold uppercase">
                            Admin
                          </span>
                        }
                      </div>
                      <p class="mt-1 truncate text-xs text-muted-foreground">{{ sessionService.user()?.email }}</p>
                    </div>
                  </div>
                  <div class="space-y-1">
                    <button appButton variant="outline" class="h-9 w-full justify-start gap-2 text-xs font-medium" routerLink="/workspaces" (click)="profileOpen.set(false)">
                      <app-icon name="LayoutDashboard" class="size-3.5" />
                      Go to workspaces
                    </button>
                    <button appButton variant="outline" class="h-9 w-full justify-start gap-2 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive" (click)="logout()">
                      <app-icon name="LogOut" class="size-3.5" />
                      Log out
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else if (!sessionService.hasHydrated()) {
            <div class="h-10 w-24 animate-pulse rounded-full bg-muted"></div>
          } @else {
            <a appPill routerLink="/sign-up">Get started</a>
          }
        </div>

        <button
          type="button"
          class="flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          (click)="menuOpen.set(!menuOpen())"
          [attr.aria-expanded]="menuOpen()"
          aria-label="Toggle navigation"
        >
          <app-icon [name]="menuOpen() ? 'X' : 'Menu'" class="size-5" />
        </button>
      </div>

      @if (menuOpen()) {
        <div class="border-t border-border bg-background px-4 py-5 lg:hidden">
          <nav class="flex flex-col gap-1">
            @for (link of navLinks; track link.label) {
              <a
                [href]="link.href"
                (click)="menuOpen.set(false)"
                class="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {{ link.label }}
              </a>
            }
          </nav>

          <div class="mt-4 space-y-2 border-t border-border pt-4">
            <app-theme-toggle />

            @if (sessionService.user()) {
              <button appButton class="w-full justify-start gap-2 text-sm font-medium" routerLink="/workspaces" (click)="menuOpen.set(false)">
                <app-icon name="LayoutDashboard" class="size-4" />
                Go to workspaces
              </button>
              <button appButton variant="outline" class="w-full justify-start gap-2 text-sm font-medium" (click)="logout()">
                <app-icon name="LogOut" class="size-4" />
                Log out
              </button>
            } @else {
              <div class="grid grid-cols-2 gap-2">
                <a appPill [outline]="true" routerLink="/sign-in" class="justify-center text-sm font-medium">Sign in</a>
                <a appPill routerLink="/sign-up" class="w-full justify-center">Get started</a>
              </div>
            }
          </div>
        </div>
      }
    </header>
  `,
})
export class NavbarComponent {
  readonly navLinks = NAV_LINKS;
  readonly menuOpen = signal(false);
  readonly profileOpen = signal(false);

  constructor(protected readonly sessionService: SessionService) {}

  userInitial(): string {
    return this.sessionService.user()?.name?.charAt(0)?.toUpperCase() || 'U';
  }

  logout(): void {
    this.sessionService.clearSession();
    this.menuOpen.set(false);
    this.profileOpen.set(false);
  }
}
