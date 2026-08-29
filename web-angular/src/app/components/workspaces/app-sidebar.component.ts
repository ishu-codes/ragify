import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { SessionService } from '../../services/session.service';
import { WordmarkComponent } from '../marketing/wordmark.component';
import { IconComponent } from '../shared/icon.component';
import type { IconName } from '../shared/icons';

interface SidebarItem {
  name: string;
  href: string;
  icon: IconName;
}

@Component({
  standalone: true,

  selector: 'app-app-sidebar',
  imports: [RouterLink, WordmarkComponent, IconComponent],
  template: `
    <a
      routerLink="/workspaces"
      class="flex items-center gap-3 px-4 py-4 transition-opacity hover:opacity-80"
      [class.justify-center]="collapsed()"
    >
      @if (!collapsed()) {
        <app-wordmark size="md" />
      } @else {
        <span class="font-mono text-sm font-semibold text-brand-text">//</span>
      }
    </a>

    <div class="px-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground" [class.hidden]="collapsed()">
      // workspace
    </div>

    <nav class="space-y-2 p-2" aria-label="Workspace navigation">
      @for (item of items(); track item.href) {
        <a
          [routerLink]="item.href"
          [attr.aria-current]="isActive(item.href) ? 'page' : null"
          [class]="
            isActive(item.href) ?
              'flex items-center gap-3 rounded-[6px] bg-muted px-3 py-2 text-sm font-medium text-foreground' :
              'flex items-center gap-3 rounded-[6px] px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground'
          "
          [class.justify-center]="collapsed()"
          [title]="collapsed() ? item.name : ''"
        >
          <app-icon [name]="item.icon" class="size-4 shrink-0" />
          @if (!collapsed()) {
            <span class="tracking-tight">{{ item.name }}</span>
          }
        </a>
      }
    </nav>

    <div class="mt-auto border-t border-border p-2">
      <button
        type="button"
        (click)="logout()"
        class="flex w-full items-center gap-3 rounded-[6px] px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        [class.justify-center]="collapsed()"
        [title]="collapsed() ? 'Logout' : ''"
      >
        <app-icon name="LogOut" class="size-4" />
        @if (!collapsed()) {
          <span class="tracking-tight">Logout</span>
        }
      </button>
    </div>
  `,
  host: {
    class: 'flex h-full flex-col',
  },
})
export class AppSidebarComponent {
  readonly workspaceId = input<string | null>(null);

  protected readonly collapsed = inject(SidebarService).collapsed;
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);

  readonly items = computed<SidebarItem[]>(() => {
    const workspaceId = this.workspaceId();
    if (!workspaceId) {
      return [{ name: 'Workspaces', href: '/workspaces', icon: 'FolderKanban' }];
    }
    return [
      { name: 'Overview', href: `/workspaces/${workspaceId}`, icon: 'LayoutDashboard' },
      { name: 'Chat', href: `/workspaces/${workspaceId}/chat`, icon: 'MessageSquare' },
      { name: 'Upload', href: `/workspaces/${workspaceId}/upload`, icon: 'Upload' },
      { name: 'Settings', href: `/workspaces/${workspaceId}/settings`, icon: 'Settings' },
    ];
  });

  isActive(href: string): boolean {
    const pathname = this.router.url.split('?')[0];
    if (this.workspaceId()) {
      return href === `/workspaces/${this.workspaceId()}` ? pathname === href : pathname.startsWith(href);
    }
    return pathname === href;
  }

  logout(): void {
    this.sessionService.clearSession();
    void this.router.navigate(['/sign-in'], { replaceUrl: true });
  }
}
