import { useEffect, useRef, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronRight,
  Copy,
  Lightbulb,
  LoaderCircle,
  Plus,
  Search,
  SendHorizonalIcon,
  Square,
  Trash2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/useAuthSession";
import { workspaceApi } from "@/lib/api";
import { createWorkspaceMessage, writeWorkspaceSession } from "@/lib/workspace-session";
import type { WorkspaceSession, WorkspaceSessionSummary, WorkspaceMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { DashedPanel } from "@/components/marketing/DashedPanel";

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
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  // The backend persists both the prompt and the answer to the session, so once
  // server messages arrive they are authoritative. Local messages are only an
  // optimistic overlay: keep the ones the server has not returned yet.
  const displayMessages = useMemo(() => {
    const serverMessages = Array.isArray(messagesQuery.data) ? messagesQuery.data : [];
    const serverMessageKeys = new Set(serverMessages.map((message) => `${message.role}:${message.content}`));
    return [
      ...serverMessages,
      ...localMessages.filter(
        (message) =>
          message.id.startsWith("local-") && !serverMessageKeys.has(`${message.role}:${message.content}`),
      ),
    ];
  }, [messagesQuery.data, localMessages]);

  const queryMutation = useMutation({
    mutationFn: async (query: string) => {
      if (!workspaceId || !session) {
        throw new Error("Workspace session is unavailable");
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      return workspaceApi.query(
        session.accessToken,
        workspaceId,
        {
          session_id: activeSession.sessionId,
          query,
        },
        { signal: controller.signal },
      );
    },
    onSuccess: (data) => {
      if (!workspaceId) {
        return;
      }

      // The user prompt is already shown optimistically; only the answer is new.
      const assistantMsg = createWorkspaceMessage("assistant", data.answer);
      assistantMsg.id = `local-${assistantMsg.id}`;

      setLocalMessages((prev) => [...prev, assistantMsg]);

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
    onError: (error, query) => {
      if ((error as { name?: string } | null)?.name === "AbortError") {
        return;
      }
      // The prompt was shown optimistically; remove it so the user can retry.
      setLocalMessages((prev) =>
        prev.filter(
          (message) =>
            !(message.id.startsWith("local-") && message.role === "user" && message.content === query),
        ),
      );
      toast.error(error.message);
    },
  });

  function appendOptimisticUserMessage(content: string) {
    const userMsg = createWorkspaceMessage("user", content);
    userMsg.id = `local-${userMsg.id}`;
    setLocalMessages((prev) => [...prev, userMsg]);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;
    appendOptimisticUserMessage(trimmedPrompt);
    setPrompt("");
    queryMutation.mutate(trimmedPrompt);
  }

  function handlePromptStarter(starter: string) {
    appendOptimisticUserMessage(starter);
    setPrompt("");
    queryMutation.mutate(starter);
  }

  function handleStop() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    queryMutation.reset();
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

  const isLoadingMessages = (messagesQuery.isLoading || messagesQuery.isFetching) && displayMessages.length === 0;

  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [displayMessages, queryMutation.isPending]);

  return (
    <div className="flex h-[calc(100dvh-57px)] w-full overflow-hidden">
      {/* SESSIONS SIDEBAR */}
      <aside className="flex w-72 shrink-0 flex-col gap-4 border-r border-border bg-muted/25 p-4 lg:w-80">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {"//sessions"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewSession}
            className="size-8 cursor-pointer hover:bg-brand/10 hover:text-brand-text"
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
            className="h-9 rounded-md border-border bg-card pl-8.5 text-sm"
          />
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto pr-1">
          {filteredSessions.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group flex w-full items-center border transition-all",
                activeSession.sessionId === item.id
                  ? "border-brand/40 bg-brand/[0.07]"
                  : "border-transparent bg-card hover:bg-muted/60",
              )}
            >
              <button onClick={() => handleSelectSession(item)} className="min-w-0 flex-1 cursor-pointer p-3 text-left">
                <p className={cn("truncate font-mono text-xs", activeSession.sessionId === item.id ? "font-semibold" : "font-medium")}>
                  {item.name}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{formatDate(item.created_at)}</p>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="mr-1.5 size-7 shrink-0 cursor-pointer text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
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
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
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
            <div className="mr-auto max-w-3xl space-y-4">
              <Skeleton className="h-20 w-3/4" />
              <Skeleton className="ml-auto h-14 w-2/3" />
              <Skeleton className="h-28 w-3/4" />
            </div>
          )}

          {/* EMPTY CHAT STATE WITH PROMPT STARTERS */}
          {!isLoadingMessages && displayMessages.length === 0 && (
            <div className="mx-auto max-w-2xl animate-in fade-in duration-300 py-12">
              <div className="space-y-3 text-center">
                <div className="mx-auto flex size-12 items-center justify-center bg-brand/10 font-mono text-sm font-semibold text-brand-text ring-1 ring-brand/20">
                  {"//ragify"}
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
                    <DashedPanel key={i} className="bg-card">
                      <button
                        onClick={() => handlePromptStarter(starter)}
                        className="group flex w-full cursor-pointer items-center justify-between gap-3 p-4 text-left text-xs font-medium transition-all hover:bg-muted/30"
                      >
                        <span className="leading-relaxed">{starter}</span>
                        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-brand-text" />
                      </button>
                    </DashedPanel>
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
                  message.role === "assistant" ? "mr-auto" : "ml-auto flex-row-reverse",
                )}
              >
                {message.role === "assistant" ? (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand font-mono text-[10px] font-semibold text-brand-foreground">
                    {"//"}
                  </div>
                ) : (
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={session?.user.image ?? ""} alt={session?.user.name ?? "You"} />
                    <AvatarFallback className="bg-brand/10 text-xs font-semibold text-brand-text">
                      {session?.user.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className="min-w-0 max-w-[85%] space-y-1.5">
                  <div
                    className={cn(
                      "border p-4 text-sm leading-relaxed",
                      message.role === "assistant"
                        ? "border-border bg-card"
                        : "border-brand/40 bg-brand font-medium text-brand-foreground",
                    )}
                  >
                    {parseContent(cleanMarkdownContent(message.content)).map((part, idx) =>
                      part.type === "thinking" ? (
                        <div key={idx} className="mb-3 border border-border/60 bg-muted/50 p-3">
                          <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            {"[Thinking]"}
                          </p>
                          <div className="text-xs leading-relaxed text-muted-foreground italic">
                            <ReactMarkdown>{part.content}</ReactMarkdown>
                          </div>
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

                  <button
                    onClick={() => handleCopyMessage(message.content, message.id)}
                    className={cn(
                      "flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                      message.role === "assistant" ? "" : "ml-auto",
                    )}
                    title="Copy message"
                  >
                    {copiedMessageId === message.id ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    <span>{copiedMessageId === message.id ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            ))}

          {/* STREAMING LOADING INDICATOR */}
          {queryMutation.isPending && (
            <div className="mr-auto flex max-w-3xl animate-pulse gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand font-mono text-[10px] font-semibold text-brand-foreground">
                {"//"}
              </div>
              <div className="flex items-center gap-2 border border-border bg-card p-4 text-xs font-medium text-muted-foreground">
                <LoaderCircle className="size-3.5 animate-spin text-brand-text" />
                <span className="font-mono">{"//[Thinking]"}</span>
                <span>Retrieving context and generating answer...</span>
              </div>
            </div>
          )}
        </div>

        {/* INPUT PROMPT BAR */}
        <form className="w-full border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:px-6" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 border border-border bg-card p-2 transition-all focus-within:border-brand focus-within:ring-[3px] focus-within:ring-brand/20">
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
            {queryMutation.isPending ? (
              <Button
                type="button"
                size="icon"
                variant="pill"
                className="size-10 shrink-0 cursor-pointer rounded-full"
                onClick={handleStop}
                title="Stop generating"
              >
                <Square className="size-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                variant="pill"
                className="size-10 shrink-0 cursor-pointer rounded-full"
                disabled={!prompt.trim()}
                title="Send message"
              >
                <SendHorizonalIcon className="size-4" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
