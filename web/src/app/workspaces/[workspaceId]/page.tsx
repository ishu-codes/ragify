"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bot, FilesIcon, HistoryIcon, MessageSquareText, Settings2, TagsIcon, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/hooks/useAuthSession";
import { workspaceApi } from "@/lib/api";
import { readWorkspaceSession } from "@/lib/workspace-session";
import type { WorkspaceSession } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { timeStyle: "short" }).format(new Date(value));
}

export default function WorkspaceOverview() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = Array.isArray(params.workspaceId) ? params.workspaceId[0] : params.workspaceId;
  const { session } = useSession();
  const chatSession: WorkspaceSession = workspaceId
    ? readWorkspaceSession(workspaceId)
    : { sessionId: null, sessionName: null, createdAt: null, messages: [] };

  const workspaceQuery = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceApi.get(session!.accessToken, workspaceId!),
    enabled: Boolean(session?.accessToken && workspaceId),
  });

  const sessionsQuery = useQuery({
    queryKey: ["workspace-sessions", workspaceId],
    queryFn: () => workspaceApi.sessions(session!.accessToken, workspaceId!),
    enabled: Boolean(session?.accessToken && workspaceId),
  });

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <Card className="rounded-3xl border-primary/10 bg-linear-to-r from-primary/10 via-background to-background">
        <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-end lg:justify-between lg:p-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/workspaces" className="hover:text-foreground">
                Workspaces
              </Link>
              <span>/</span>
              <span>{workspaceId}</span>
              {/*<span>/</span>
              <span>Overview</span>*/}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight">{workspaceQuery.data?.name ?? "Workspace"}</h1>
              </div>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                {workspaceQuery.data?.description && workspaceQuery.data?.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {workspaceQuery.data?.tags.length ? (
                  workspaceQuery.data.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline">No tags</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2"></div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-3xl">
          <CardHeader className="space-y-1 pb-3">
            <CardDescription>Materials</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <FilesIcon className="size-5 text-primary" />
              {workspaceQuery.data?.materials.length ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-3xl">
          <CardHeader className="space-y-1 pb-3">
            <CardDescription>Stored sessions</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <HistoryIcon className="size-5 text-primary" />
              {sessionsQuery.data?.length ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-3xl">
          <CardHeader className="space-y-1 pb-3">
            <CardDescription>Local messages</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <MessageSquareText className="size-5 text-primary" />
              {chatSession.messages.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-3xl">
          <CardHeader className="space-y-1 pb-3">
            <CardDescription>Tags</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <TagsIcon className="size-5 text-primary" />
              {workspaceQuery.data?.tags.length ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)]">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Bot className="size-5 text-primary" />
              Workspace overview
            </CardTitle>
            <CardDescription>
              Use this workspace to query uploaded material, manage prior sessions, and tune metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Link
              href={`/workspaces/${workspaceId}/chat`}
              className="rounded-2xl border p-5 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-3 text-lg font-medium">
                <MessageSquareText className="size-5 text-primary" />
                Chat
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Ask questions against the indexed documents in this workspace.
              </p>
            </Link>
            <Link
              href={`/workspaces/${workspaceId}/upload`}
              className="rounded-2xl border p-5 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-3 text-lg font-medium">
                <UploadCloud className="size-5 text-primary" />
                Upload
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Add new source files and keep the material library up to date.
              </p>
            </Link>
            <Link
              href={`/workspaces/${workspaceId}/history`}
              className="rounded-2xl border p-5 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-3 text-lg font-medium">
                <HistoryIcon className="size-5 text-primary" />
                History
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Review, rename, and delete backend chat sessions for this workspace.
              </p>
            </Link>
            <Link
              href={`/workspaces/${workspaceId}/settings`}
              className="rounded-2xl border p-5 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-3 text-lg font-medium">
                <Settings2 className="size-5 text-primary" />
                Settings
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Edit workspace metadata and clear the local browser chat cache.
              </p>
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl">Recent local conversation</CardTitle>
            <CardDescription>Messages persisted in this browser for the current workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {chatSession.messages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
                No local conversation yet. Start in chat after you upload some materials.
              </div>
            ) : (
              chatSession.messages
                .slice(-4)
                .reverse()
                .map((message) => (
                  <div key={message.id} className="rounded-2xl border border-border/60 bg-background/80 p-4">
                    <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      <span>{message.role}</span>
                      <span>{formatTime(message.createdAt)}</span>
                    </div>
                    <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                  </div>
                ))
            )}

            <Button asChild className="w-full">
              <Link href={`/workspaces/${workspaceId}/chat`}>Open workspace chat</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/*<Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl">Workspace details</CardTitle>
          <CardDescription>Server-side state currently loaded for this workspace.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Description</p>
            <p className="mt-3 text-sm leading-6 text-foreground/90">
              {workspaceQuery.data?.description || "No description set yet."}
            </p>
          </div>
          <div className="rounded-2xl border p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Local session</p>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>Name: {chatSession.sessionName ?? "Not started"}</p>
              <p>Created: {chatSession.createdAt ? new Date(chatSession.createdAt).toLocaleString() : "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>*/}
    </div>
  );
}
