export type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
};

export type AuthSession = {
  user: User;
  accessToken: string;
};

export type AuthResponse = {
  user: User;
  access_token: string;
};

export type SessionResponse = {
  user: User;
};

export type Workspace = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  materials: WorkspaceMaterial[];
  created_at: string;
};

export type WorkspaceMaterial = {
  id: string;
  name: string;
  kind: string;
  size: number;
  mime_type: string;
  storage_path: string;
  created_at: string;
};

export type UploadStatusFile = {
  id: string;
  name: string;
  kind: string;
  size: number;
  mime_type: string;
  storage_path: string;
  status: "uploaded" | "processing" | "completed" | "failed";
  error?: string | null;
  created_at: string;
};

export type UploadStatusLog = {
  message: string;
  created_at: string;
};

export type WorkspaceUploadStatus = {
  id: string;
  workspace_id: string;
  user_id: string;
  status: "uploaded" | "processing" | "completed" | "failed";
  files: UploadStatusFile[];
  logs: UploadStatusLog[];
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  error?: string | null;
};

export type UploadResponse = {
  status_id: string;
  message: string;
};

export type QueryResponse = {
  session_id: string;
  session_name: string;
  created_at: string;
  answer: string;
};

export type WorkspaceSessionSummary = {
  id: string;
  workspace_id: string;
  name: string;
  message_count: number;
  created_at: string;
};

export type WorkspaceMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type WorkspaceSession = {
  sessionId: string | null;
  sessionName: string | null;
  createdAt: string | null;
  messages: WorkspaceMessage[];
};

export type SessionMessagesResponse = {
  id: string;
  workspace_id: string;
  name: string;
  created_at: string;
  messages: WorkspaceMessage[];
};
