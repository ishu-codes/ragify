import { isPlatformBrowser } from '@angular/common';
import { Injectable, inject, signal, effect, PLATFORM_ID } from '@angular/core';
import { timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { SessionService } from './session.service';
import type { WorkspaceUploadStatus } from '../types/models';

function storageKey(workspaceId: string): string {
  return `ragify:workspace-upload-status:${workspaceId}`;
}

@Injectable()
export class UploadService {
  private readonly apiService = inject(ApiService);
  private readonly sessionService = inject(SessionService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly workspaceId = signal<string>('');
  private readonly pendingFilesSignal = signal<File[]>([]);
  private readonly activeUploadStatusIdSignal = signal<string | null>(null);
  private readonly uploadStatusSignal = signal<WorkspaceUploadStatus | null>(null);
  private readonly uploadStatusLoadingSignal = signal(false);
  private readonly refreshTrigger = signal(0);
  private lastPersistedId: string | null = null;

  readonly pendingFiles = this.pendingFilesSignal.asReadonly();
  readonly activeUploadStatusId = this.activeUploadStatusIdSignal.asReadonly();
  readonly uploadStatus = this.uploadStatusSignal.asReadonly();
  readonly uploadStatusLoading = this.uploadStatusLoadingSignal.asReadonly();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = sessionStorage.getItem(storageKey(this.workspaceId()));
      if (stored) {
        this.activeUploadStatusIdSignal.set(stored);
      }
    }

    // Persist the active upload id for the workspace.
    effect(() => {
      const id = this.activeUploadStatusIdSignal();
      if (id !== this.lastPersistedId) {
        if (!isPlatformBrowser(this.platformId) || !this.workspaceId()) {
          return;
        }
        const key = storageKey(this.workspaceId());
        if (id) {
          sessionStorage.setItem(key, id);
        } else {
          sessionStorage.removeItem(key);
        }
        this.lastPersistedId = id;
      }
    });

    timer(0, 2000)
      .pipe(
        switchMap(() => {
          const token = this.sessionService.session()?.accessToken;
          const statusId = this.activeUploadStatusIdSignal();
          const workspaceId = this.workspaceId();
          if (!token || !statusId || !workspaceId) {
            return [];
          }
          this.uploadStatusLoadingSignal.set(true);
          return this.apiService.uploadStatus(token, workspaceId, statusId);
        }),
        // Kept alive for the lifetime of the route-provided service.
      )
      .subscribe({
        next: (status) => {
          this.uploadStatusSignal.set(status);
          this.uploadStatusLoadingSignal.set(false);
          if (status.status === 'completed' || status.status === 'failed') {
            this.refreshTrigger.update((value) => value + 1);
            if (isPlatformBrowser(this.platformId) && this.workspaceId()) {
              sessionStorage.removeItem(storageKey(this.workspaceId()));
            }
          }
        },
        error: () => {
          this.uploadStatusLoadingSignal.set(false);
        },
      });
  }

  configure(workspaceId: string): void {
    this.workspaceId.set(workspaceId);
    if (isPlatformBrowser(this.platformId)) {
      this.activeUploadStatusIdSignal.set(sessionStorage.getItem(storageKey(workspaceId)));
    }
  }

  setPendingFiles(files: File[]): void {
    this.pendingFilesSignal.set(files);
  }

  addFiles(files: FileList | File[] | null): void {
    if (!files) {
      return;
    }
    const incoming = Array.from(files);
    this.pendingFilesSignal.update((current) => {
      const next = [...current];
      for (const file of incoming) {
        if (!next.some((item) => item.name === file.name && item.size === file.size)) {
          next.push(file);
        }
      }
      return next;
    });
  }

  removePendingFile(target: File): void {
    this.pendingFilesSignal.update((current) =>
      current.filter((file) => !(file.name === target.name && file.size === target.size)),
    );
  }

  setActiveUploadStatusId(id: string | null): void {
    this.activeUploadStatusIdSignal.set(id);
  }

  clear(): void {
    this.pendingFilesSignal.set([]);
    this.activeUploadStatusIdSignal.set(null);
    this.uploadStatusSignal.set(null);
  }

  readonly refresh = this.refreshTrigger.asReadonly();
}
