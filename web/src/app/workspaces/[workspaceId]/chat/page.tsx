"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Bot, CornerDownLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/hooks/useAuthSession";
import { workspaceApi } from "@/lib/api";
import { createWorkspaceMessage, readWorkspaceSession, writeWorkspaceSession } from "@/lib/workspace-session";
import type { WorkspaceSession } from "@/lib/types";

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { timeStyle: "short" }).format(new Date(value));
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

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Bot className="size-5 text-primary" />
            Chat
          </CardTitle>
          <CardDescription>Ask focused questions against the materials indexed for this workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Textarea
              className="min-h-36"
              placeholder="Ask a question about the documents loaded into this workspace"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
            <div className="flex justify-end">
              <Button type="submit" size="lg" className="cursor-pointer" disabled={queryMutation.isPending}>
                <CornerDownLeft />
                {queryMutation.isPending ? "Thinking..." : "Send question"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/*<Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Sparkles className="size-5 text-primary" />
            Conversation
          </CardTitle>
          <CardDescription>Messages are persisted in this browser for the current workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {chatSession.messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
              No messages yet. Upload materials, then start asking questions.
            </div>
          ) : null}

          {chatSession.messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "assistant"
                  ? "mr-6 rounded-3xl border border-border/60 bg-muted/30 p-4"
                  : "ml-6 rounded-3xl bg-primary p-4 text-primary-foreground"
              }
            >
              <div className="mb-2 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] opacity-80">
                <span>{message.role}</span>
                <span>{formatTime(message.createdAt)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>*/}
    </div>
  );
}
