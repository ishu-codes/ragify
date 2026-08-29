import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';
import { ToastService } from '../../services/toast.service';
import { DashedPanelComponent } from '../../components/marketing/dashed-panel.component';
import { BadgeComponent } from '../../components/ui/badge.component';
import { ButtonComponent } from '../../components/ui/button.component';
import { SkeletonComponent } from '../../components/ui/skeleton.component';
import { IconComponent } from '../../components/shared/icon.component';
import { DateMediumPipe } from '../../pipes/format.pipe';
import type { WorkspaceSessionSummary } from '../../types/models';

@Component({
  standalone: true,

  selector: 'app-history-page',
  imports: [RouterLink, DashedPanelComponent, BadgeComponent, ButtonComponent, SkeletonComponent, IconComponent, DateMediumPipe],
  template: `
    <div class="container max-w-4xl space-y-8 py-10">
      <header class="flex items-center justify-between gap-4">
        <div class="space-y-1.5">
          <h1 class="text-2xl font-semibold tracking-tight">Chat history</h1>
          <p class="text-sm text-muted-foreground">
            Review, rename, and delete backend chat sessions for this workspace.
          </p>
        </div>
        <button appButton variant="outlinePill" class="gap-2 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive" (click)="deleteAll()">
          <app-icon name="Trash2" class="size-4" />
          Clear all
        </button>
      </header>

      <app-dashed-panel class="bg-card p-6">
        @if (loading()) {
          <div class="space-y-3">
            <app-skeleton class="h-16 w-full" />
            <app-skeleton class="h-16 w-full" />
            <app-skeleton class="h-16 w-full" />
          </div>
        } @else if (sessions().length === 0) {
          <div class="border border-dashed border-border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
            No chat sessions stored for this workspace yet. Start one from the chat page.
          </div>
        } @else {
          <div class="space-y-2">
            @for (session of sessions(); track session.id) {
              <div class="flex items-center justify-between gap-3 border border-border bg-background/60 p-4">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="truncate font-mono text-sm font-semibold">{{ session.name }}</p>
                    <span appBadge variant="secondary" class="rounded-full text-[10px]">{{ session.message_count }} messages</span>
                  </div>
                  <p class="mt-1 text-xs text-muted-foreground">{{ session.created_at | dateMedium }}</p>
                </div>
                <div class="flex shrink-0 items-center gap-1">
                  <button
                    appButton variant="ghost" size="iconSm"
                    class="size-8 cursor-pointer text-muted-foreground hover:bg-brand/10 hover:text-brand-text"
                    title="Rename session"
                    (click)="renameSession(session)"
                  >
                    <app-icon name="FileText" class="size-4" />
                  </button>
                  <a
                    appButton variant="ghost" size="iconSm"
                    class="size-8 cursor-pointer text-muted-foreground hover:bg-brand/10 hover:text-brand-text"
                    title="Open in chat"
                    [routerLink]="'/workspaces/' + workspaceId() + '/chat'"
                    [queryParams]="{ session: session.id }"
                  >
                    <app-icon name="MessageSquare" class="size-4" />
                  </a>
                  <button
                    appButton variant="ghost" size="iconSm"
                    class="size-8 cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Delete session"
                    (click)="deleteSession(session.id)"
                  >
                    <app-icon name="Trash2" class="size-4" />
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </app-dashed-panel>
    </div>
  `,
})
export class HistoryPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly apiService = inject(ApiService);
  private readonly sessionService = inject(SessionService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  readonly workspaceId = signal('');
  readonly sessions = signal<WorkspaceSessionSummary[]>([]);
  readonly loading = signal(true);

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.workspaceId.set(params.get('workspaceId') ?? '');
      this.load();
    });

    effect(() => {
      const token = this.sessionService.session()?.accessToken;
      if (token && this.workspaceId()) {
        this.load();
      }
    });
  }

  private load(): void {
    const token = this.sessionService.session()?.accessToken;
    const id = this.workspaceId();
    if (!token || !id) {
      return;
    }
    this.loading.set(true);
    this.apiService.sessions(token, id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.sessions.set(Array.isArray(data) ? data : []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  renameSession(session: WorkspaceSessionSummary): void {
    const newName = window.prompt('Rename this session:', session.name);
    if (!newName || newName.trim() === '' || newName === session.name) {
      return;
    }
    const token = this.sessionService.session()?.accessToken;
    const id = this.workspaceId();
    if (!token || !id) {
      return;
    }
    this.apiService.renameSession(token, id, session.id, { name: newName.trim() }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        this.sessions.update((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
        this.toastService.success('Session renamed');
      },
      error: (error: Error) => this.toastService.error(error.message),
    });
  }

  deleteSession(sessionId: string): void {
    if (!window.confirm('Are you sure you want to delete this chat session?')) {
      return;
    }
    const token = this.sessionService.session()?.accessToken;
    const id = this.workspaceId();
    if (!token || !id) {
      return;
    }
    this.apiService.deleteSession(token, id, sessionId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.sessions.update((current) => current.filter((session) => session.id !== sessionId));
        this.toastService.success('Chat session deleted');
      },
      error: (error: Error) => this.toastService.error(error.message),
    });
  }

  deleteAll(): void {
    if (!window.confirm('Are you sure you want to delete all chat sessions for this workspace?')) {
      return;
    }
    const token = this.sessionService.session()?.accessToken;
    const id = this.workspaceId();
    if (!token || !id) {
      return;
    }
    this.apiService.deleteAllSessions(token, id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.sessions.set([]);
        this.toastService.success('All chat sessions deleted');
      },
      error: (error: Error) => this.toastService.error(error.message),
    });
  }
}
