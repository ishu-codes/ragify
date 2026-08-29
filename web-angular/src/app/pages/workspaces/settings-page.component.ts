import { Component, effect, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';
import { ToastService } from '../../services/toast.service';
import { WorkspaceSessionService } from '../../services/workspace-session.service';
import { DashedPanelComponent } from '../../components/marketing/dashed-panel.component';
import { InputComponent } from '../../components/ui/input.component';
import { TextareaComponent } from '../../components/ui/textarea.component';
import { LabelComponent } from '../../components/ui/label.component';
import { ButtonComponent } from '../../components/ui/button.component';
import { IconComponent } from '../../components/shared/icon.component';
import type { Workspace } from '../../types/models';

type SettingsTab = 'details' | 'environment' | 'maintenance';

@Component({
  standalone: true,

  selector: 'app-settings-page',
  imports: [
    ReactiveFormsModule,
    DashedPanelComponent,
    InputComponent,
    TextareaComponent,
    LabelComponent,
    ButtonComponent,
    IconComponent,
  ],
  template: `
    <div class="container max-w-3xl space-y-8 py-10">
      <header class="space-y-1.5">
        <h1 class="text-2xl font-semibold tracking-tight">Workspace settings</h1>
        <p class="text-sm text-muted-foreground">Manage identity, environment, and maintenance for this workspace.</p>
      </header>

      <div class="flex gap-0 overflow-x-auto border-b border-border">
        @for (tab of tabs; track tab.value) {
          <button
            type="button"
            (click)="activeTab.set(tab.value)"
            class="flex cursor-pointer items-center gap-1.5 rounded-none border-b-2 px-4 py-2.5 text-xs transition-colors"
            [class]="
              activeTab() === tab.value ?
                'border-brand bg-transparent font-medium text-foreground' :
                'border-transparent font-medium text-muted-foreground hover:text-foreground'
            "
            [attr.aria-selected]="activeTab() === tab.value"
            role="tab"
          >
            <app-icon [name]="tab.icon" class="size-3.5" />
            {{ tab.label }}
          </button>
        }
      </div>

      @switch (activeTab()) {
        @case ('details') {
          <app-dashed-panel class="bg-card p-6 sm:p-8">
            <div class="space-y-1.5">
              <h2 class="text-base font-semibold tracking-tight">Workspace details</h2>
              <p class="text-xs text-muted-foreground">Edit the identity and context shown across this workspace.</p>
            </div>
            <form [formGroup]="form" class="mt-6 space-y-4" novalidate>
              <div class="space-y-2">
                <label appLabel for="workspace-name">Name</label>
                <input appInput id="workspace-name" formControlName="name" class="h-10 rounded-md text-sm" />
              </div>
              <div class="space-y-2">
                <label appLabel for="workspace-description">Description</label>
                <textarea
                  appTextarea
                  id="workspace-description"
                  formControlName="description"
                  class="min-h-24 rounded-md text-sm"
                ></textarea>
              </div>
              <div class="space-y-2">
                <label appLabel for="workspace-tags">Tags</label>
                <input
                  appInput
                  id="workspace-tags"
                  formControlName="tags"
                  placeholder="research, onboarding, product docs"
                  class="h-10 rounded-md text-sm"
                />
              </div>
              <div class="flex justify-end pt-1">
                <button appButton variant="pill" class="gap-2 cursor-pointer" (click)="saveDetails()" [disabled]="saving()">
                  <app-icon name="Save" class="size-4" />
                  {{ saving() ? 'Saving...' : 'Save changes' }}
                </button>
              </div>
            </form>
          </app-dashed-panel>
        }
        @case ('environment') {
          <app-dashed-panel class="bg-card p-6 sm:p-8">
            <div class="space-y-1.5">
              <h2 class="text-base font-semibold tracking-tight">Environment</h2>
              <p class="text-xs text-muted-foreground">Current backend configuration used by this workspace.</p>
            </div>
            <div class="mt-6">
              <div class="flex flex-col gap-3 border border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="min-w-0 space-y-1">
                  <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <app-icon name="Cable" class="size-3.5" />
                    API base URL
                  </div>
                  <p class="truncate font-mono text-sm">{{ apiUrl() }}</p>
                </div>
                <button appButton variant="ghost" class="shrink-0 cursor-pointer gap-1.5 text-xs" (click)="copyUrl()">
                  <app-icon [name]="urlCopied() ? 'Check' : 'Copy'" class="size-3.5" [class.text-emerald-500]="urlCopied()" />
                  {{ urlCopied() ? 'Copied' : 'Copy' }}
                </button>
              </div>
            </div>
          </app-dashed-panel>
        }
        @case ('maintenance') {
          <app-dashed-panel class="bg-card p-6 sm:p-8">
            <div class="space-y-1.5">
              <h2 class="text-base font-semibold tracking-tight">Maintenance</h2>
              <p class="text-xs text-muted-foreground">Clear any locally cached chat session for this workspace.</p>
            </div>
            <div class="mt-6">
              <button
                appButton variant="outlinePill"
                class="gap-2 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                (click)="clearLocalCache()"
              >
                <app-icon name="Trash2" class="size-4" />
                Clear local session cache
              </button>
            </div>
          </app-dashed-panel>
        }
      }
    </div>
  `,
})
export class SettingsPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly apiService = inject(ApiService);
  private readonly sessionService = inject(SessionService);
  private readonly toastService = inject(ToastService);
  private readonly workspaceSessionService = inject(WorkspaceSessionService);
  private readonly route = inject(ActivatedRoute);

  readonly tabs = [
    { value: 'details' as const, label: 'Details', icon: 'Settings2' as const },
    { value: 'environment' as const, label: 'Environment', icon: 'Cable' as const },
    { value: 'maintenance' as const, label: 'Maintenance', icon: 'Wrench' as const },
  ];

  readonly activeTab = signal<SettingsTab>('details');
  readonly saving = signal(false);
  readonly urlCopied = signal(false);
  readonly workspaceId = signal('');
  readonly workspace = signal<Workspace | null>(null);
  readonly apiUrl = signal('');

  readonly form = this.fb.nonNullable.group({
    name: [''],
    description: [''],
    tags: [''],
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.workspaceId.set(params.get('workspaceId') ?? '');
      this.loadWorkspace();
    });

    effect(() => {
      const token = this.sessionService.session()?.accessToken;
      if (token && this.workspaceId()) {
        this.loadWorkspace();
      }
    });

    effect(() => {
      const workspace = this.workspace();
      if (workspace) {
        this.form.setValue(
          {
            name: workspace.name,
            description: workspace.description,
            tags: workspace.tags.join(', '),
          },
          { emitEvent: false },
        );
      }
    });
  }

  private loadWorkspace(): void {
    const token = this.sessionService.session()?.accessToken;
    const id = this.workspaceId();
    if (!token || !id) {
      return;
    }
    this.apiService.getWorkspace(token, id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (workspace) => this.workspace.set(workspace),
      error: () => undefined,
    });
    this.apiUrl.set(this.apiService.apiUrl);
  }

  saveDetails(): void {
    const token = this.sessionService.session()?.accessToken;
    const id = this.workspaceId();
    if (!token || !id) {
      return;
    }
    const raw = this.form.getRawValue();
    this.saving.set(true);
    this.apiService
      .updateWorkspace(token, id, {
        name: raw.name,
        description: raw.description,
        tags: raw.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (workspace) => {
          this.workspace.set(workspace);
          this.saving.set(false);
          this.toastService.success('Workspace details updated');
        },
        error: (error: Error) => {
          this.saving.set(false);
          this.toastService.error(error.message);
        },
      });
  }

  copyUrl(): void {
    void navigator.clipboard.writeText(this.apiUrl());
    this.urlCopied.set(true);
    this.toastService.success('API URL copied');
    setTimeout(() => this.urlCopied.set(false), 2000);
  }

  clearLocalCache(): void {
    const id = this.workspaceId();
    if (!id) {
      return;
    }
    this.workspaceSessionService.clear(id);
    this.toastService.success('Local session cache cleared');
  }
}
