export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface SessionResponse {
  user: User;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  tags: string[];
  materials: WorkspaceMaterial[];
  created_at: string;
}

export interface WorkspaceMaterial {
  id: string;
  name: string;
  kind: string;
  size: number;
  mime_type: string;
  storage_path: string;
  created_at: string;
}

export type UploadStatusState = 'uploaded' | 'processing' | 'completed' | 'failed';

export interface UploadStatusFile {
  id: string;
  name: string;
  kind: string;
  size: number;
  mime_type: string;
  storage_path: string;
  status: UploadStatusState;
  error?: string | null;
  created_at: string;
}

export interface UploadStatusLog {
  message: string;
  created_at: string;
}

export interface WorkspaceUploadStatus {
  id: string;
  workspace_id: string;
  user_id: string;
  status: UploadStatusState;
  files: UploadStatusFile[];
  logs: UploadStatusLog[];
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  error?: string | null;
}

export interface UploadResponse {
  status_id: string;
  message: string;
}

export interface QueryResponse {
  session_id: string;
  session_name: string;
  created_at: string;
  answer: string;
}

export interface WorkspaceSessionSummary {
  id: string;
  workspace_id: string;
  name: string;
  message_count: number;
  created_at: string;
}

export interface WorkspaceMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface WorkspaceSession {
  sessionId: string | null;
  sessionName: string | null;
  createdAt: string | null;
  messages: WorkspaceMessage[];
}

export interface SessionMessagesResponse {
  id: string;
  workspace_id: string;
  name: string;
  created_at: string;
  messages: WorkspaceMessage[];
}
