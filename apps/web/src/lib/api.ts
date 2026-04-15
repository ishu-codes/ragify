import type { AuthResponse, QueryResponse, SessionMessagesResponse, SessionResponse, UploadResponse, Workspace, WorkspaceSessionSummary, WorkspaceUploadStatus } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "v1";
const API_PREFIX = `${API_URL}/api/${API_VERSION}/`;

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: string;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: BodyInit | object;
  token?: string;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  let requestBody: BodyInit | undefined;

  if (isFormData) {
    requestBody = options.body as FormData;
  } else if (options.body) {
    requestBody = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_PREFIX}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...(options.body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: requestBody,
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || payload?.success === false || !payload) {
    throw new Error(payload?.error ?? `Request failed with status ${response.status}`);
  }

  return payload.data;
}

export const authApi = {
  login: (body: { email: string; password: string }) => request<AuthResponse>("auth/login", { method: "POST", body }),
  register: (body: { name: string; email: string; password: string }) =>
    request<AuthResponse>("auth/register", { method: "POST", body }),
  getSession: (token: string) => request<SessionResponse>("auth/session", { token }),
};

export const workspaceApi = {
  list: (token: string) => request<Workspace[]>("workspaces/", { token }),
  get: (token: string, workspaceId: string) => request<Workspace>(`workspaces/${workspaceId}`, { token }),
  create: (token: string) => request<Workspace>("workspaces/", { method: "POST", token }),
  update: (token: string, workspaceId: string, body: { name: string; description: string; tags: string[] }) =>
    request<Workspace>(`workspaces/${workspaceId}`, { method: "PATCH", token, body }),
  delete: (token: string, workspaceId: string) =>
    request<{ id: string }>(`workspaces/${workspaceId}`, { method: "DELETE", token }),
  upload: (token: string, workspaceId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return request<UploadResponse>(`workspaces/${workspaceId}/upload`, {
      method: "POST",
      token,
      body: formData,
    });
  },
  uploadStatus: (token: string, workspaceId: string, statusId: string) =>
    request<WorkspaceUploadStatus>(`workspaces/${workspaceId}/uploads/${statusId}`, { token }),
  query: (token: string, workspaceId: string, body: { session_id?: string | null; query: string }) =>
    request<QueryResponse>(`workspaces/${workspaceId}/query`, {
      method: "POST",
      token,
      body,
    }),
  sessions: (token: string, workspaceId: string) =>
    request<WorkspaceSessionSummary[]>(`workspaces/${workspaceId}/sessions`, { token }),
  renameSession: (token: string, workspaceId: string, sessionId: string, body: { name: string }) =>
    request<WorkspaceSessionSummary>(`workspaces/${workspaceId}/sessions/${sessionId}`, {
      method: "PATCH",
      token,
      body,
    }),
  deleteSession: (token: string, workspaceId: string, sessionId: string) =>
    request<{ id: string }>(`workspaces/${workspaceId}/sessions/${sessionId}`, { method: "DELETE", token }),
  deleteAllSessions: (token: string, workspaceId: string) =>
    request<{ workspace_id: string }>(`workspaces/${workspaceId}/sessions`, { method: "DELETE", token }),
  sessionMessages: (token: string, workspaceId: string, sessionId: string) =>
    request<SessionMessagesResponse>(`workspaces/${workspaceId}/sessions/${sessionId}/messages`, { token }),
};

export { API_URL };
