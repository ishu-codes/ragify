import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';
import { WorkspaceSessionService } from '../../services/workspace-session.service';
import { DashedPanelComponent } from '../../components/marketing/dashed-panel.component';
import { BadgeComponent } from '../../components/ui/badge.component';
import { ButtonComponent } from '../../components/ui/button.component';
import { IconComponent } from '../../components/shared/icon.component';
import { TimeShortPipe } from '../../pipes/format.pipe';
import type { Workspace, WorkspaceSessionSummary } from '../../types/models';

@Component({
  standalone: true,

  selector: 'app-overview-page',
  imports: [RouterLink, DashedPanelComponent, BadgeComponent, ButtonComponent, IconComponent, TimeShortPipe],
  template: `
    <div class="container space-y-8 py-10">
      <app-dashed-panel class="bg-card p-6 sm:p-8">
        <div class="space-y-4">
          <nav class="flex items-center gap-1 text-xs text-muted-foreground">
            <a routerLink="/workspaces" class="font-medium transition-colors hover:text-foreground">Workspaces</a>
            <app-icon name="ChevronRight" class="size-3.5" />
            <span class="max-w-56 truncate font-medium text-foreground">{{ workspace()?.name ?? 'Workspace' }}</span>
          </nav>

          <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div class="space-y-3">
              <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">{{ workspace()?.name ?? 'Workspace' }}</h1>
              @if (workspace()?.description) {
                <p class="max-w-2xl text-sm leading-relaxed text-muted-foreground">{{ workspace()?.description }}</p>
              }
              <div class="flex flex-wrap gap-1.5">
                @if (workspace()?.tags?.length) {
                  @for (tag of workspace()?.tags; track tag) {
                    <span appBadge variant="secondary" class="rounded-full font-mono text-[11px] font-medium">{{ tag }}</span>
                  }
                } @else {
                  <span appBadge variant="outline" class="rounded-full text-[11px] font-medium text-muted-foreground">No tags</span>
                }
              </div>
            </div>

            <a appButton size="lg" variant="pill" [routerLink]="'/workspaces/' + workspaceId() + '/chat'" class="shrink-0 gap-2">
              Open chat
              <app-icon name="ArrowRight" class="size-4" />
            </a>
          </div>
        </div>
      </app-dashed-panel>

      <app-dashed-panel class="grid grid-cols-2 bg-card lg:grid-cols-4">
        @for (stat of stats(); track stat.label) {
          <div class="flex items-center gap-3 p-4 sm:p-5">
            <div class="flex size-9 shrink-0 items-center justify-center bg-brand/10 text-brand-text">
              <app-icon [name]="stat.icon" class="size-4" />
            </div>
            <div class="min-w-0">
              <p class="text-lg leading-none font-semibold tabular-nums">{{ stat.value }}</p>
              <p class="mt-1 truncate text-xs text-muted-foreground">{{ stat.label }}</p>
            </div>
          </div>
        }
      </app-dashed-panel>

      <div class="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)]">
        <section class="space-y-4">
          <h2 class="text-base font-semibold tracking-tight">Get started</h2>
          <div class="grid gap-3 sm:grid-cols-2">
            @for (action of actions(); track action.title) {
              <a
                [routerLink]="action.href"
                class="group relative border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-20px] hover:shadow-brand/25"
              >
                <div class="flex items-center justify-between">
                  <div class="flex size-10 items-center justify-center bg-brand/10 text-brand-text ring-1 ring-brand/20">
                    <app-icon [name]="action.icon" class="size-5" />
                  </div>
                  <app-icon
                    name="ArrowRight"
                    class="size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-brand-text"
                  />
                </div>
                <p class="mt-4 text-sm font-semibold tracking-tight">{{ action.title }}</p>
                <p class="mt-1 text-xs leading-relaxed text-muted-foreground">{{ action.description }}</p>
              </a>
            }
          </div>
        </section>

        <app-dashed-panel class="h-fit bg-card p-6">
          <div class="space-y-1.5">
            <h2 class="text-base font-semibold tracking-tight">Recent local conversation</h2>
            <p class="text-xs text-muted-foreground">Messages persisted in this browser for the current workspace.</p>
          </div>
          <div class="mt-5 space-y-3">
            @if (localMessages().length === 0) {
              <div class="border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                No local conversation yet. Start in chat after you upload some materials.
              </div>
            } @else {
              @for (message of localMessages(); track message.id) {
                <div class="border border-border bg-background/70 p-4">
                  <div class="mb-2 flex items-center justify-between text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    <span>{{ message.role }}</span>
                    <span>{{ message.createdAt | timeShort }}</span>
                  </div>
                  <p class="line-clamp-4 text-sm leading-6 break-words whitespace-pre-wrap">{{ message.content }}</p>
                </div>
              }
            }

            <a appButton variant="pill" [routerLink]="'/workspaces/' + workspaceId() + '/chat'" class="w-full">
              Open workspace chat
            </a>
          </div>
        </app-dashed-panel>
      </div>
    </div>
  `,
})
export class OverviewPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly apiService = inject(ApiService);
  private readonly sessionService = inject(SessionService);
  private readonly workspaceSessionService = inject(WorkspaceSessionService);
  private readonly route = inject(ActivatedRoute);

  readonly workspaceId = signal('');
  readonly workspace = signal<Workspace | null>(null);
  readonly sessions = signal<WorkspaceSessionSummary[]>([]);
  readonly localMessages = signal([] as { id: string; role: string; content: string; createdAt: string }[]);

  readonly stats = computed(() => [
    { label: 'Materials', value: this.workspace()?.materials.length ?? 0, icon: 'Files' as const },
    { label: 'Stored sessions', value: this.sessions().length, icon: 'History' as const },
    { label: 'Local messages', value: this.localMessages().length, icon: 'MessageSquareText' as const },
    { label: 'Tags', value: this.workspace()?.tags.length ?? 0, icon: 'Tags' as const },
  ]);

  readonly actions = computed(() => [
    {
      title: 'Chat',
      description: 'Ask questions against the indexed documents in this workspace.',
      href: `/workspaces/${this.workspaceId()}/chat`,
      icon: 'MessageSquareText' as const,
    },
    {
      title: 'Upload',
      description: 'Add new source files and keep the material library up to date.',
      href: `/workspaces/${this.workspaceId()}/upload`,
      icon: 'UploadCloud' as const,
    },
    {
      title: 'History',
      description: 'Review, rename, and delete backend chat sessions for this workspace.',
      href: `/workspaces/${this.workspaceId()}/history`,
      icon: 'History' as const,
    },
    {
      title: 'Settings',
      description: 'Edit workspace metadata and clear the local browser chat cache.',
      href: `/workspaces/${this.workspaceId()}/settings`,
      icon: 'Settings2' as const,
    },
  ]);

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.workspaceId.set(params.get('workspaceId') ?? '');
      const token = this.sessionService.session()?.accessToken;
      if (token && this.workspaceId()) {
        this.load(token);
      }
    });

    effect(() => {
      const token = this.sessionService.session()?.accessToken;
      if (token && this.workspaceId()) {
        this.load(token);
      }
    });
  }

  private load(token: string): void {
    const id = this.workspaceId();
    this.apiService.getWorkspace(token, id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (workspace) => this.workspace.set(workspace),
      error: () => undefined,
    });
    this.apiService.sessions(token, id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (sessions) => this.sessions.set(Array.isArray(sessions) ? sessions : []),
      error: () => undefined,
    });
    this.localMessages.set(
      this.workspaceSessionService.read(id).messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt,
      })),
    );
  }
}
