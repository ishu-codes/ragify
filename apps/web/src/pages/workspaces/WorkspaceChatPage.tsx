import { useEffect, useRef, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  SendHorizonalIcon,
  Trash2,
  Brain,
  Sparkles,
  Copy,
  Check,
  Search,
  MessageSquare,
  ChevronRight,
  Lightbulb,
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
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {/* SESSIONS SIDEBAR */}
      <div className="flex w-80 shrink-0 flex-col bg-muted/20 border-r p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h2 className="font-bold text-sm">Chat Sessions</h2>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNewSession}
            className="cursor-pointer h-8 w-8 rounded-xl"
            title="Start New Session"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Input for sessions */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={sessionSearch}
            onChange={(e) => setSessionSearch(e.target.value)}
            className="pl-8 h-8 rounded-xl text-xs bg-background"
          />
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {filteredSessions.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group w-full rounded-xl border p-2.5 text-left text-xs transition-all flex items-center justify-between cursor-pointer",
                activeSession.sessionId === item.id
                  ? "border-primary bg-primary/10 font-semibold shadow-sm"
                  : "border-border/60 bg-background/80 hover:bg-muted/60",
              )}
            >
              <button
                onClick={() => handleSelectSession(item)}
                className="flex-1 min-w-0 text-left cursor-pointer"
              >
                <p className="truncate text-xs font-semibold">{item.name}</p>
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{formatDate(item.created_at)}</p>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={(e) => handleDeleteSession(item.id, e)}
                disabled={deleteSessionMutation.isPending}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {sessionsQuery.isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          )}

          {filteredSessions.length === 0 && !sessionsQuery.isLoading && (
            <p className="text-xs text-muted-foreground text-center py-6 font-medium">No chat sessions found.</p>
          )}
        </div>
      </div>

      {/* CHAT MAIN AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Messages Scroll Area */}
        <div ref={containerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {isLoadingMessages && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <Skeleton className="h-20 w-3/4 rounded-2xl" />
              <Skeleton className="h-16 w-2/3 ml-auto rounded-2xl" />
              <Skeleton className="h-24 w-3/4 rounded-2xl" />
            </div>
          )}

          {/* EMPTY CHAT STATE WITH PROMPT STARTERS */}
          {!isLoadingMessages && displayMessages.length === 0 && (
            <div className="max-w-2xl mx-auto py-12 space-y-8 animate-in fade-in duration-300">
              <div className="text-center space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
                  <Brain className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Ragify Neural Workspace Chat</h3>
                <p className="text-xs text-muted-foreground font-medium max-w-md mx-auto">
                  Ask any question regarding the documents indexed in this workspace. Ragify extracts relevant context chunks with precise citations.
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-primary" /> Suggested Questions:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PROMPT_STARTERS.map((starter, i) => (
                    <button
                      key={i}
                      onClick={() => handlePromptStarter(starter)}
                      className="p-3.5 rounded-2xl border bg-card hover:bg-primary/5 hover:border-primary/40 text-left text-xs font-semibold text-foreground transition-all flex items-center justify-between group cursor-pointer shadow-sm"
                    >
                      <span>{starter}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
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
                  "max-w-3xl flex gap-3 animate-in fade-in duration-200",
                  message.role === "assistant" ? "mr-auto" : "ml-auto flex-row-reverse",
                )}
              >
                {/* Avatar Icon */}
                <div
                  className={cn(
                    "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-sm",
                    message.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border",
                  )}
                >
                  {message.role === "assistant" ? <Brain className="h-4 w-4" /> : "U"}
                </div>

                {/* Message Bubble Container */}
                <div className="space-y-1.5 min-w-0 max-w-[85%]">
                  <div className="flex items-center justify-between gap-2 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {message.role === "assistant" ? "Ragify Assistant" : "You"}
                    </span>
                    {message.role === "assistant" && (
                      <button
                        onClick={() => handleCopyMessage(message.content, message.id)}
                        className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                        title="Copy Response"
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>{copiedMessageId === message.id ? "Copied" : "Copy"}</span>
                      </button>
                    )}
                  </div>

                  <div
                    className={cn(
                      "rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm",
                      message.role === "assistant"
                        ? "border bg-card text-foreground"
                        : "bg-primary text-primary-foreground font-medium",
                    )}
                  >
                    {parseContent(cleanMarkdownContent(message.content)).map((part, idx) =>
                      part.type === "thinking" ? (
                        <div
                          key={idx}
                          className="text-muted-foreground/80 italic text-xs mb-3 p-3 rounded-xl bg-muted/40 border-l-2 border-primary"
                        >
                          <ReactMarkdown>{part.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <div key={idx} className="prose dark:prose-invert text-xs sm:text-sm max-w-none break-words">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
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
            <div className="max-w-3xl mr-auto flex gap-3 animate-pulse">
              <div className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-xs">
                <Brain className="h-4 w-4 animate-spin" />
              </div>
              <div className="rounded-2xl border bg-card p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5 animate-spin" /> Retrieving context &amp; generating answer...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* INPUT PROMPT BAR */}
        <form className="p-4 border-t bg-background/95 backdrop-blur flex gap-3 items-center max-w-4xl mx-auto w-full" onSubmit={handleSubmit}>
          <Input
            type="text"
            className="h-12 rounded-2xl text-xs sm:text-sm px-4 bg-muted/20 focus:bg-background border-border/80"
            placeholder={activeSession.sessionId ? "Ask a follow-up question..." : "Type your question against workspace documents..."}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            disabled={queryMutation.isPending}
          />
          <Button
            type="submit"
            size="icon"
            className="h-12 w-12 rounded-2xl shrink-0 cursor-pointer shadow-md"
            disabled={queryMutation.isPending || !prompt.trim()}
          >
            <SendHorizonalIcon className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
