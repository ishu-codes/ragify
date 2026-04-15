"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useSession } from "@/hooks/useAuthSession";
import { workspaceApi } from "@/lib/api";
import type { WorkspaceUploadStatus } from "@/lib/types";

type WorkspaceUploadContextValue = {
  pendingFiles: File[];
  setPendingFiles: Dispatch<SetStateAction<File[]>>;
  activeUploadStatusId: string | null;
  setActiveUploadStatusId: (statusId: string | null) => void;
  clearActiveUploadStatus: () => void;
  uploadStatus: WorkspaceUploadStatus | undefined;
  isUploadStatusLoading: boolean;
};

const WorkspaceUploadContext = createContext<WorkspaceUploadContextValue | null>(null);

type WorkspaceUploadProviderProps = {
  children: ReactNode;
  workspaceId: string;
};

function getStorageKey(workspaceId: string) {
  return `ragify:workspace-upload-status:${workspaceId}`;
}

export function WorkspaceUploadProvider({ children, workspaceId }: WorkspaceUploadProviderProps) {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [activeUploadStatusId, setActiveUploadStatusId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.sessionStorage.getItem(getStorageKey(workspaceId));
  });

  useEffect(() => {
    const storageKey = getStorageKey(workspaceId);
    if (activeUploadStatusId) {
      window.sessionStorage.setItem(storageKey, activeUploadStatusId);
      return;
    }

    window.sessionStorage.removeItem(storageKey);
  }, [activeUploadStatusId, workspaceId]);

  const uploadStatusQuery = useQuery({
    queryKey: ["workspace-upload-status", workspaceId, activeUploadStatusId],
    queryFn: () => workspaceApi.uploadStatus(session!.accessToken, workspaceId, activeUploadStatusId!),
    enabled: Boolean(session?.accessToken && workspaceId && activeUploadStatusId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "completed" || status === "failed" ? false : 2000;
    },
  });

  useEffect(() => {
    if (uploadStatusQuery.data?.status === "completed") {
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    }
  }, [queryClient, uploadStatusQuery.data?.status, workspaceId]);

  useEffect(() => {
    const status = uploadStatusQuery.data?.status;
    if (status === "completed" || status === "failed") {
      window.sessionStorage.removeItem(getStorageKey(workspaceId));
    }
  }, [uploadStatusQuery.data?.status, workspaceId]);

  const value = useMemo<WorkspaceUploadContextValue>(
    () => ({
      pendingFiles,
      setPendingFiles,
      activeUploadStatusId,
      setActiveUploadStatusId,
      clearActiveUploadStatus: () => setActiveUploadStatusId(null),
      uploadStatus: uploadStatusQuery.data,
      isUploadStatusLoading: uploadStatusQuery.isLoading,
    }),
    [activeUploadStatusId, pendingFiles, uploadStatusQuery.data, uploadStatusQuery.isLoading],
  );

  return <WorkspaceUploadContext.Provider value={value}>{children}</WorkspaceUploadContext.Provider>;
}

export function useWorkspaceUpload() {
  const context = useContext(WorkspaceUploadContext);
  if (!context) {
    throw new Error("useWorkspaceUpload must be used within WorkspaceUploadProvider");
  }

  return context;
}
