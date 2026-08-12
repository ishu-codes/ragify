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
  FileText,
  LoaderCircle,
  UploadCloud,
  XIcon,
  Sparkles,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/hooks/useAuthSession";
import { workspaceApi } from "@/lib/api";
import type { UploadStatusFile, WorkspaceMaterial } from "@/lib/types";
import { useWorkspaceUpload } from "./WorkspaceUploadContext";
import { cn } from "@/lib/utils";

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function MaterialIcon({ kind }: { kind: string }) {
  const normalizedKind = kind.toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(normalizedKind)) {
    return <FileImage className="size-5 text-purple-500" />;
  }
  if (["json", "ts", "tsx", "js", "py", "md"].includes(normalizedKind)) {
    return <FileCode2 className="size-5 text-blue-500" />;
  }
  if (["csv", "xlsx", "xls"].includes(normalizedKind)) {
    return <FileSpreadsheet className="size-5 text-emerald-500" />;
  }
  if (["zip", "rar", "7z"].includes(normalizedKind)) {
    return <FileArchive className="size-5 text-amber-500" />;
  }
  return <FileText className="size-5 text-primary" />;
}

function MaterialCard({ material }: { material: WorkspaceMaterial }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/80 p-4 hover:border-primary/40 transition-all shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5 shrink-0">
          <MaterialIcon kind={material.kind} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-xs">{material.name}</p>
          <p className="text-[10px] font-medium text-muted-foreground mt-0.5">
            {material.kind.toUpperCase()} • {formatBytes(material.size)}
          </p>
        </div>
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
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* DROPZONE CONTAINER */}
      <Card className="rounded-3xl border shadow-sm overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Sparkles className="h-4 w-4" /> Ingestion Pipeline
          </div>
          <CardTitle className="text-2xl font-bold">Upload Source Materials</CardTitle>
          <CardDescription className="text-xs">
            Add PDFs, Markdown files, Codebases, or JSON datasets to index into this workspace vector store.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <input
            ref={inputRef}
            className="hidden"
            multiple
            type="file"
            onChange={(event) => addFiles(event.target.files)}
          />

          <div
            className={cn(
              "flex min-h-64 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-200",
              isDragOver
                ? "border-primary bg-primary/10 scale-[0.99]"
                : "border-border/80 bg-muted/10 hover:border-primary/50 hover:bg-primary/5",
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
            <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <UploadCloud className="size-8" />
            </div>
            <p className="font-bold text-base">Drag and drop files here, or click to browse</p>
            <p className="mt-1.5 max-w-md text-xs text-muted-foreground font-medium leading-relaxed">
              Supports PDF, Markdown (.md), TypeScript, Python, JSON, and CSV files up to 50 MB each.
            </p>
            <Button className="mt-6 rounded-xl font-bold text-xs cursor-pointer shadow-md" type="button">
              Choose Files from Computer
            </Button>
          </div>

          {/* PENDING FILES PREVIEW LIST */}
          {pendingFiles.length > 0 ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Ready to Upload ({pendingFiles.length})
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {pendingFiles.map((file) => (
                  <div
                    key={`${file.name}-${file.size}`}
                    className="rounded-2xl border bg-background p-3.5 shadow-sm flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="rounded-xl bg-primary/10 p-2 shrink-0">
                        <MaterialIcon kind={file.name.split(".").pop() ?? "file"} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs truncate">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-full text-muted-foreground hover:text-destructive cursor-pointer"
                      onClick={() => removePendingFile(file)}
                    >
                      <XIcon className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  className="rounded-xl font-bold text-xs gap-2 shadow-lg shadow-primary/20 cursor-pointer"
                  onClick={() => uploadMutation.mutate()}
                  disabled={uploadMutation.isPending}
                >
                  <UploadCloud className="h-4 w-4" />
                  {uploadMutation.isPending ? "Uploading & Indexing..." : `Upload ${pendingFiles.length} File(s)`}
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* PROCESSING STATUS */}
      {uploadStatus ? (
        <Card className="rounded-3xl border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              {statusIcon(uploadStatus.status)}
              Background Vector Indexing Pipeline
            </CardTitle>
            <CardDescription className="text-xs">
              Files are being chunked and embedded in real-time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs uppercase font-bold">
                Status: {uploadStatus.status}
              </Badge>
              <Badge variant="secondary" className="text-xs font-mono">
                ID: {uploadStatus.id}
              </Badge>
            </div>

            <div className="space-y-2">
              {uploadStatus.files.map((file) => (
                <div key={file.id} className="rounded-2xl border p-4 bg-background flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <MaterialIcon kind={file.kind} />
                    <div className="min-w-0">
                      <p className="font-bold text-xs truncate">{file.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {file.kind.toUpperCase()} • {formatBytes(file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase">{file.status}</span>
                    {statusIcon(file.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* EXISTING MATERIALS LIST */}
      <Card className="rounded-3xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Indexed Workspace Materials</CardTitle>
          <CardDescription className="text-xs">Source files currently active in this workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          {workspaceQuery.data?.materials.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {workspaceQuery.data.materials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-8 text-center text-xs text-muted-foreground font-medium">
              No materials uploaded to this workspace yet. Use the upload dropzone above to add documents.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
