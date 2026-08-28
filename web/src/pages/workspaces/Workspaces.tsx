import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Code2,
  FileSpreadsheet,
  FilesIcon,
  FolderPlusIcon,
  Layers,
  MessageSquare,
  MoreVerticalIcon,
  Plus,
  Search,
  Settings2,
  TagIcon,
  TrashIcon,
  UploadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/useAuthSession";
import { workspaceApi } from "@/lib/api";
import { Navbar } from "@/components/workspaces";
import Logo from "@/components/Logo";
import { DashedPanel } from "@/components/marketing/DashedPanel";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

// Preset templates for 1-click workspace creation
const PRESET_TEMPLATES = [
  {
    name: "Software Architecture & Code Base",
    description: "RAG workspace for indexing API documentations, repository files, and system design specs.",
    tags: ["codebase", "architecture", "api-docs"],
    icon: Code2,
  },
  {
    name: "Financial Reports & Audit Compliance",
    description: "Dedicated workspace for parsing Q3/Q4 earnings, balance sheets, and regulatory filings.",
    tags: ["financial", "compliance", "q3-audit"],
    icon: FileSpreadsheet,
  },
  {
    name: "Academic Papers & Deep Research",
    description: "Workspace configured for AI whitepapers, literature reviews, and research notes.",
    tags: ["research", "whitepapers", "deep-learning"],
    icon: BookOpen,
  },
];

export default function WorkspacesPage() {
  const { session, isPending: isSessionPending } = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const userId = session?.user?.id;

  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // New Workspace Dialog State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [newWsDescription, setNewWsDescription] = useState("");
  const [newWsTags, setNewWsTags] = useState("");

  const workspacesQuery = useQuery({
    queryKey: ["workspaces", userId],
    queryFn: () => workspaceApi.list(session!.accessToken),
    enabled: Boolean(session?.accessToken && userId),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const created = await workspaceApi.create(session!.accessToken);
      if (newWsName.trim() || newWsDescription.trim() || newWsTags.trim()) {
        const tagList = newWsTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        return workspaceApi.update(session!.accessToken, created.id, {
          name: newWsName.trim() || created.name,
          description: newWsDescription.trim(),
          tags: tagList.length ? tagList : created.tags,
        });
      }
      return created;
    },
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces", userId] });
      toast.success("RAG workspace initialized!");
      setIsModalOpen(false);
      resetModalState();
      navigate(`/workspaces/${workspace.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (workspaceId: string) => workspaceApi.delete(session!.accessToken, workspaceId),
    onSuccess: (_, workspaceId) => {
      queryClient.setQueryData(["workspaces", userId], (current: typeof workspacesQuery.data) =>
        current?.filter((item) => item.id !== workspaceId),
      );
      toast.success("Workspace deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!isSessionPending && !session?.user) {
      navigate("/sign-in", { replace: true });
    }
  }, [isSessionPending, navigate, session]);

  function resetModalState() {
    setNewWsName("");
    setNewWsDescription("");
    setNewWsTags("");
  }

  function handleSelectTemplate(tpl: typeof PRESET_TEMPLATES[0]) {
    setNewWsName(tpl.name);
    setNewWsDescription(tpl.description);
    setNewWsTags(tpl.tags.join(", "));
  }

  // Extract all unique tags across all workspaces for pill filter bar
  const allUniqueTags = useMemo(() => {
    if (!workspacesQuery.data) return [];
    const tagsSet = new Set<string>();
    workspacesQuery.data.forEach((w) => {
      w.tags?.forEach((t) => tagsSet.add(t));
    });
    return Array.from(tagsSet);
  }, [workspacesQuery.data]);

  // Filter workspaces by search term & tag pill
  const filteredWorkspaces = useMemo(() => {
    if (!workspacesQuery.data) return [];
    let list = workspacesQuery.data;

    if (selectedTag) {
      list = list.filter((w) => w.tags?.includes(selectedTag));
    }

    const term = searchQuery.toLowerCase().trim();
    if (!term) return list;

    return list.filter(
      (w) =>
        w.name.toLowerCase().includes(term) ||
        w.description?.toLowerCase().includes(term) ||
        w.tags.some((t) => t.toLowerCase().includes(term)),
    );
  }, [workspacesQuery.data, searchQuery, selectedTag]);

  // Compute metrics
  const totalMaterials = useMemo(() => {
    return workspacesQuery.data?.reduce((acc, curr) => acc + (curr.materials?.length || 0), 0) || 0;
  }, [workspacesQuery.data]);

  if (isSessionPending || workspacesQuery.isLoading) {
    return (
      <main className="w-full min-h-screen bg-muted/20">
        <Navbar />
        <div className="container space-y-8 py-10">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-20 w-full max-w-md" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-52" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <main className="w-full min-h-screen bg-background pb-16">
      <Navbar>
        <Logo />
      </Navbar>

      <div className="container space-y-8 py-10">
        {/* HERO */}
        <DashedPanel className="bg-card px-6 py-8 sm:px-10 sm:py-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_55%)]"
          />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/[0.07] px-2.5 py-1 text-[11px] font-medium text-primary">
                <Layers className="size-3.5" />
                RAG workspaces
              </div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your AI RAG workspaces</h1>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                Create isolated vector namespaces, ingest multi-format source materials, and chat with AI grounded in
                exact citations.
              </p>
            </div>

            <div className="flex shrink-0">
              <Button
                size="lg"
                variant="pill"
                className="gap-2"
                onClick={() => {
                  resetModalState();
                  setIsModalOpen(true);
                }}
              >
                <FolderPlusIcon className="size-4" />
                New workspace
              </Button>
            </div>
          </div>
        </DashedPanel>

        {/* METRICS & SEARCH */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <DashedPanel className="grid w-fit grid-cols-2 bg-card">
            <div className="flex items-center gap-3 p-4 sm:p-5">
              <span className="font-mono text-xs text-brand-text">{"//"}</span>
              <div>
                <p className="text-lg leading-none font-semibold tabular-nums">{workspacesQuery.data?.length || 0}</p>
                <p className="mt-1 text-xs text-muted-foreground">Workspaces</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 sm:p-5">
              <span className="font-mono text-xs text-brand-text">{"//"}</span>
              <div>
                <p className="text-lg leading-none font-semibold tabular-nums">{totalMaterials}</p>
                <p className="mt-1 text-xs text-muted-foreground">Files indexed</p>
              </div>
            </div>
          </DashedPanel>

          <div className="relative lg:w-80 xl:w-96">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search workspaces by name or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-md border-border bg-card pl-9 text-sm focus-visible:ring-brand/40"
            />
          </div>
        </div>

        {/* TAG FILTER PILLS */}
        {allUniqueTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                selectedTag === null
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              All ({workspacesQuery.data?.length})
            </button>
            {allUniqueTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  selectedTag === tag
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <TagIcon className="size-3 opacity-70" />
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* WORKSPACES GRID */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorkspaces.map((workspace, index) => (
            <DashedPanel
              key={workspace.id}
              className="group relative flex cursor-pointer flex-col bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_-24px] hover:shadow-brand/25"
              onClick={() => navigate(`/workspaces/${workspace.id}`)}
            >
              <div className="flex-1 space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-mono text-sm font-semibold text-brand-text">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <Popover
                    open={editingWorkspaceId === workspace.id}
                    onOpenChange={(open) => {
                      if (open) {
                        setEditingWorkspaceId(workspace.id);
                        return;
                      }
                      setEditingWorkspaceId(null);
                    }}
                  >
                    <PopoverTrigger onClick={(event) => event.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 cursor-pointer text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <MoreVerticalIcon className="size-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-44 p-1.5 text-left"
                      align="end"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Button
                        className="h-8 w-full justify-start gap-2 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => deleteMutation.mutate(workspace.id)}
                        disabled={deleteMutation.isPending}
                        variant="ghost"
                      >
                        <TrashIcon className="size-3.5" /> Delete workspace
                      </Button>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="min-w-0 space-y-1.5">
                  <p className="truncate text-base font-semibold tracking-tight transition-colors group-hover:text-brand-text">
                    {workspace.name || `Workspace ${String(index + 1).padStart(2, "0")}`}
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground">
                    Created {formatDate(workspace.created_at)}
                  </p>
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {workspace.description || "No description yet. Add details in settings."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {workspace.tags && workspace.tags.length > 0 ? (
                    workspace.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded-full text-[10px] font-medium">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="rounded-full text-[10px] font-medium text-muted-foreground">
                      No tags
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/20 px-5 py-3">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <FilesIcon className="size-3.5" />
                  {workspace.materials?.length || 0} material{workspace.materials?.length === 1 ? "" : "s"}
                </span>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 cursor-pointer text-muted-foreground hover:bg-brand/10 hover:text-brand-text"
                    title="Open chat"
                    onClick={() => navigate(`/workspaces/${workspace.id}/chat`)}
                  >
                    <MessageSquare className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 cursor-pointer text-muted-foreground hover:bg-brand/10 hover:text-brand-text"
                    title="Upload files"
                    onClick={() => navigate(`/workspaces/${workspace.id}/upload`)}
                  >
                    <UploadCloud className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 cursor-pointer text-muted-foreground hover:bg-brand/10 hover:text-brand-text"
                    title="Settings"
                    onClick={() => navigate(`/workspaces/${workspace.id}/settings`)}
                  >
                    <Settings2 className="size-4" />
                  </Button>
                </div>
              </div>
            </DashedPanel>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredWorkspaces.length === 0 && !workspacesQuery.isLoading && (
          <DashedPanel className="mx-auto max-w-xl bg-card p-10 text-center">
            <div className="flex flex-col items-center gap-5">
              <div className="flex size-12 items-center justify-center bg-brand/10 text-brand-text ring-1 ring-brand/20">
                <FolderPlusIcon className="size-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold tracking-tight">
                  {searchQuery || selectedTag ? "No matching workspaces found" : "No workspaces created yet"}
                </h3>
                <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {searchQuery || selectedTag
                    ? "Try clearing your filters, or create a new workspace."
                    : "Create your first workspace to start uploading documents, parsing codebases, and querying with grounded citations."}
                </p>
              </div>
              <Button
                size="lg"
                variant="pill"
                className="gap-2"
                onClick={() => {
                  resetModalState();
                  setIsModalOpen(true);
                }}
              >
                <Plus className="size-4" /> Create first workspace
              </Button>
            </div>
          </DashedPanel>
        )}
      </div>

      {/* NEW WORKSPACE CREATION DIALOG */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="p-6 sm:max-w-[540px] sm:p-8">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold tracking-tight">
              <span className="flex size-9 items-center justify-center bg-brand/10 text-brand-text">
                <FolderPlusIcon className="size-4" />
              </span>
              New workspace
            </DialogTitle>
            <DialogDescription className="text-sm">
              Configure details or pick a preset template to set up your knowledge namespace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label className="text-sm font-medium">Preset templates</Label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl)}
                  className="space-y-2 border bg-muted/20 p-3 text-left transition-all hover:border-brand/40 hover:bg-brand/[0.06] cursor-pointer"
                >
                  <tpl.icon className="size-4 text-brand-text" />
                  <p className="line-clamp-2 text-[11px] leading-tight font-semibold">{tpl.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ws-name" className="text-sm font-medium">
                Workspace name
              </Label>
              <Input
                id="ws-name"
                placeholder="e.g. Q3 Financial Reports or React Architecture"
                value={newWsName}
                onChange={(e) => setNewWsName(e.target.value)}
                className="h-10 rounded-md text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ws-desc" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="ws-desc"
                placeholder="Brief summary of the documents and knowledge stored in this workspace..."
                value={newWsDescription}
                onChange={(e) => setNewWsDescription(e.target.value)}
                className="h-20 rounded-md text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ws-tags" className="text-sm font-medium">
                Tags (comma separated)
              </Label>
              <Input
                id="ws-tags"
                placeholder="e.g. codebase, pdfs, finance"
                value={newWsTags}
                onChange={(e) => setNewWsTags(e.target.value)}
                className="h-10 rounded-md text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button
              type="button"
              variant="outlinePill"
              onClick={() => setIsModalOpen(false)}
              className="cursor-pointer text-sm font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="pill"
              className="gap-2 cursor-pointer"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
            >
              <Plus className="size-4" />
              {createMutation.isPending ? "Initializing..." : "Create workspace"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
