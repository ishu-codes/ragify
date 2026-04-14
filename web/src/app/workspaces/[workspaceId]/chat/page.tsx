"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, SendHorizonalIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/hooks/useAuthSession";
import { workspaceApi } from "@/lib/api";
import { createWorkspaceMessage, writeWorkspaceSession } from "@/lib/workspace-session";
import type { WorkspaceSession, WorkspaceSessionSummary, WorkspaceMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function cleanMarkdownContent(content: string): string {
  return content
    .replace(/<\|im_start\|>\s*\n?/gi, "")
    .replace(/<\|endoftext\|>/gi, "")
    .replace(/<\|im_end\|>/gi, "")
    .trim();
}

interface ParsedContent {
  type: "text" | "thinking";
  content: string;
}

function parseContent(content: string): ParsedContent[] {
  const thinkStart = "<think>";
  const thinkEnd = "</think>";
  const parts: ParsedContent[] = [];
  let lastIndex = 0;
  let startIdx = content.indexOf(thinkStart, lastIndex);

  while (startIdx !== -1) {
    const endIdx = content.indexOf(thinkEnd, startIdx + thinkStart.length);
    if (endIdx === -1) break;
    
    if (startIdx > lastIndex) {
      parts.push({ type: "text", content: content.slice(lastIndex, startIdx) });
    }
    parts.push({ type: "thinking", content: content.slice(startIdx + thinkStart.length, endIdx).trim() });
    lastIndex = endIdx + thinkEnd.length;
    startIdx = content.indexOf(thinkStart, lastIndex);
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", content: content.slice(lastIndex) });
  }

  return parts;
}

export default function ChatPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = Array.isArray(params.workspaceId) ? params.workspaceId[0] : params.workspaceId;
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [activeSession, setActiveSession] = useState<{
    sessionId: string | null;
    sessionName: string | null;
    createdAt: string | null;
  }>({
    sessionId: null,
    sessionName: null,
    createdAt: null,
  });

  const sessionsQuery = useQuery({
    queryKey: ["workspace-sessions", workspaceId],
    queryFn: () => workspaceApi.sessions(session!.accessToken, workspaceId!),
    enabled: Boolean(session?.accessToken && workspaceId),
    staleTime: 1000 * 60 * 10,
  });

  const messagesQuery = useQuery({
    queryKey: ["session-messages", workspaceId, activeSession.sessionId],
    queryFn: async (): Promise<WorkspaceMessage[]> => {
      if (!activeSession.sessionId) return [];
      const response = await workspaceApi.sessionMessages(session!.accessToken, workspaceId!, activeSession.sessionId);

      const messages = response?.messages || [];

      return messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt || new Date().toISOString(),
      }));
    },
    staleTime: 1000 * 60 * 10,
    enabled: Boolean(session?.accessToken && workspaceId && activeSession.sessionId),
  });

  const [localMessages, setLocalMessages] = useState<WorkspaceMessage[]>([]);

  // Combine server messages with local messages
  const displayMessages = Array.isArray(messagesQuery.data)
    ? [...messagesQuery.data, ...localMessages.filter((m) => m.id.startsWith("local-"))]
    : localMessages;

  const queryMutation = useMutation({
    mutationFn: async (query: string) => {
      if (!workspaceId || !session) {
        throw new Error("Workspace session is unavailable");
      }

      return workspaceApi.query(session.accessToken, workspaceId, {
        session_id: activeSession.sessionId,
        query,
      });
    },
    onSuccess: (data, query) => {
      if (!workspaceId) {
        return;
      }

      const userMsg = createWorkspaceMessage("user", query);
      const assistantMsg = createWorkspaceMessage("assistant", data.answer);
      // Mark as local messages so they appear immediately
      userMsg.id = `local-${userMsg.id}`;
      assistantMsg.id = `local-${assistantMsg.id}`;

      setLocalMessages((prev) => [...prev, userMsg, assistantMsg]);

      const nextSession: WorkspaceSession = {
        sessionId: data.session_id,
        sessionName: data.session_name,
        createdAt: data.created_at,
        messages: [],
      };

      setActiveSession({
        sessionId: data.session_id,
        sessionName: data.session_name,
        createdAt: data.created_at,
      });

      writeWorkspaceSession(workspaceId, nextSession);
      queryClient.invalidateQueries({ queryKey: ["workspace-sessions", workspaceId] });
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
    setActiveSession({
      sessionId: item.id,
      sessionName: item.name,
      createdAt: item.created_at,
    });
    setLocalMessages([]);
    writeWorkspaceSession(workspaceId!, {
      sessionId: item.id,
      sessionName: item.name,
      createdAt: item.created_at,
      messages: [],
    });
  }

  function handleNewSession() {
    setActiveSession({
      sessionId: null,
      sessionName: null,
      createdAt: null,
    });
    setLocalMessages([]);
    writeWorkspaceSession(workspaceId!, {
      sessionId: null,
      sessionName: null,
      createdAt: null,
      messages: [],
    });
  }

  const isLoadingMessages = messagesQuery.isLoading || messagesQuery.isFetching;

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
                className={cn(
                  "w-full rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted/50",
                  activeSession.sessionId === item.id
                    ? "border-primary bg-primary/10"
                    : "border-border/60 bg-background/80",
                )}
              >
                <p className="truncate font-medium">{item.name}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
              </button>
            ))}
            {sessionsQuery.isLoading && (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            )}
            {sessionsQuery.data?.length === 0 && !sessionsQuery.isLoading && (
              <p className="text-sm text-muted-foreground">No previous sessions</p>
            )}
          </div>
        </div>
      </div>

      <Separator orientation="vertical" />

      <div className="h-[calc(100vh-4rem)] flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            {isLoadingMessages && (
              <div className="space-y-4">
                <Skeleton className="h-24 w-4/5" />
                <Skeleton className="h-16 w-3/5 ml-auto" />
                <Skeleton className="h-20 w-4/5" />
              </div>
            )}

            {!isLoadingMessages && displayMessages.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
                {activeSession.sessionId
                  ? "No messages yet in this session. Ask a question to start the conversation."
                  : "Start a new conversation by typing a message below."}
              </div>
            )}

            {!isLoadingMessages &&
              displayMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-4/5 flex flex-col",
                    message.role === "assistant"
                      ? "justify-self-start rounded-3xl border border-border/60 bg-muted/30 p-4"
                      : "ml-auto justify-self-end rounded-3xl bg-primary p-4 text-primary-foreground",
                  )}
                >
                  <div className={cn("text-sm leading-7", message.role === "assistant" && "text-muted-foreground")}>
                    {parseContent(cleanMarkdownContent(message.content)).map((part, idx) =>
                      part.type === "thinking" ? (
                        <div key={idx} className="text-muted-foreground/70 italic text-xs mb-2 p-2 border-l-2 border-border/50">
                          <ReactMarkdown>{part.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <ReactMarkdown
                          key={idx}
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {part.content}
                        </ReactMarkdown>
                      )
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <form className="px-6 py-4 border-t flex gap-4 items-end" onSubmit={handleSubmit}>
          <Textarea
            className="min-h-16"
            placeholder={activeSession.sessionId ? "Continue the conversation..." : "Ask me anything"}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            disabled={queryMutation.isPending}
          />
          <Button type="submit" size="lg" disabled={queryMutation.isPending || !prompt.trim()}>
            <SendHorizonalIcon />
          </Button>
        </form>
      </div>
    </div>
  );
}
