"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HistoryIcon, MoreHorizontal, PencilLine, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSession } from "@/hooks/useAuthSession";
import { workspaceApi } from "@/lib/api";
import { clearWorkspaceSession } from "@/lib/workspace-session";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function HistoryPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = Array.isArray(params.workspaceId) ? params.workspaceId[0] : params.workspaceId;
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState("");

  const sessionsQuery = useQuery({
    queryKey: ["workspace-sessions", workspaceId],
    queryFn: () => workspaceApi.sessions(session!.accessToken, workspaceId!),
    enabled: Boolean(session?.accessToken && workspaceId),
  });

  const renameMutation = useMutation({
    mutationFn: (sessionId: string) =>
      workspaceApi.renameSession(session!.accessToken, workspaceId!, sessionId, { name: sessionName.trim() }),
    onSuccess: (updatedSession) => {
      queryClient.setQueryData(["workspace-sessions", workspaceId], (current: typeof sessionsQuery.data) =>
        current?.map((item) => (item.id === updatedSession.id ? updatedSession : item)),
      );
      toast.success("Session renamed");
      setEditingSessionId(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (sessionId: string) => workspaceApi.deleteSession(session!.accessToken, workspaceId!, sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.setQueryData(["workspace-sessions", workspaceId], (current: typeof sessionsQuery.data) =>
        current?.filter((item) => item.id !== sessionId),
      );
      clearWorkspaceSession(workspaceId!);
      toast.success("Session deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => workspaceApi.deleteAllSessions(session!.accessToken, workspaceId!),
    onSuccess: () => {
      queryClient.setQueryData(["workspace-sessions", workspaceId], []);
      clearWorkspaceSession(workspaceId!);
      toast.success("All sessions deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <HistoryIcon className="size-5 text-primary" />
              Chat sessions
            </CardTitle>
            <CardDescription>Previous chat sessions created in this workspace.</CardDescription>
          </div>
          <Button
            variant="destructive"
            className="cursor-pointer"
            onClick={() => deleteAllMutation.mutate()}
            disabled={deleteAllMutation.isPending || !sessionsQuery.data?.length}
          >
            <Trash2 />
            Delete all sessions
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessionsQuery.data?.length ? (
            sessionsQuery.data.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border/60 bg-background/80 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Created {formatDate(item.created_at)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.message_count} message{item.message_count === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Popover
                    open={editingSessionId === item.id}
                    onOpenChange={(open) => {
                      setEditingSessionId(open ? item.id : null);
                      setSessionName(item.name);
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="cursor-pointer rounded-full">
                        <MoreHorizontal />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 space-y-4" align="end">
                      <Input value={sessionName} onChange={(event) => setSessionName(event.target.value)} />
                      <div className="flex items-center justify-between gap-2">
                        <Button
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => renameMutation.mutate(item.id)}
                          disabled={renameMutation.isPending || !sessionName.trim()}
                        >
                          <PencilLine />
                          Rename
                        </Button>
                        <Button
                          variant="destructive"
                          className="cursor-pointer"
                          onClick={() => deleteMutation.mutate(item.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 />
                          Delete
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
              No sessions yet for this workspace.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
