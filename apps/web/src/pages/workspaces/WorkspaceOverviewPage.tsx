import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ChevronRight,
  FilesIcon,
  HistoryIcon,
  MessageSquareText,
  Settings2,
  TagsIcon,
  UploadCloud,
} from "lucide-react";

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

export default function WorkspaceOverviewPage() {
  const { workspaceId = "" } = useParams<{ workspaceId: string }>();
  const { session } = useSession();
  const chatSession: WorkspaceSession = workspaceId
    ? readWorkspaceSession(workspaceId)
    : { sessionId: null, sessionName: null, createdAt: null, messages: [] };

  const workspaceQuery = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceApi.get(session!.accessToken, workspaceId),
    enabled: Boolean(session?.accessToken && workspaceId),
  });

  const sessionsQuery = useQuery({
    queryKey: ["workspace-sessions", workspaceId],
    queryFn: () => workspaceApi.sessions(session!.accessToken, workspaceId),
    enabled: Boolean(session?.accessToken && workspaceId),
  });

  const stats = [
    { label: "Materials", value: workspaceQuery.data?.materials.length ?? 0, icon: FilesIcon },
    { label: "Stored sessions", value: sessionsQuery.data?.length ?? 0, icon: HistoryIcon },
    { label: "Local messages", value: chatSession.messages.length, icon: MessageSquareText },
    { label: "Tags", value: workspaceQuery.data?.tags.length ?? 0, icon: TagsIcon },
  ];

  const actions = [
    {
      title: "Chat",
      description: "Ask questions against the indexed documents in this workspace.",
      href: `/workspaces/${workspaceId}/chat`,
      icon: MessageSquareText,
    },
    {
      title: "Upload",
      description: "Add new source files and keep the material library up to date.",
      href: `/workspaces/${workspaceId}/upload`,
      icon: UploadCloud,
    },
    {
      title: "History",
      description: "Review, rename, and delete backend chat sessions for this workspace.",
      href: `/workspaces/${workspaceId}/history`,
      icon: HistoryIcon,
    },
    {
      title: "Settings",
      description: "Edit workspace metadata and clear the local browser chat cache.",
      href: `/workspaces/${workspaceId}/settings`,
      icon: Settings2,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* HEADER */}
      <header className="space-y-4">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/workspaces" className="font-medium transition-colors hover:text-foreground">
            Workspaces
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="max-w-56 truncate font-medium text-foreground">
            {workspaceQuery.data?.name ?? "Workspace"}
          </span>
        </nav>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {workspaceQuery.data?.name ?? "Workspace"}
            </h1>
            {workspaceQuery.data?.description ? (
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {workspaceQuery.data.description}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-1.5">
              {workspaceQuery.data?.tags.length ? (
                workspaceQuery.data.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="rounded-full text-[11px] font-medium">
                    {tag}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="rounded-full text-[11px] font-medium text-muted-foreground">
                  No tags
                </Badge>
              )}
            </div>
          </div>

          <Button asChild size="lg" className="shrink-0 gap-2 rounded-xl shadow-sm">
            <Link to={`/workspaces/${workspaceId}/chat`}>
              Open chat
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* STATS STRIP */}
      <div className="grid grid-cols-2 divide-x divide-border overflow-hidden rounded-2xl border bg-card lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 p-4 sm:p-5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
              <stat.icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-lg leading-none font-semibold tabular-nums">{stat.value}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)]">
        {/* ACTIONS */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold tracking-tight">Get started</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {actions.map((action) => (
              <Link
                key={action.title}
                to={action.href}
                className="group rounded-2xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_32px_-20px] hover:shadow-primary/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/[0.08] text-primary ring-1 ring-primary/10">
                    <action.icon className="size-5" />
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <p className="mt-4 text-sm font-semibold tracking-tight">{action.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{action.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* RECENT LOCAL CONVERSATION */}
        <Card className="h-fit rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold tracking-tight">Recent local conversation</CardTitle>
            <CardDescription className="text-xs">
              Messages persisted in this browser for the current workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {chatSession.messages.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                No local conversation yet. Start in chat after you upload some materials.
              </div>
            ) : (
              chatSession.messages
                .slice(-4)
                .reverse()
                .map((message) => (
                  <div key={message.id} className="rounded-xl border bg-background/70 p-4">
                    <div className="mb-2 flex items-center justify-between text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                      <span>{message.role}</span>
                      <span>{formatTime(message.createdAt)}</span>
                    </div>
                    <p className="line-clamp-4 text-sm leading-6 break-words whitespace-pre-wrap">{message.content}</p>
                  </div>
                ))
            )}

            <Button asChild className="w-full rounded-xl shadow-sm">
              <Link to={`/workspaces/${workspaceId}/chat`}>Open workspace chat</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
