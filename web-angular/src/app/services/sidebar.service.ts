import { isPlatformBrowser } from '@angular/common';
import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';

const STORAGE_KEY = 'ragify-sidebar';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly collapsedSignal = signal(false);

  readonly collapsed = this.collapsedSignal.asReadonly();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as {
          state?: { isCollapsed?: boolean };
        };
        this.collapsedSignal.set(Boolean(parsed.state?.isCollapsed));
      } catch {
        this.collapsedSignal.set(false);
      }
    }
  }

  setCollapsed(collapsed: boolean): void {
    this.collapsedSignal.set(collapsed);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { isCollapsed: collapsed }, version: 0 }));
    }
  }

  toggle(): void {
    this.setCollapsed(!this.collapsedSignal());
  }
}
