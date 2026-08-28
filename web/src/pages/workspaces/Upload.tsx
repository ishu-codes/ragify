import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileArchive,
  FileCode2,
  FileImage,
  FileSpreadsheet,
  FileText,
  FilesIcon,
  LoaderCircle,
  UploadCloud,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useAuthSession";
import { workspaceApi } from "@/lib/api";
import type { UploadStatusFile, WorkspaceMaterial } from "@/lib/types";
import { useWorkspaceUpload } from "./UploadContext";
import { cn } from "@/lib/utils";
import { DashedPanel } from "@/components/marketing/DashedPanel";

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function MaterialIcon({ kind }: { kind: string }) {
  const normalizedKind = kind.toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(normalizedKind)) {
    return <FileImage className="size-4 text-purple-500" />;
  }
  if (["json", "ts", "tsx", "js", "py", "md"].includes(normalizedKind)) {
    return <FileCode2 className="size-4 text-blue-500" />;
  }
  if (["csv", "xlsx", "xls"].includes(normalizedKind)) {
    return <FileSpreadsheet className="size-4 text-emerald-500" />;
  }
  if (["zip", "rar", "7z"].includes(normalizedKind)) {
    return <FileArchive className="size-4 text-amber-500" />;
  }
  return <FileText className="size-4 text-primary" />;
}

function MaterialCard({ material }: { material: WorkspaceMaterial }) {
  return (
    <div className="flex items-center gap-3 border border-border bg-card p-3.5 transition-colors hover:border-brand/30">
      <div className="flex size-10 shrink-0 items-center justify-center bg-muted">
        <MaterialIcon kind={material.kind} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold">{material.name}</p>
        <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
          {material.kind.toUpperCase()} · {formatBytes(material.size)}
        </p>
      </div>
    </div>
  );
}

function statusIcon(status: UploadStatusFile["status"] | "uploaded" | "processing" | "completed" | "failed") {
  if (status === "completed") {
    return <CheckCircle2 className="size-4 text-emerald-500" />;
  }
  if (status === "failed") {
    return <CircleAlert className="size-4 text-destructive" />;
  }
  if (status === "processing") {
    return <LoaderCircle className="size-4 animate-spin text-primary" />;
  }
  return <Clock3 className="size-4 text-muted-foreground" />;
}

export default function WorkspaceUploadPage() {
  const { workspaceId = "" } = useParams<{ workspaceId: string }>();
  const { session } = useSession();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { pendingFiles, setPendingFiles, setActiveUploadStatusId, uploadStatus } = useWorkspaceUpload();
  const [isDragOver, setIsDragOver] = useState(false);

  const workspaceQuery = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceApi.get(session!.accessToken, workspaceId),
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
      toast.success(message || "Files uploaded. Processing started.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function addFiles(files: FileList | null) {
    if (!files) return;

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
    <div className="container space-y-8 py-10">
      {/* UPLOAD CARD */}
      <DashedPanel className="bg-card p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center bg-brand/10 text-brand-text ring-1 ring-brand/20">
            <UploadCloud className="size-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Upload source materials</h2>
            <p className="text-xs text-muted-foreground">
              Add PDFs, Markdown files, code, or JSON datasets to index into this workspace vector store.
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-6">
          <input
            ref={inputRef}
            className="hidden"
            multiple
            type="file"
            onChange={(event) => addFiles(event.target.files)}
          />

          <div
            className={cn(
              "relative flex min-h-56 w-full cursor-pointer flex-col items-center justify-center border border-dashed border-border bg-muted/20 p-8 text-center transition-all duration-200",
              isDragOver ? "bg-brand/[0.06] ring-1 ring-brand/50" : "hover:bg-brand/[0.03]",
            )}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragOver(false);
              addFiles(event.dataTransfer.files);
            }}
          >
            <div className="">
              <div className="mb-4 flex size-14 items-center justify-center bg-brand/10 text-brand-text ring-1 ring-brand/20">
                <UploadCloud className="size-6" />
              </div>
            </div>
            <p className="text-sm font-semibold tracking-tight">Drag and drop files here, or click to browse</p>
            <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground">
              Supports PDF, Markdown (.md), TypeScript, Python, JSON, and CSV files up to 50 MB each.
            </p>
            <Button variant="outlinePill" className="mt-6 cursor-pointer" type="button">
              Choose files
            </Button>
          </div>

          {/* PENDING FILES PREVIEW LIST */}
          {pendingFiles.length > 0 ? (
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Ready to upload ({pendingFiles.length})</p>
                <Button
                  variant="pill"
                  className="gap-2 cursor-pointer"
                  onClick={() => uploadMutation.mutate()}
                  disabled={uploadMutation.isPending}
                >
                  <UploadCloud className="size-4" />
                  {uploadMutation.isPending
                    ? "Uploading and indexing..."
                    : `Upload ${pendingFiles.length} file${pendingFiles.length === 1 ? "" : "s"}`}
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {pendingFiles.map((file) => (
                  <div
                    key={`${file.name}-${file.size}`}
                    className="flex items-center justify-between gap-3 border border-border bg-card p-3.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center bg-muted">
                        <MaterialIcon kind={file.name.split(".").pop() ?? "file"} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">{file.name}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0 cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removePendingFile(file)}
                      title="Remove file"
                    >
                      <XIcon className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </DashedPanel>

      {/* PROCESSING STATUS */}
      {uploadStatus ? (
        <DashedPanel className="bg-card p-6">
          <div className="flex items-center gap-2 text-base font-semibold tracking-tight">
            {statusIcon(uploadStatus.status)}
            Vector indexing pipeline
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Files are being chunked and embedded in real time.</p>
          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full text-[11px] font-medium">
                Status: {uploadStatus.status}
              </Badge>
              <Badge variant="secondary" className="rounded-full font-mono text-[11px]">
                ID: {uploadStatus.id}
              </Badge>
            </div>

            <div className="space-y-2">
              {uploadStatus.files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between gap-3 border border-border bg-card p-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center bg-muted">
                      <MaterialIcon kind={file.kind} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{file.name}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {file.kind.toUpperCase()} · {formatBytes(file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <span className="capitalize">{file.status}</span>
                    {statusIcon(file.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashedPanel>
      ) : null}

      {/* EXISTING MATERIALS LIST */}
      <DashedPanel className="bg-card p-6">
        <div className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <FilesIcon className="size-4 text-brand-text" />
          Indexed workspace materials
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Source files currently active in this workspace.</p>
        <div className="mt-5">
          {workspaceQuery.data?.materials.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {workspaceQuery.data.materials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border bg-muted/20 p-8 text-center text-xs text-muted-foreground">
              No materials uploaded to this workspace yet. Use the dropzone above to add documents.
            </div>
          )}
        </div>
      </DashedPanel>
    </div>
  );
}
