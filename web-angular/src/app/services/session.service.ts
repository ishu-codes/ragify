import { isPlatformBrowser } from '@angular/common';
import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import type { AuthSession, User } from '../types/models';

const STORAGE_KEY = 'ragify-auth';

export interface StoredSession {
  state: { session: AuthSession | null };
  version: number;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly sessionSignal = signal<AuthSession | null>(null);
  private readonly hydratedSignal = signal(false);

  readonly session = this.sessionSignal.asReadonly();
  readonly hasHydrated = this.hydratedSignal.asReadonly();

  readonly user = computed<User | null>(() => this.sessionSignal()?.user ?? null);
  readonly isAuthenticated = computed(() => Boolean(this.sessionSignal()?.accessToken));

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.hydrate();
      effect(() => this.persist(this.sessionSignal()));
    }
  }

  private hydrate(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredSession;
        this.sessionSignal.set(parsed.state?.session ?? null);
      }
    } catch {
      this.sessionSignal.set(null);
    }
    this.hydratedSignal.set(true);
  }

  private persist(session: AuthSession | null): void {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { session }, version: 0 }));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Storage unavailable (SSR / private mode); auth still works for the session.
    }
  }

  setSession(session: AuthSession): void {
    this.sessionSignal.set(session);
  }

  setUser(user: User): void {
    const current = this.sessionSignal();
    if (current) {
      this.sessionSignal.set({ ...current, user });
    }
  }

  clearSession(): void {
    this.sessionSignal.set(null);
  }
}
