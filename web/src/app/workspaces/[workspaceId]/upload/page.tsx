"use client";

import { useRef } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileArchive,
  FileCode2,
  FileImage,
  FileText,
  LoaderCircle,
  UploadCloud,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/hooks/useAuthSession";
import { workspaceApi } from "@/lib/api";
import type { UploadStatusFile, WorkspaceMaterial } from "@/lib/types";
import { useWorkspaceUpload } from "../WorkspaceUploadContext";

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function MaterialIcon({ kind }: { kind: string }) {
  const normalizedKind = kind.toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(normalizedKind)) {
    return <FileImage className="size-5 text-primary" />;
  }
  if (["json", "ts", "tsx", "js", "py", "md"].includes(normalizedKind)) {
    return <FileCode2 className="size-5 text-primary" />;
  }
  if (["zip", "rar", "7z"].includes(normalizedKind)) {
    return <FileArchive className="size-5 text-primary" />;
  }
  return <FileText className="size-5 text-primary" />;
}

function MaterialCard({ material }: { material: WorkspaceMaterial }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-2">
          <MaterialIcon kind={material.kind} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{material.name}</p>
          <p className="text-sm text-muted-foreground">
            {material.kind.toUpperCase()} • {formatBytes(material.size)}
          </p>
        </div>
      </div>
    </div>
  );
}

function statusIcon(status: UploadStatusFile["status"] | "uploaded" | "processing" | "completed" | "failed") {
  if (status === "completed") {
    return <CheckCircle2 className="size-4 text-emerald-600" />;
  }
  if (status === "failed") {
    return <CircleAlert className="size-4 text-destructive" />;
  }
  if (status === "processing") {
    return <LoaderCircle className="size-4 animate-spin text-primary" />;
  }
  return <Clock3 className="size-4 text-muted-foreground" />;
}

export default function UploadPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = Array.isArray(params.workspaceId) ? params.workspaceId[0] : params.workspaceId;
  const { session } = useSession();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { pendingFiles, setPendingFiles, setActiveUploadStatusId, uploadStatus } = useWorkspaceUpload();

  const workspaceQuery = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceApi.get(session!.accessToken, workspaceId!),
    enabled: Boolean(session?.accessToken && workspaceId),
  });

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!workspaceId || !session || pendingFiles.length === 0) {
        throw new Error("Select files to upload first");
      }

      return workspaceApi.upload(session.accessToken, workspaceId, pendingFiles);
    },
    onSuccess: ({ status_id, message }) => {
      setPendingFiles([]);
      setActiveUploadStatusId(status_id);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      toast.success(message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function addFiles(files: FileList | null) {
    if (!files) {
      return;
    }

    setPendingFiles((current) => {
      const next = [...current];
      for (const file of Array.from(files)) {
        if (!next.some((item) => item.name === file.name && item.size === file.size)) {
          next.push(file);
        }
      }
      return next;
    });
  }

  function removePendingFile(fileToRemove: File) {
    setPendingFiles((current) =>
      current.filter((file) => !(file.name === fileToRemove.name && file.size === fileToRemove.size)),
    );
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <UploadCloud className="size-5 text-primary" />
            Upload materials
          </CardTitle>
          <CardDescription>
            Drop files here or browse from disk to add new source material to this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={inputRef}
            className="hidden"
            multiple
            type="file"
            onChange={(event) => addFiles(event.target.files)}
          />

          <div
            className="flex min-h-64 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-muted/20 px-6 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              addFiles(event.dataTransfer.files);
            }}
          >
            <UploadCloud className="mb-4 size-10 text-primary" />
            <p className="font-medium">Drag and drop files here</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Files upload immediately, then the server parses and indexes them in the background.
            </p>
            <Button className="mt-6 cursor-pointer" type="button">
              Choose files
            </Button>
          </div>

          {pendingFiles.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium">Ready to upload</p>
              <div className="grid gap-3 md:grid-cols-3">
                {pendingFiles.map((file) => (
                  <div key={`${file.name}-${file.size}`} className="rounded-2xl border border-border/60 bg-background/80 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-primary/10 p-2">
                        <MaterialIcon kind={file.name.split(".").pop() ?? "file"} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">
                          {file.name.length > 25
                            ? `${file.name.slice(0, 20)}...${file.name.slice(file.name.lastIndexOf("."))}`
                            : file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                        onClick={() => removePendingFile(file)}
                        aria-label={`Remove ${file.name}`}
                      >
                        <XIcon className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <Button className="cursor-pointer" onClick={() => uploadMutation.mutate()} disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? "Uploading..." : "Upload files"}
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {uploadStatus ? (
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              {statusIcon(uploadStatus.status)}
              Upload processing
            </CardTitle>
            <CardDescription>Files are uploaded. The server is parsing and indexing them in the background.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline">Status: {uploadStatus.status}</Badge>
              <Badge variant="secondary">Upload ID: {uploadStatus.id}</Badge>
            </div>

            <div className="space-y-3">
              {uploadStatus.files.map((file) => (
                <div key={file.id} className="rounded-2xl border border-border/60 bg-background/80 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-primary/10 p-2">
                      <MaterialIcon kind={file.kind} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{file.name}</p>
                        {statusIcon(file.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {file.kind.toUpperCase()} • {formatBytes(file.size)} • {file.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl">Uploaded materials</CardTitle>
          <CardDescription>Files already attached to this workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          {workspaceQuery.data?.materials.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {workspaceQuery.data.materials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
              No materials uploaded yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
