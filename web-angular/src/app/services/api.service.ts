import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { SessionService } from './session.service';
import type {
  AuthResponse,
  QueryResponse,
  SessionMessagesResponse,
  SessionResponse,
  UploadResponse,
  Workspace,
  WorkspaceSessionSummary,
  WorkspaceUploadStatus,
} from '../types/models';

const API_URL = (globalThis as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:8000';
const API_VERSION = (globalThis as { env?: Record<string, string> }).env?.['VITE_API_VERSION'] ?? 'v1';
const API_PREFIX = `${API_URL}/api/${API_VERSION}/`;

interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  formData?: FormData;
  signal?: AbortSignal;
  token?: string;
}

function toError(error: unknown): Error {
  if (error instanceof HttpErrorResponse) {
    const detail = (error.error as { detail?: string } | null)?.detail;
    return new Error(detail ?? `Request failed with status ${error.status}`);
  }
  if (error instanceof Error) {
    return error;
  }
  return new Error('An unexpected error occurred');
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly sessionService = inject(SessionService);

  get<T>(path: string, options?: RequestOptions): Observable<T> {
    return this.request<T>('GET', path, options);
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Observable<T> {
    return this.request<T>('POST', path, { ...options, body });
  }

  postForm<T>(path: string, formData: FormData, options?: RequestOptions): Observable<T> {
    return this.request<T>('POST', path, { ...options, formData });
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Observable<T> {
    return this.request<T>('PATCH', path, { ...options, body });
  }

  delete<T>(path: string, options?: RequestOptions): Observable<T> {
    return this.request<T>('DELETE', path, options);
  }

  login(body: { email: string; password: string }): Observable<AuthResponse> {
    return this.post<AuthResponse>('auth/login', body);
  }

  register(body: { name: string; email: string; password: string }): Observable<AuthResponse> {
    return this.post<AuthResponse>('auth/register', body);
  }

  getSession(token: string): Observable<SessionResponse> {
    return this.get<SessionResponse>('auth/session', { token });
  }

  listWorkspaces(token: string): Observable<Workspace[]> {
    return this.get<Workspace[]>('workspaces/', { token });
  }

  getWorkspace(token: string, workspaceId: string): Observable<Workspace> {
    return this.get<Workspace>(`workspaces/${workspaceId}`, { token });
  }

  createWorkspace(token: string): Observable<Workspace> {
    return this.post<Workspace>('workspaces/', {}, { token });
  }

  updateWorkspace(
    token: string,
    workspaceId: string,
    body: { name: string; description: string; tags: string[] },
  ): Observable<Workspace> {
    return this.patch<Workspace>(`workspaces/${workspaceId}`, body, { token });
  }

  deleteWorkspace(token: string, workspaceId: string): Observable<{ id: string }> {
    return this.delete<{ id: string }>(`workspaces/${workspaceId}`, { token });
  }

  uploadFiles(token: string, workspaceId: string, files: File[]): Observable<UploadResponse> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.postForm<UploadResponse>(`workspaces/${workspaceId}/upload`, formData, {
      token,
    });
  }

  uploadStatus(token: string, workspaceId: string, statusId: string): Observable<WorkspaceUploadStatus> {
    return this.get<WorkspaceUploadStatus>(`workspaces/${workspaceId}/uploads/${statusId}`, {
      token,
    });
  }

  query(
    token: string,
    workspaceId: string,
    body: { session_id?: string | null; query: string },
  ): Observable<QueryResponse> {
    return this.post<QueryResponse>(`workspaces/${workspaceId}/query`, body, {
      token,
    });
  }

  sessions(token: string, workspaceId: string): Observable<WorkspaceSessionSummary[]> {
    return this.get<WorkspaceSessionSummary[]>(`workspaces/${workspaceId}/sessions`, {
      token,
    });
  }

  renameSession(
    token: string,
    workspaceId: string,
    sessionId: string,
    body: { name: string },
  ): Observable<WorkspaceSessionSummary> {
    return this.patch<WorkspaceSessionSummary>(`workspaces/${workspaceId}/sessions/${sessionId}`, body, {
      token,
    });
  }

  deleteSession(token: string, workspaceId: string, sessionId: string): Observable<{ id: string }> {
    return this.delete<{ id: string }>(`workspaces/${workspaceId}/sessions/${sessionId}`, {
      token,
    });
  }

  deleteAllSessions(token: string, workspaceId: string): Observable<{ workspace_id: string }> {
    return this.delete<{ workspace_id: string }>(`workspaces/${workspaceId}/sessions`, {
      token,
    });
  }

  sessionMessages(
    token: string,
    workspaceId: string,
    sessionId: string,
  ): Observable<SessionMessagesResponse> {
    return this.get<SessionMessagesResponse>(`workspaces/${workspaceId}/sessions/${sessionId}/messages`, {
      token,
    });
  }

  get apiUrl(): string {
    return API_URL;
  }

  private request<T>(method: string, path: string, options: RequestOptions = {}): Observable<T> {
    const fullPath = this.withParams(path, options.params);
    const token = options.token ?? this.sessionService.session()?.accessToken;

    let headers = new HttpHeaders();
    if (options.body && !options.formData) {
      headers = headers.set('Content-Type', 'application/json');
    }
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http
      .request<T>(method, `${API_PREFIX}${fullPath}`, {
        headers,
        body: options.formData ?? (options.body !== undefined ? JSON.stringify(options.body) : undefined),
      })
      .pipe(catchError((error: unknown) => throwError(() => toError(error))));
  }

  private withParams(path: string, params?: RequestOptions['params']): string {
    if (!params) {
      return path;
    }
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (!queryString) {
      return path;
    }
    return `${path}${path.includes('?') ? '&' : '?'}${queryString}`;
  }
}
