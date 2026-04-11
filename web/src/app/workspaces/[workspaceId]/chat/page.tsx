"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Bot, CornerDownLeft, Plus, SendHorizonalIcon, SendIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/hooks/useAuthSession";
import { workspaceApi } from "@/lib/api";
import { createWorkspaceMessage, readWorkspaceSession, writeWorkspaceSession } from "@/lib/workspace-session";
import type { WorkspaceSession, WorkspaceSessionSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { timeStyle: "short" }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function ChatPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = Array.isArray(params.workspaceId) ? params.workspaceId[0] : params.workspaceId;
  const { session } = useSession();
  const [prompt, setPrompt] = useState("");
  const [chatSession, setChatSession] = useState<WorkspaceSession>(() =>
    workspaceId
      ? readWorkspaceSession(workspaceId)
      : { sessionId: null, sessionName: null, createdAt: null, messages: [] },
  );

  const sessionsQuery = useQuery({
    queryKey: ["workspace-sessions", workspaceId],
    queryFn: () => workspaceApi.sessions(session!.accessToken, workspaceId!),
    enabled: Boolean(session?.accessToken && workspaceId),
  });

  const queryMutation = useMutation({
    mutationFn: async (query: string) => {
      if (!workspaceId || !session) {
        throw new Error("Workspace session is unavailable");
      }

      return workspaceApi.query(session.accessToken, workspaceId, {
        session_id: chatSession.sessionId,
        query,
      });
    },
    onSuccess: (data, query) => {
      if (!workspaceId) {
        return;
      }

      setChatSession((current) => {
        const nextSession = {
          sessionId: data.session_id,
          sessionName: data.session_name,
          createdAt: data.created_at,
          messages: [
            ...current.messages,
            createWorkspaceMessage("user", query),
            createWorkspaceMessage("assistant", data.answer),
          ],
        };

        writeWorkspaceSession(workspaceId, nextSession);
        return nextSession;
      });
      sessionsQuery.refetch();
      setPrompt("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      return;
    }

    queryMutation.mutate(trimmedPrompt);
  }

  function handleSelectSession(item: WorkspaceSessionSummary) {
    const stored = localStorage.getItem(`ragify-workspace-session:${workspaceId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.sessionId === item.id) {
        setChatSession(parsed);
        return;
      }
    }
    const newSession: WorkspaceSession = {
      sessionId: item.id,
      sessionName: item.name,
      createdAt: item.created_at,
      messages: [],
    };
    setChatSession(newSession);
    writeWorkspaceSession(workspaceId!, newSession);
  }

  function handleNewSession() {
    const newSession: WorkspaceSession = {
      sessionId: null,
      sessionName: null,
      createdAt: null,
      messages: [],
    };
    setChatSession(newSession);
    writeWorkspaceSession(workspaceId!, newSession);
  }

  return (
    <div className="flex h-full">
      <div className="flex w-80 shrink-0 flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Sessions</h2>
          <Button variant="ghost" size="icon" onClick={handleNewSession} className="cursor-pointer size-8">
            <Plus className="size-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {sessionsQuery.data?.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectSession(item)}
                className={`w-full rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted/50 ${
                  chatSession.sessionId === item.id
                    ? "border-primary bg-primary/10"
                    : "border-border/60 bg-background/80"
                }`}
              >
                <p className="truncate font-medium">{item.name}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {`Created on ${formatDate(item.created_at)}`}
                </p>
              </button>
            ))}
            {sessionsQuery.data?.length === 0 && <p className="text-sm text-muted-foreground">No previous sessions</p>}
          </div>
        </div>
      </div>

      <Separator orientation="vertical" />

      <div className="h-[calc(100vh-4rem)] flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            {chatSession.messages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
                No messages yet. Ask a question to start the conversation.
              </div>
            ) : null}

            {chatSession.messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-4/5 flex flex-col",
                  message.role === "assistant"
                    ? "justify-self-start rounded-3xl border border-border/60 bg-muted/30 p-4"
                    : "ml-auto justify-self-end rounded-3xl bg-primary p-4 text-primary-foreground",
                )}
              >
                <p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p>
                {/*<span className="text-xs text-muted-foreground self-end">{formatTime(message.createdAt)}</span>*/}
              </div>
            ))}
          </div>
        </div>

        <form className="px-6 py-4 border-t flex gap-4 items-end" onSubmit={handleSubmit}>
          <Textarea
            className="min-h-16"
            placeholder="Ask me anything"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
          />
          <Button type="submit" size="lg" disabled={queryMutation.isPending}>
            <SendHorizonalIcon />
          </Button>
        </form>
      </div>
    </div>
  );
}
