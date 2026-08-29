import { isPlatformBrowser } from '@angular/common';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import type { WorkspaceMessage, WorkspaceSession } from '../types/models';

const PREFIX = 'ragify-workspace-session';

function emptySession(): WorkspaceSession {
  return { sessionId: null, sessionName: null, createdAt: null, messages: [] };
}

@Injectable({ providedIn: 'root' })
export class WorkspaceSessionService {
  private readonly platformId = inject(PLATFORM_ID);

  private key(workspaceId: string): string {
    return `${PREFIX}:${workspaceId}`;
  }

  read(workspaceId: string): WorkspaceSession {
    if (!isPlatformBrowser(this.platformId)) {
      return emptySession();
    }
    const raw = localStorage.getItem(this.key(workspaceId));
    if (!raw) {
      return emptySession();
    }
    try {
      const parsed = JSON.parse(raw) as Partial<WorkspaceSession>;
      return {
        sessionId: parsed.sessionId ?? null,
        sessionName: parsed.sessionName ?? null,
        createdAt: parsed.createdAt ?? null,
        messages: parsed.messages ?? [],
      };
    } catch {
      return emptySession();
    }
  }

  write(workspaceId: string, session: WorkspaceSession): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.key(workspaceId), JSON.stringify(session));
    }
  }

  clear(workspaceId: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.key(workspaceId));
    }
  }

  createMessage(role: WorkspaceMessage['role'], content: string): WorkspaceMessage {
    return {
      id: `${role}-${crypto.randomUUID()}`,
      role,
      content,
      createdAt: new Date().toISOString(),
    };
  }
}
