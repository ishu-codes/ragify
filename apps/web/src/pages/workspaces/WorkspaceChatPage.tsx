import { useEffect, useRef, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Brain,
  Check,
  ChevronRight,
  Copy,
  Lightbulb,
  LoaderCircle,
  MessageSquare,
  Plus,
  Search,
  SendHorizonalIcon,
  Trash2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/useAuthSession";
import { workspaceApi } from "@/lib/api";
import { createWorkspaceMessage, writeWorkspaceSession } from "@/lib/workspace-session";
import type { WorkspaceSession, WorkspaceSessionSummary, WorkspaceMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

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

// Prompt starters for empty chat state
const PROMPT_STARTERS = [
  "Summarize all uploaded materials in this workspace",
  "What are the main technical dependencies and architecture?",
  "Extract key action items and deployment steps",
  "Find security and authentication requirements",
];

export default function WorkspaceChatPage() {
  const { workspaceId = "" } = useParams<{ workspaceId: string }>();
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [sessionSearch, setSessionSearch] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

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
    queryFn: () => workspaceApi.sessions(session!.accessToken, workspaceId),
    enabled: Boolean(session?.accessToken && workspaceId),
    staleTime: 1000 * 60 * 10,
  });

  const messagesQuery = useQuery({
    queryKey: ["session-messages", workspaceId, activeSession.sessionId],
    queryFn: async (): Promise<WorkspaceMessage[]> => {
      if (!activeSession.sessionId) return [];
      const response = await workspaceApi.sessionMessages(session!.accessToken, workspaceId, activeSession.sessionId);
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

  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return workspaceApi.deleteSession(session!.accessToken, workspaceId, sessionId);
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ["workspace-sessions", workspaceId] });
      if (activeSession.sessionId === sessionId) {
        setActiveSession({
          sessionId: null,
          sessionName: null,
          createdAt: null,
        });
        setLocalMessages([]);
      }
      toast.success("Chat session deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete session");
    },
  });

  function handleDeleteSession(sessionId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!sessionId) return;
    if (confirm("Are you sure you want to delete this chat session?")) {
      deleteSessionMutation.mutate(sessionId);
    }
  }

  const [localMessages, setLocalMessages] = useState<WorkspaceMessage[]>([]);

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
    if (!trimmedPrompt) return;
    queryMutation.mutate(trimmedPrompt);
  }

  function handlePromptStarter(starter: string) {
    setPrompt(starter);
    queryMutation.mutate(starter);
  }

  function handleCopyMessage(content: string, id: string) {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(id);
    toast.success("Message copied to clipboard");
    setTimeout(() => setCopiedMessageId(null), 2000);
  }

  function handleSelectSession(item: WorkspaceSessionSummary) {
    setActiveSession({
      sessionId: item.id,
      sessionName: item.name,
      createdAt: item.created_at,
    });
    setLocalMessages([]);
    writeWorkspaceSession(workspaceId, {
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
    writeWorkspaceSession(workspaceId, {
      sessionId: null,
      sessionName: null,
      createdAt: null,
      messages: [],
    });
  }

  const filteredSessions = useMemo(() => {
    if (!sessionsQuery.data) return [];
    if (!sessionSearch.trim()) return sessionsQuery.data;
    return sessionsQuery.data.filter((s) => s.name.toLowerCase().includes(sessionSearch.toLowerCase()));
  }, [sessionsQuery.data, sessionSearch]);

  const isLoadingMessages = messagesQuery.isLoading || messagesQuery.isFetching;

  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [displayMessages, queryMutation.isPending]);

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full overflow-hidden">
      {/* SESSIONS SIDEBAR */}
      <aside className="flex w-72 shrink-0 flex-col gap-4 border-r bg-muted/25 p-4 lg:w-80">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-primary" />
            <h2 className="text-sm font-semibold tracking-tight">Sessions</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewSession}
            className="size-8 cursor-pointer rounded-xl hover:bg-primary/10 hover:text-primary"
            title="Start new session"
          >
            <Plus className="size-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={sessionSearch}
            onChange={(e) => setSessionSearch(e.target.value)}
            className="h-9 rounded-xl border-border bg-card pl-8.5 text-sm"
          />
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto pr-1">
          {filteredSessions.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group flex w-full items-center rounded-xl border transition-all",
                activeSession.sessionId === item.id
                  ? "border-primary/40 bg-primary/[0.07]"
                  : "border-transparent bg-card hover:bg-muted/60",
              )}
            >
              <button onClick={() => handleSelectSession(item)} className="min-w-0 flex-1 cursor-pointer p-3 text-left">
                <p className={cn("truncate text-xs", activeSession.sessionId === item.id ? "font-semibold" : "font-medium")}>
                  {item.name}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{formatDate(item.created_at)}</p>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="mr-1.5 size-7 shrink-0 cursor-pointer rounded-lg text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                onClick={(e) => handleDeleteSession(item.id, e)}
                disabled={deleteSessionMutation.isPending}
                title="Delete session"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}

          {sessionsQuery.isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          )}

          {filteredSessions.length === 0 && !sessionsQuery.isLoading && (
            <p className="py-8 text-center text-xs text-muted-foreground">No sessions found.</p>
          )}
        </div>
      </aside>

      {/* CHAT MAIN AREA */}
      <div className="flex h-full min-w-0 flex-1 flex-col">
        {/* MESSAGES SCROLL AREA */}
        <div ref={containerRef} className="flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-6">
          {isLoadingMessages && (
            <div className="mx-auto max-w-3xl space-y-4">
              <Skeleton className="h-20 w-3/4 rounded-2xl" />
              <Skeleton className="ml-auto h-14 w-2/3 rounded-2xl" />
              <Skeleton className="h-28 w-3/4 rounded-2xl" />
            </div>
          )}

          {/* EMPTY CHAT STATE WITH PROMPT STARTERS */}
          {!isLoadingMessages && displayMessages.length === 0 && (
            <div className="mx-auto max-w-2xl animate-in fade-in duration-300 py-12">
              <div className="space-y-3 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary ring-1 ring-primary/10">
                  <Brain className="size-6" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">Chat with your workspace</h3>
                <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
                  Ask anything about the documents indexed in this workspace. Ragify extracts relevant context chunks
                  with precise citations.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Lightbulb className="size-3.5 text-primary" />
                  Suggested questions
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {PROMPT_STARTERS.map((starter, i) => (
                    <button
                      key={i}
                      onClick={() => handlePromptStarter(starter)}
                      className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl border bg-card p-4 text-left text-xs font-medium transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/[0.04] hover:shadow-[0_10px_28px_-20px] hover:shadow-primary/20"
                    >
                      <span className="leading-relaxed">{starter}</span>
                      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CHAT MESSAGES DISPLAY */}
          {!isLoadingMessages &&
            displayMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex max-w-3xl animate-in fade-in gap-3 duration-200",
                  message.role === "assistant" ? "mx-auto" : "ml-auto flex-row-reverse",
                )}
              >
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-xl",
                    message.role === "assistant"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground ring-1 ring-border",
                  )}
                >
                  {message.role === "assistant" ? (
                    <Brain className="size-4" />
                  ) : (
                    <span className="text-xs font-semibold">You</span>
                  )}
                </div>

                <div className="min-w-0 max-w-[85%] space-y-1.5">
                  <div className="flex items-center justify-between gap-2 px-1">
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {message.role === "assistant" ? "Ragify" : "You"}
                    </span>
                    {message.role === "assistant" && (
                      <button
                        onClick={() => handleCopyMessage(message.content, message.id)}
                        className="flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Copy response"
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="size-3 text-emerald-500" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                        <span>{copiedMessageId === message.id ? "Copied" : "Copy"}</span>
                      </button>
                    )}
                  </div>

                  <div
                    className={cn(
                      "rounded-2xl p-4 text-sm leading-relaxed shadow-sm",
                      message.role === "assistant"
                        ? "border bg-card"
                        : "bg-primary font-medium text-primary-foreground",
                    )}
                  >
                    {parseContent(cleanMarkdownContent(message.content)).map((part, idx) =>
                      part.type === "thinking" ? (
                        <div
                          key={idx}
                          className="mb-3 rounded-xl border border-border/60 bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground italic"
                        >
                          <ReactMarkdown>{part.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <div key={idx} className="markdown-body break-words">
                          <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {part.content}
                          </ReactMarkdown>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ))}

          {/* STREAMING LOADING INDICATOR */}
          {queryMutation.isPending && (
            <div className="mx-auto flex max-w-3xl animate-pulse gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Brain className="size-4" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl border bg-card p-4 text-xs font-medium text-muted-foreground">
                <LoaderCircle className="size-3.5 animate-spin text-primary" />
                Retrieving context and generating answer...
              </div>
            </div>
          )}
        </div>

        {/* INPUT PROMPT BAR */}
        <form
          className="mx-auto w-full max-w-3xl p-4"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center gap-2 rounded-2xl border bg-card p-2 shadow-sm transition-all focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/20">
            <Input
              type="text"
              className="h-11 border-0 bg-transparent px-3 text-sm shadow-none focus-visible:ring-0"
              placeholder={
                activeSession.sessionId
                  ? "Ask a follow-up question..."
                  : "Ask a question against your workspace documents..."
              }
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              disabled={queryMutation.isPending}
            />
            <Button
              type="submit"
              size="icon"
              className="size-10 shrink-0 cursor-pointer rounded-xl shadow-sm"
              disabled={queryMutation.isPending || !prompt.trim()}
              title="Send message"
            >
              <SendHorizonalIcon className="size-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
