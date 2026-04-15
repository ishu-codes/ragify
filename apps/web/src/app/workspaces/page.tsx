"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Heart,
  ChevronRight,
  Ticket,
  FolderPlusIcon,
  Trash2Icon,
  PencilLineIcon,
  MoreVerticalIcon,
  TrashIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/useAuthSession";
import { workspaceApi } from "@/lib/api";
import { Navbar } from "@/components/workspaces";
import Logo from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Workspace } from "@/lib/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function DashboardPage() {
  const { session, isPending: isSessionPending } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [workspaceTags, setWorkspaceTags] = useState("");

  const workspacesQuery = useQuery({
    queryKey: ["workspaces", session?.user.id],
    queryFn: () => workspaceApi.list(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });

  const createMutation = useMutation({
    mutationFn: () => workspaceApi.create(session!.accessToken),
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces", session?.user.id] });
      toast.success("Workspace created");
      router.push(`/workspaces/${workspace.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (workspaceId: string) =>
      workspaceApi.update(session!.accessToken, workspaceId, {
        name: workspaceName,
        description: workspaceDescription,
        tags: workspaceTags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }),
    onSuccess: (workspace) => {
      queryClient.setQueryData(["workspaces", session?.user.id], (current: typeof workspacesQuery.data) =>
        current?.map((item) => (item.id === workspace.id ? workspace : item)),
      );
      toast.success("Workspace updated");
      setEditingWorkspaceId(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (workspaceId: string) => workspaceApi.delete(session!.accessToken, workspaceId),
    onSuccess: (_, workspaceId) => {
      queryClient.setQueryData(["workspaces", session?.user.id], (current: typeof workspacesQuery.data) =>
        current?.filter((item) => item.id !== workspaceId),
      );
      toast.success("Workspace deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function openWorkspaceEditor(workspace: Workspace) {
    setEditingWorkspaceId(workspace.id);
    setWorkspaceName(workspace.name);
    setWorkspaceDescription(workspace.description);
    setWorkspaceTags(workspace.tags.join(", "));
  }

  useEffect(() => {
    if (!isSessionPending && !session?.user) {
      router.replace("/sign-in");
    }
  }, [isSessionPending, router, session]);

  if (isSessionPending || workspacesQuery.isLoading) {
    return (
      <main className="w-full">
        <Navbar />

        <div className="p-8">
          <div className="space-y-6 animate-in fade-in duration-500">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 rounded-lg" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="lg:col-span-2 h-[400px] rounded-lg" />
              <Skeleton className="h-[400px] rounded-lg" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <main className="w-full">
      <Navbar>
        <Logo />
      </Navbar>

      <main className="min-h-screen bg-muted/20 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <Card className="rounded-3xl border-primary/10 bg-gradient-to-r from-primary/10 via-background to-background">
            <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
              <div>
                <h1 className="font-heading text-4xl font-semibold tracking-tight">Your workspaces</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Create isolated RAG workspaces, ingest document paths, and keep each chat flow tied to your account.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="lg"
                  className="cursor-pointer"
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending}
                >
                  <FolderPlusIcon />
                  {createMutation.isPending ? "Creating..." : "New workspace"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workspacesQuery.data?.map((workspace, index) => (
              <Card
                key={workspace.id}
                className="group cursor-pointer rounded-3xl transition-colors hover:border-primary/40 hover:bg-primary/5"
                onClick={() => router.push(`/workspaces/${workspace.id}`)}
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">
                        {workspace.name || `Workspace ${String(index + 1).padStart(2, "0")}`}
                      </CardTitle>
                      <CardDescription>Created {formatDate(workspace.created_at)}</CardDescription>
                    </div>
                    <Popover
                      open={editingWorkspaceId === workspace.id}
                      onOpenChange={(open) => {
                        if (open) {
                          openWorkspaceEditor(workspace);
                          return;
                        }

                        setEditingWorkspaceId(null);
                      }}
                    >
                      <PopoverTrigger asChild onClick={(event) => event.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer rounded-full opacity-70 transition-opacity hover:opacity-100 group-hover:opacity-100"
                        >
                          <MoreVerticalIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="gap-4 text-left"
                        align="start"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Button
                          className="h-9 text-destructive hover:text-destructive"
                          onClick={() => deleteMutation.mutate(workspace.id)}
                          disabled={deleteMutation.isPending}
                          variant="outline"
                        >
                          <TrashIcon /> Delete
                        </Button>
                        {/*<div className="space-y-2">
                          <Label htmlFor={`workspace-name-${workspace.id}`}>Name</Label>
                          <Input
                            id={`workspace-name-${workspace.id}`}
                            value={workspaceName}
                            onChange={(event) => setWorkspaceName(event.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`workspace-description-${workspace.id}`}>Description</Label>
                          <Textarea
                            id={`workspace-description-${workspace.id}`}
                            className="min-h-24"
                            value={workspaceDescription}
                            onChange={(event) => setWorkspaceDescription(event.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`workspace-tags-${workspace.id}`}>Tags</Label>
                          <Input
                            id={`workspace-tags-${workspace.id}`}
                            value={workspaceTags}
                            onChange={(event) => setWorkspaceTags(event.target.value)}
                            placeholder="research, rag, docs"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <Button
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => updateMutation.mutate(workspace.id)}
                            disabled={updateMutation.isPending}
                          >
                            <PencilLineIcon />
                            Save
                          </Button>
                          <Button
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={() => deleteMutation.mutate(workspace.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2Icon />
                            Delete
                          </Button>
                        </div>*/}
                      </PopoverContent>
                    </Popover>
                  </div>
                  <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {workspace.description ||
                      "No description yet. Add context so this workspace is easier to understand at a glance."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {workspace.tags.length > 0 ? (
                      workspace.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="secondary">No tags</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                    {workspace.materials.length} material{workspace.materials.length === 1 ? "" : "s"}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {workspacesQuery.isLoading ? (
            <Card className="rounded-3xl">
              <CardContent className="p-6 text-sm text-muted-foreground">Loading workspaces...</CardContent>
            </Card>
          ) : null}

          {workspacesQuery.isError ? (
            <Card className="rounded-3xl border-destructive/40">
              <CardContent className="p-6 text-sm text-destructive">{workspacesQuery.error.message}</CardContent>
            </Card>
          ) : null}

          {workspacesQuery.data?.length === 0 ? (
            <Card className="max-w-3xl items-center mx-auto rounded-3xl border-dashed">
              <CardContent className="flex flex-col items-center text-center text-muted-foreground gap-4 p-8">
                <div>
                  <h2 className="font-heading text-2xl font-semibold">No workspaces yet</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    Create your first workspace to start uploading document paths and querying a dedicated knowledge
                    base.
                  </p>
                </div>
                {/*<Button
                  className="cursor-pointer"
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending}
                >
                  <FolderPlusIcon />
                  Create first workspace
                </Button>*/}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>
    </main>
  );
}
