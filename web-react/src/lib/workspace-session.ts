import type { WorkspaceMessage, WorkspaceSession } from "@/lib/types";

const prefix = "ragify-workspace-session";

function storageKey(workspaceId: string) {
  return `${prefix}:${workspaceId}`;
}

export function readWorkspaceSession(workspaceId: string): WorkspaceSession {
  const raw = localStorage.getItem(storageKey(workspaceId));

  if (!raw) {
    return { sessionId: null, sessionName: null, createdAt: null, messages: [] };
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
    return { sessionId: null, sessionName: null, createdAt: null, messages: [] };
  }
}

export function writeWorkspaceSession(workspaceId: string, session: WorkspaceSession) {
  localStorage.setItem(storageKey(workspaceId), JSON.stringify(session));
}

export function clearWorkspaceSession(workspaceId: string) {
  localStorage.removeItem(storageKey(workspaceId));
}

export function createWorkspaceMessage(role: WorkspaceMessage["role"], content: string): WorkspaceMessage {
  return {
    id: `${role}-${crypto.randomUUID()}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}
