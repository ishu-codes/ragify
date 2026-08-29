import { Component, computed, effect, inject, signal, viewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';
import { ToastService } from '../../services/toast.service';
import { UploadService } from '../../services/upload.service';
import { DashedPanelComponent } from '../../components/marketing/dashed-panel.component';
import { BadgeComponent } from '../../components/ui/badge.component';
import { ButtonComponent } from '../../components/ui/button.component';
import { IconComponent } from '../../components/shared/icon.component';
import { BytesPipe } from '../../pipes/format.pipe';
import type { IconName } from '../../components/shared/icons';
import type { WorkspaceMaterial } from '../../types/models';

function materialIcon(kind: string): IconName {
  const normalized = kind.toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(normalized)) {
    return 'FileImage';
  }
  if (['json', 'ts', 'tsx', 'js', 'py', 'md'].includes(normalized)) {
    return 'FileCode2';
  }
  if (['csv', 'xlsx', 'xls'].includes(normalized)) {
    return 'FileSpreadsheet';
  }
  if (['zip', 'rar', '7z'].includes(normalized)) {
    return 'FileArchive';
  }
  return 'FileText';
}

@Component({
  standalone: true,

  selector: 'app-upload-page',
  imports: [DashedPanelComponent, BadgeComponent, ButtonComponent, IconComponent, BytesPipe],
  template: `
    <div class="container space-y-8 py-10">
      <app-dashed-panel class="bg-card p-6 sm:p-8">
        <div class="flex items-center gap-3">
          <div class="flex size-10 items-center justify-center bg-brand/10 text-brand-text ring-1 ring-brand/20">
            <app-icon name="UploadCloud" class="size-5" />
          </div>
          <div class="space-y-1">
            <h2 class="text-lg font-semibold tracking-tight">Upload source materials</h2>
            <p class="text-xs text-muted-foreground">
              Add PDFs, Markdown files, code, or JSON datasets to index into this workspace vector store.
            </p>
          </div>
        </div>
        <div class="mt-6 space-y-6">
          <input #fileInput class="hidden" multiple type="file" (change)="onFileChange($event)" />

          <div
            [class]="
              'relative flex min-h-56 w-full cursor-pointer flex-col items-center justify-center border border-dashed border-border bg-muted/20 p-8 text-center transition-all duration-200 ' +
              (isDragOver() ? 'bg-brand/[0.06] ring-1 ring-brand/50' : 'hover:bg-brand/[0.03]')
            "
            (click)="openFilePicker()"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave()"
            (drop)="onDrop($event)"
          >
            <div class="mb-4 flex size-14 items-center justify-center bg-brand/10 text-brand-text ring-1 ring-brand/20">
              <app-icon name="UploadCloud" class="size-6" />
            </div>
            <p class="text-sm font-semibold tracking-tight">Drag and drop files here, or click to browse</p>
            <p class="mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground">
              Supports PDF, Markdown (.md), TypeScript, Python, JSON, and CSV files up to 50 MB each.
            </p>
            <button appButton variant="outlinePill" class="mt-6 cursor-pointer" type="button">
              Choose files
            </button>
          </div>

          @if (uploadService.pendingFiles().length > 0) {
            <div class="space-y-4 pt-1">
              <div class="flex items-center justify-between">
                <p class="text-xs font-medium text-muted-foreground">
                  Ready to upload ({{ uploadService.pendingFiles().length }})
                </p>
                <button
                  appButton variant="pill"
                  class="gap-2 cursor-pointer"
                  (click)="startUpload()"
                  [disabled]="uploading()"
                >
                  <app-icon name="UploadCloud" class="size-4" />
                  {{
                    uploading()
                      ? 'Uploading and indexing...'
                      : 'Upload ' + uploadService.pendingFiles().length + ' file' + (uploadService.pendingFiles().length === 1 ? '' : 's')
                  }}
                </button>
              </div>
              <div class="grid gap-3 md:grid-cols-3">
                @for (file of uploadService.pendingFiles(); track file.name + file.size) {
                  <div class="flex items-center justify-between gap-3 border border-border bg-card p-3.5">
                    <div class="flex min-w-0 items-center gap-3">
                      <div class="flex size-10 shrink-0 items-center justify-center bg-muted">
                        <app-icon [name]="fileIcon(file.name)" class="size-4" />
                      </div>
                      <div class="min-w-0">
                        <p class="truncate text-xs font-semibold">{{ file.name }}</p>
                        <p class="mt-0.5 text-[10px] text-muted-foreground">{{ file.size | bytes }}</p>
                      </div>
                    </div>
                    <button
                      appButton type="button" variant="ghost" size="iconSm"
                      class="size-7 shrink-0 cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      (click)="uploadService.removePendingFile(file)"
                      title="Remove file"
                    >
                      <app-icon name="X" class="size-4" />
                    </button>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </app-dashed-panel>

      @if (uploadService.uploadStatus(); as status) {
        <app-dashed-panel class="bg-card p-6">
          <div class="flex items-center gap-2 text-base font-semibold tracking-tight">
            <app-icon [name]="statusIcon(status.status)" class="size-4" [class]="statusIconClass(status.status)" />
            Vector indexing pipeline
          </div>
          <p class="mt-1 text-xs text-muted-foreground">Files are being chunked and embedded in real time.</p>
          <div class="mt-5 space-y-4">
            <div class="flex flex-wrap items-center gap-2">
              <span appBadge variant="outline" class="rounded-full text-[11px] font-medium">Status: {{ status.status }}</span>
              <span appBadge variant="secondary" class="rounded-full font-mono text-[11px]">ID: {{ status.id }}</span>
            </div>

            <div class="space-y-2">
              @for (file of status.files; track file.id) {
                <div class="flex items-center justify-between gap-3 border border-border bg-card p-3.5">
                  <div class="flex min-w-0 items-center gap-3">
                    <div class="flex size-10 shrink-0 items-center justify-center bg-muted">
                      <app-icon [name]="materialIcon(file.kind)" class="size-4" />
                    </div>
                    <div class="min-w-0">
                      <p class="truncate text-xs font-semibold">{{ file.name }}</p>
                      <p class="mt-0.5 text-[10px] text-muted-foreground">{{ file.kind.toUpperCase() }} · {{ file.size | bytes }}</p>
                    </div>
                  </div>
                  <div class="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <span class="capitalize">{{ file.status }}</span>
                    <app-icon [name]="statusIcon(file.status)" class="size-4" [class]="statusIconClass(file.status)" />
                  </div>
                </div>
              }
            </div>
          </div>
        </app-dashed-panel>
      }

      <app-dashed-panel class="bg-card p-6">
        <div class="flex items-center gap-2 text-base font-semibold tracking-tight">
          <app-icon name="Files" class="size-4 text-brand-text" />
          Indexed workspace materials
        </div>
        <p class="mt-1 text-xs text-muted-foreground">Source files currently active in this workspace.</p>
        <div class="mt-5">
          @if (materials().length > 0) {
            <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              @for (material of materials(); track material.id) {
                <div class="flex items-center gap-3 border border-border bg-card p-3.5 transition-colors hover:border-brand/30">
                  <div class="flex size-10 shrink-0 items-center justify-center bg-muted">
                    <app-icon [name]="materialIcon(material.kind)" class="size-4" />
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-xs font-semibold">{{ material.name }}</p>
                    <p class="mt-0.5 text-[10px] font-medium text-muted-foreground">
                      {{ material.kind.toUpperCase() }} · {{ material.size | bytes }}
                    </p>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="border border-dashed border-border bg-muted/20 p-8 text-center text-xs text-muted-foreground">
              No materials uploaded to this workspace yet. Use the dropzone above to add documents.
            </div>
          }
        </div>
      </app-dashed-panel>
    </div>
  `,
})
export class UploadPageComponent {
  protected readonly uploadService = inject(UploadService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly apiService = inject(ApiService);
  private readonly sessionService = inject(SessionService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  readonly isDragOver = signal(false);
  readonly uploading = signal(false);
  readonly materials = signal<WorkspaceMaterial[]>([]);
  readonly workspaceId = signal('');

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.workspaceId.set(params.get('workspaceId') ?? '');
      this.loadMaterials();
    });

    effect(() => {
      const token = this.sessionService.session()?.accessToken;
      if (token && this.workspaceId()) {
        this.loadMaterials();
      }
    });

    // Refresh the material list once the pipeline finishes.
    effect(() => {
      void this.uploadService.refresh();
      this.loadMaterials();
    });
  }

  fileIcon(fileName: string): IconName {
    return materialIcon(fileName.split('.').pop() ?? 'file');
  }

  materialIcon(kind: string): IconName {
    return materialIcon(kind);
  }

  statusIcon(status: string): IconName {
    if (status === 'completed') {
      return 'CheckCircle2';
    }
    if (status === 'failed') {
      return 'CircleAlert';
    }
    if (status === 'processing') {
      return 'LoaderCircle';
    }
    return 'Clock3';
  }

  statusIconClass(status: string): string {
    if (status === 'completed') {
      return 'text-emerald-500';
    }
    if (status === 'failed') {
      return 'text-destructive';
    }
    if (status === 'processing') {
      return 'text-primary animate-spin';
    }
    return 'text-muted-foreground';
  }

  private loadMaterials(): void {
    const token = this.sessionService.session()?.accessToken;
    const id = this.workspaceId();
    if (!token || !id) {
      return;
    }
    this.apiService.getWorkspace(token, id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (workspace) => this.materials.set(Array.isArray(workspace?.materials) ? workspace.materials : []),
      error: () => undefined,
    });
  }

  openFilePicker(): void {
    this.fileInput()?.nativeElement.click();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.uploadService.addFiles(input.files);
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(): void {
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    this.uploadService.addFiles(event.dataTransfer?.files ?? null);
  }

  startUpload(): void {
    const token = this.sessionService.session()?.accessToken;
    const id = this.workspaceId();
    const files = this.uploadService.pendingFiles();
    if (!token || !id || files.length === 0) {
      this.toastService.error('Select files to upload first');
      return;
    }

    this.uploading.set(true);
    this.apiService.uploadFiles(token, id, files).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.uploadService.setPendingFiles([]);
        this.uploadService.setActiveUploadStatusId(response.status_id);
        this.uploading.set(false);
        this.toastService.success(response.message || 'Files uploaded. Processing started.');
      },
      error: (error: Error) => {
        this.uploading.set(false);
        this.toastService.error(error.message);
      },
    });
  }
}
