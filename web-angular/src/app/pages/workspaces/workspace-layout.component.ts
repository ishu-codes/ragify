import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';
import { UploadService } from '../../services/upload.service';
import { SidebarShellComponent } from '../../components/ui/sidebar.component';
import { AppSidebarComponent } from '../../components/workspaces/app-sidebar.component';
import { WorkspaceNavbarComponent } from '../../components/workspaces/workspace-navbar.component';
import { DashedPanelComponent } from '../../components/marketing/dashed-panel.component';
import { SkeletonComponent } from '../../components/ui/skeleton.component';
import { IconComponent } from '../../components/shared/icon.component';
import type { Workspace } from '../../types/models';

@Component({
  standalone: true,

  selector: 'app-workspace-layout',
  imports: [
    RouterOutlet,
    SidebarShellComponent,
    AppSidebarComponent,
    WorkspaceNavbarComponent,
    DashedPanelComponent,
    SkeletonComponent,
    IconComponent,
  ],
  template: `
    @if (sessionPending() || workspaceLoading()) {
      <div class="flex h-screen w-screen items-center justify-center p-8">
        <div class="w-full max-w-4xl space-y-4">
          <app-skeleton class="h-12 w-full" />
          <div class="flex gap-4">
            <app-skeleton class="h-150 w-64" />
            <app-skeleton class="h-150 flex-1" />
          </div>
        </div>
      </div>
    } @else if (sessionService.isAuthenticated()) {
      <app-sidebar-shell>
        <div sidebarHeader>
          <app-app-sidebar [workspaceId]="workspaceId()" />
        </div>
        <main class="w-full min-w-0">
          <app-workspace-navbar />
          <div class="pt-[57px]">
            @if (workspaceError()) {
              <app-dashed-panel class="m-6 border border-destructive/30 bg-destructive/5 p-6">
                <div class="flex items-center gap-3 text-sm text-destructive">
                  <app-icon name="DatabaseZap" class="size-4" />
                  <span>Unable to load this workspace right now.</span>
                </div>
              </app-dashed-panel>
            }
            <router-outlet />
          </div>
        </main>
      </app-sidebar-shell>
    }
  `,
  providers: [UploadService],
})
export class WorkspaceLayoutComponent {
  protected readonly sessionService = inject(SessionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly apiService = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly uploadService = inject(UploadService);

  readonly workspaceId = signal('');
  readonly workspace = signal<Workspace | null>(null);
  readonly workspaceLoading = signal(true);
  readonly workspaceError = signal(false);
  readonly sessionPending = this.sessionService.hasHydrated;

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.workspaceId.set(params.get('workspaceId') ?? '');
      this.uploadService.configure(params.get('workspaceId') ?? '');
      this.loadWorkspace();
    });

    effect(() => {
      if (this.sessionService.hasHydrated() && !this.sessionService.isAuthenticated()) {
        void this.router.navigate(['/sign-in'], { replaceUrl: true });
      }
    });
  }

  private loadWorkspace(): void {
    const token = this.sessionService.session()?.accessToken;
    const id = this.workspaceId();
    if (!token || !id) {
      return;
    }
    this.workspaceLoading.set(true);
    this.workspaceError.set(false);
    this.apiService.getWorkspace(token, id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.workspace.set(data);
        this.workspaceLoading.set(false);
      },
      error: () => {
        this.workspaceError.set(true);
        this.workspaceLoading.set(false);
      },
    });
  }
}
