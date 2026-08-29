import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';
import { ToastService } from '../../services/toast.service';
import { DashedPanelComponent } from '../../components/marketing/dashed-panel.component';
import { WorkspaceNavbarComponent } from '../../components/workspaces/workspace-navbar.component';
import { WordmarkComponent } from '../../components/marketing/wordmark.component';
import { SkeletonComponent } from '../../components/ui/skeleton.component';
import { BadgeComponent } from '../../components/ui/badge.component';
import { InputComponent } from '../../components/ui/input.component';
import { DialogComponent } from '../../components/ui/dialog.component';
import { ButtonComponent } from '../../components/ui/button.component';
import { IconComponent } from '../../components/shared/icon.component';
import { DateMediumPipe } from '../../pipes/format.pipe';
import type { Workspace } from '../../types/models';

const PRESET_TEMPLATES = [
  {
    name: 'Software Architecture & Code Base',
    description: 'RAG workspace for indexing API documentations, repository files, and system design specs.',
    tags: ['codebase', 'architecture', 'api-docs'],
    icon: 'Code2' as const,
  },
  {
    name: 'Financial Reports & Audit Compliance',
    description: 'Dedicated workspace for parsing Q3/Q4 earnings, balance sheets, and regulatory filings.',
    tags: ['financial', 'compliance', 'q3-audit'],
    icon: 'FileSpreadsheet' as const,
  },
  {
    name: 'Academic Papers & Deep Research',
    description: 'Workspace configured for AI whitepapers, literature reviews, and research notes.',
    tags: ['research', 'whitepapers', 'deep-learning'],
    icon: 'BookOpen' as const,
  },
];

@Component({
  standalone: true,

  selector: 'app-workspaces-page',
  imports: [
    RouterLink,
    DashedPanelComponent,
    WorkspaceNavbarComponent,
    WordmarkComponent,
    SkeletonComponent,
    BadgeComponent,
    InputComponent,
    DialogComponent,
    ButtonComponent,
    IconComponent,
    DateMediumPipe,
  ],
  template: `
    @if (isSessionPending() || loading()) {
      <main class="w-full min-h-screen bg-muted/20">
        <app-workspace-navbar>
          <a routerLink="/workspaces" aria-label="Ragify workspaces">
            <app-wordmark size="md" />
          </a>
        </app-workspace-navbar>
        <div class="container space-y-8 py-10">
          <app-skeleton class="h-40 w-full" />
          <app-skeleton class="h-20 w-full max-w-md" />
          <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <app-skeleton class="h-52" />
            <app-skeleton class="h-52" />
            <app-skeleton class="h-52" />
          </div>
        </div>
      </main>
    } @else if (sessionService.isAuthenticated()) {
      <main class="w-full min-h-screen bg-background pb-16">
        <app-workspace-navbar>
          <a routerLink="/workspaces" aria-label="Ragify workspaces">
            <app-wordmark size="md" />
          </a>
        </app-workspace-navbar>

        <div class="container space-y-8 py-10">
          <app-dashed-panel class="bg-card px-6 py-8 sm:px-10 sm:py-10">
            <div
              aria-hidden="true"
              class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_55%)]"
            ></div>
            <div class="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div class="max-w-2xl space-y-3">
                <div class="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/[0.07] px-2.5 py-1 text-[11px] font-medium text-primary">
                  <app-icon name="Layers" class="size-3.5" />
                  RAG workspaces
                </div>
                <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Your AI RAG workspaces</h1>
                <p class="max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Create isolated vector namespaces, ingest multi-format source materials, and chat with AI grounded in
                  exact citations.
                </p>
              </div>

              <div class="flex shrink-0">
                <button appButton size="lg" variant="pill" class="gap-2" (click)="openCreateDialog()">
                  <app-icon name="FolderPlus" class="size-4" />
                  New workspace
                </button>
              </div>
            </div>
          </app-dashed-panel>

          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <app-dashed-panel class="grid w-fit grid-cols-2 bg-card">
              <div class="flex items-center gap-3 p-4 sm:p-5">
                <span class="font-mono text-xs text-brand-text">//</span>
                <div>
                  <p class="text-lg leading-none font-semibold tabular-nums">{{ workspaces().length }}</p>
                  <p class="mt-1 text-xs text-muted-foreground">Workspaces</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-4 sm:p-5">
                <span class="font-mono text-xs text-brand-text">//</span>
                <div>
                  <p class="text-lg leading-none font-semibold tabular-nums">{{ totalMaterials() }}</p>
                  <p class="mt-1 text-xs text-muted-foreground">Files indexed</p>
                </div>
              </div>
            </app-dashed-panel>

            <div class="relative lg:w-80 xl:w-96">
              <app-icon name="Search" class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                appInput
                type="text"
                placeholder="Search workspaces by name or tag..."
                [value]="searchQuery()"
                (input)="onSearchInput($event)"
                class="h-10 rounded-md border-border bg-card pl-9 text-sm focus-visible:ring-brand/40"
              />
            </div>
          </div>

          @if (allTags().length > 0) {
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                (click)="selectedTag.set(null)"
                class="cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                [class]="
                  selectedTag() === null ?
                    'border-primary bg-primary text-primary-foreground' :
                    'border-border bg-card text-muted-foreground hover:bg-muted'
                "
              >
                All ({{ workspaces().length }})
              </button>
              @for (tag of allTags(); track tag) {
                <button
                  type="button"
                  (click)="selectedTag.set(selectedTag() === tag ? null : tag)"
                  class="flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                  [class]="
                    selectedTag() === tag ?
                      'border-primary bg-primary text-primary-foreground' :
                      'border-border bg-card text-muted-foreground hover:bg-muted'
                  "
                >
                  <app-icon name="Tag" class="size-3 opacity-70" />
                  {{ tag }}
                </button>
              }
            </div>
          }

          <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            @for (workspace of filteredWorkspaces(); track workspace.id; let index = $index) {
              <app-dashed-panel
                class="group relative flex cursor-pointer flex-col bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_-24px] hover:shadow-brand/25"
                (click)="openWorkspace(workspace.id)"
              >
                <div class="flex-1 space-y-4 p-5">
                  <div class="flex items-start justify-between gap-3">
                    <span class="font-mono text-sm font-semibold text-brand-text">
                      {{ (index + 1).toString().padStart(2, '0') }}
                    </span>

                    <div class="relative">
                      <button
                        appButton
                        variant="ghost"
                        size="iconSm"
                        class="size-8 cursor-pointer text-muted-foreground hover:bg-muted hover:text-foreground"
                        (click)="toggleMenu(workspace.id, $event)"
                        [attr.aria-expanded]="menuWorkspaceId() === workspace.id"
                        aria-label="Workspace actions"
                      >
                        <app-icon name="MoreVertical" class="size-4" />
                      </button>
                      @if (menuWorkspaceId() === workspace.id) {
                        <div
                          class="absolute right-0 z-50 mt-1 w-44 border bg-popover p-1.5 text-left shadow-2xl"
                          (click)="$event.stopPropagation()"
                        >
                          <button
                            appButton
                            variant="ghost"
                            class="h-8 w-full justify-start gap-2 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                            (click)="deleteWorkspace(workspace.id)"
                            [disabled]="deleting()"
                          >
                            <app-icon name="Trash2" class="size-3.5" />
                            Delete workspace
                          </button>
                        </div>
                      }
                    </div>
                  </div>

                  <div class="min-w-0 space-y-1.5">
                    <p class="truncate text-base font-semibold tracking-tight transition-colors group-hover:text-brand-text">
                      {{ workspace.name || 'Workspace ' + (index + 1).toString().padStart(2, '0') }}
                    </p>
                    <p class="text-[10px] font-medium text-muted-foreground">Created {{ workspace.created_at | dateMedium }}</p>
                    <p class="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {{ workspace.description || 'No description yet. Add details in settings.' }}
                    </p>
                  </div>

                  <div class="flex flex-wrap gap-1.5">
                    @if (workspace.tags.length > 0) {
                      @for (tag of workspace.tags; track tag) {
                        <span appBadge variant="secondary" class="rounded-full text-[10px] font-medium">{{ tag }}</span>
                      }
                    } @else {
                      <span appBadge variant="outline" class="rounded-full text-[10px] font-medium text-muted-foreground">No tags</span>
                    }
                  </div>
                </div>

                <div class="flex items-center justify-between gap-3 border-t border-border bg-muted/20 px-5 py-3">
                  <span class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <app-icon name="Files" class="size-3.5" />
                    {{ workspace.materials.length }} material{{ workspace.materials.length === 1 ? '' : 's' }}
                  </span>
                  <div class="flex items-center gap-1" (click)="$event.stopPropagation()">
                    <button
                      appButton variant="ghost" size="iconSm"
                      class="size-8 cursor-pointer text-muted-foreground hover:bg-brand/10 hover:text-brand-text"
                      title="Open chat"
                      (click)="openRoute('/workspaces/' + workspace.id + '/chat')"
                    >
                      <app-icon name="MessageSquare" class="size-4" />
                    </button>
                    <button
                      appButton variant="ghost" size="iconSm"
                      class="size-8 cursor-pointer text-muted-foreground hover:bg-brand/10 hover:text-brand-text"
                      title="Upload files"
                      (click)="openRoute('/workspaces/' + workspace.id + '/upload')"
                    >
                      <app-icon name="Upload" class="size-4" />
                    </button>
                    <button
                      appButton variant="ghost" size="iconSm"
                      class="size-8 cursor-pointer text-muted-foreground hover:bg-brand/10 hover:text-brand-text"
                      title="Settings"
                      (click)="openRoute('/workspaces/' + workspace.id + '/settings')"
                    >
                      <app-icon name="Settings" class="size-4" />
                    </button>
                  </div>
                </div>
              </app-dashed-panel>
            }
          </div>

          @if (filteredWorkspaces().length === 0 && !loading()) {
            <app-dashed-panel class="mx-auto max-w-xl bg-card p-10 text-center">
              <div class="flex flex-col items-center gap-5">
                <div class="flex size-12 items-center justify-center bg-brand/10 text-brand-text ring-1 ring-brand/20">
                  <app-icon name="FolderPlus" class="size-6" />
                </div>
                <div class="space-y-1.5">
                  <h3 class="text-lg font-semibold tracking-tight">
                    {{ searchQuery() || selectedTag() ? 'No matching workspaces found' : 'No workspaces created yet' }}
                  </h3>
                  <p class="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
                    {{
                      searchQuery() || selectedTag()
                        ? 'Try clearing your filters, or create a new workspace.'
                        : 'Create your first workspace to start uploading documents, parsing codebases, and querying with grounded citations.'
                    }}
                  </p>
                </div>
                <button appButton size="lg" variant="pill" class="gap-2" (click)="openCreateDialog()">
                  <app-icon name="Plus" class="size-4" />
                  Create first workspace
                </button>
              </div>
            </app-dashed-panel>
          }
        </div>
      </main>
    }

    <app-dialog [(open)]="isModalOpen" ariaLabel="New workspace">
      <div class="space-y-2">
        <div class="flex items-center gap-3 text-xl font-semibold tracking-tight">
          <span class="flex size-9 items-center justify-center bg-brand/10 text-brand-text">
            <app-icon name="FolderPlus" class="size-4" />
          </span>
          New workspace
        </div>
        <p class="text-sm text-muted-foreground">
          Configure details or pick a preset template to set up your knowledge namespace.
        </p>
      </div>

      <div class="space-y-2 py-2">
        <p class="text-sm font-medium">Preset templates</p>
        <div class="grid grid-cols-3 gap-2">
          @for (tpl of templates; track tpl.name) {
            <button
              type="button"
              (click)="selectTemplate(tpl)"
              class="space-y-2 cursor-pointer border bg-muted/20 p-3 text-left transition-all hover:border-brand/40 hover:bg-brand/[0.06]"
            >
              <app-icon [name]="tpl.icon" class="size-4 text-brand-text" />
              <p class="line-clamp-2 text-[11px] leading-tight font-semibold">{{ tpl.name }}</p>
            </button>
          }
        </div>
      </div>

      <div class="space-y-4 py-2">
        <div class="space-y-2">
          <label appLabel for="ws-name">Workspace name</label>
          <input
            appInput
            id="ws-name"
            placeholder="e.g. Q3 Financial Reports or React Architecture"
            [value]="newName()"
            (input)="onNameInput($event)"
            class="h-10 rounded-md text-sm"
          />
        </div>
        <div class="space-y-2">
          <label appLabel for="ws-desc">Description</label>
          <textarea
            appTextarea
            id="ws-desc"
            placeholder="Brief summary of the documents and knowledge stored in this workspace..."
            [value]="newDescription()"
            (input)="onDescriptionInput($event)"
            class="h-20 rounded-md text-sm"
          ></textarea>
        </div>
        <div class="space-y-2">
          <label appLabel for="ws-tags">Tags (comma separated)</label>
          <input
            appInput
            id="ws-tags"
            placeholder="e.g. codebase, pdfs, finance"
            [value]="newTags()"
            (input)="onTagsInput($event)"
            class="h-10 rounded-md text-sm"
          />
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button appButton variant="outlinePill" type="button" (click)="isModalOpen.set(false)" class="cursor-pointer text-sm font-medium">
          Cancel
        </button>
        <button appButton variant="pill" class="gap-2 cursor-pointer" (click)="createWorkspace()" [disabled]="creating()">
          <app-icon name="Plus" class="size-4" />
          {{ creating() ? 'Initializing...' : 'Create workspace' }}
        </button>
      </div>
    </app-dialog>
  `,
})
export class WorkspacesPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly apiService = inject(ApiService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly templates = PRESET_TEMPLATES;
  readonly workspaces = signal<Workspace[]>([]);
  readonly loading = signal(true);
  readonly creating = signal(false);
  readonly deleting = signal(false);
  readonly searchQuery = signal('');
  readonly selectedTag = signal<string | null>(null);
  readonly isModalOpen = signal(false);
  readonly newName = signal('');
  readonly newDescription = signal('');
  readonly newTags = signal('');
  readonly menuWorkspaceId = signal<string | null>(null);

  protected readonly sessionService = inject(SessionService);
  readonly isSessionPending = this.sessionService.hasHydrated;

  readonly allTags = computed(() => {
    const tags = new Set<string>();
    this.workspaces().forEach((workspace) => workspace.tags?.forEach((tag) => tags.add(tag)));
    return Array.from(tags);
  });

  readonly totalMaterials = computed(() =>
    this.workspaces().reduce((acc, workspace) => acc + (workspace.materials?.length || 0), 0),
  );

  readonly filteredWorkspaces = computed(() => {
    let list = this.workspaces();
    const selected = this.selectedTag();
    if (selected) {
      list = list.filter((workspace) => workspace.tags?.includes(selected));
    }
    const term = this.searchQuery().toLowerCase().trim();
    if (!term) {
      return list;
    }
    return list.filter(
      (workspace) =>
        workspace.name.toLowerCase().includes(term) ||
        workspace.description?.toLowerCase().includes(term) ||
        workspace.tags.some((tag) => tag.toLowerCase().includes(term)),
    );
  });

  constructor() {
    effect(() => {
      const token = this.sessionService.session()?.accessToken;
      console.log('[workspaces] effect', {
        token: Boolean(token),
        hydrated: this.sessionService.hasHydrated(),
        user: this.sessionService.user()?.email,
      });
      if (this.sessionService.hasHydrated() && !token) {
        void this.router.navigate(['/sign-in'], { replaceUrl: true });
      }
      if (token) {
        this.loadWorkspaces(token);
      }
    });
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onNameInput(event: Event): void {
    this.newName.set((event.target as HTMLInputElement).value);
  }

  onDescriptionInput(event: Event): void {
    this.newDescription.set((event.target as HTMLTextAreaElement).value);
  }

  onTagsInput(event: Event): void {
    this.newTags.set((event.target as HTMLInputElement).value);
  }

  private loadWorkspaces(token: string): void {
    this.loading.set(true);
    console.log('[workspaces] loadWorkspaces', token.slice(0, 12));
    this.apiService.listWorkspaces(token).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        console.log('[workspaces] loaded', data);
        this.workspaces.set(Array.isArray(data) ? data : []);
        this.loading.set(false);
      },
      error: (error: Error) => {
        console.log('[workspaces] error', error.message);
        this.toastService.error(error.message);
        this.loading.set(false);
      },
    });
  }

  openWorkspace(id: string): void {
    void this.router.navigate([`/workspaces/${id}`]);
  }

  openRoute(path: string): void {
    void this.router.navigate([path]);
  }

  toggleMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.menuWorkspaceId.update((current) => (current === id ? null : id));
  }

  openCreateDialog(): void {
    this.resetModal();
    this.isModalOpen.set(true);
  }

  private resetModal(): void {
    this.newName.set('');
    this.newDescription.set('');
    this.newTags.set('');
  }

  selectTemplate(tpl: (typeof PRESET_TEMPLATES)[number]): void {
    this.newName.set(tpl.name);
    this.newDescription.set(tpl.description);
    this.newTags.set(tpl.tags.join(', '));
  }

  createWorkspace(): void {
    const token = this.sessionService.session()?.accessToken;
    if (!token) {
      return;
    }
    this.creating.set(true);
    this.apiService.createWorkspace(token).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (created) => {
        const name = this.newName().trim();
        const description = this.newDescription().trim();
        const tagList = this.newTags()
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);

        if (name || description || tagList.length) {
          this.apiService
            .updateWorkspace(token, created.id, {
              name: name || created.name,
              description,
              tags: tagList.length ? tagList : created.tags,
            })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (workspace) => {
                this.workspaces.update((current) => [...current, workspace]);
                this.afterCreate(workspace.id);
              },
              error: (error: Error) => {
                this.toastService.error(error.message);
                this.creating.set(false);
              },
            });
        } else {
          this.workspaces.update((current) => [...current, created]);
          this.afterCreate(created.id);
        }
      },
      error: (error: Error) => {
        this.toastService.error(error.message);
        this.creating.set(false);
      },
    });
  }

  private afterCreate(id: string): void {
    this.toastService.success('RAG workspace initialized!');
    this.isModalOpen.set(false);
    this.resetModal();
    this.creating.set(false);
    void this.router.navigate([`/workspaces/${id}`]);
  }

  deleteWorkspace(id: string): void {
    const token = this.sessionService.session()?.accessToken;
    if (!token) {
      return;
    }
    this.deleting.set(true);
    this.apiService.deleteWorkspace(token, id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.workspaces.update((current) => current.filter((workspace) => workspace.id !== id));
        this.menuWorkspaceId.set(null);
        this.deleting.set(false);
        this.toastService.success('Workspace deleted');
      },
      error: (error: Error) => {
        this.toastService.error(error.message);
        this.deleting.set(false);
      },
    });
  }
}
