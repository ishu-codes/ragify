import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FolderPlusIcon,
  MoreVerticalIcon,
  TrashIcon,
  Search,
  Sparkles,
  Layers,
  FilesIcon,
  Plus,
  TagIcon,
  MessageSquare,
  UploadCloud,
  Settings2,
  Code2,
  FileSpreadsheet,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/useAuthSession";
import { workspaceApi } from "@/lib/api";
import { Navbar } from "@/components/workspaces";
import Logo from "@/components/Logo";
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
    gradient: "from-blue-500/20 to-cyan-500/10",
  },
  {
    name: "Financial Reports & Audit Compliance",
    description: "Dedicated workspace for parsing Q3/Q4 earnings, balance sheets, and regulatory filings.",
    tags: ["financial", "compliance", "q3-audit"],
    icon: FileSpreadsheet,
    gradient: "from-emerald-500/20 to-teal-500/10",
  },
  {
    name: "Academic Papers & Deep Research",
    description: "Workspace configured for AI whitepapers, literature reviews, and research notes.",
    tags: ["research", "whitepapers", "deep-learning"],
    icon: BookOpen,
    gradient: "from-purple-500/20 to-pink-500/10",
  },
];

export default function WorkspacesPage() {
  const { session, isPending: isSessionPending } = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // New Workspace Dialog State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [newWsDescription, setNewWsDescription] = useState("");
  const [newWsTags, setNewWsTags] = useState("");

  const workspacesQuery = useQuery({
    queryKey: ["workspaces", session?.user.id],
    queryFn: () => workspaceApi.list(session!.accessToken),
    enabled: Boolean(session?.accessToken),
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
      queryClient.invalidateQueries({ queryKey: ["workspaces", session?.user.id] });
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
      queryClient.setQueryData(["workspaces", session?.user.id], (current: typeof workspacesQuery.data) =>
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
        <div className="p-8 max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-40 w-full rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-56 rounded-3xl" />
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
    <main className="w-full min-h-screen bg-muted/20 pb-16">
      <Navbar>
        <Logo />
      </Navbar>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* HERO BANNER CARD */}
        <Card className="rounded-3xl border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/15 rounded-full blur-[100px] pointer-events-none" />
          <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/20">
                <Sparkles className="h-3.5 w-3.5" /> AI Knowledge Architecture
              </div>
              <h1 className="font-extrabold text-3xl sm:text-4xl tracking-tight">Your AI RAG Workspaces</h1>
              <p className="max-w-2xl text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                Create isolated vector namespaces, ingest multi-format source materials, and chat with AI grounded in exact citations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                size="lg"
                className="rounded-xl font-bold text-xs gap-2 shadow-lg shadow-primary/25 cursor-pointer"
                onClick={() => {
                  resetModalState();
                  setIsModalOpen(true);
                }}
              >
                <FolderPlusIcon className="h-4 w-4" />
                New Workspace
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* METRICS & SEARCH & TAG FILTER BAR */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground bg-background p-3 rounded-2xl border shadow-sm">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <span>{workspacesQuery.data?.length || 0} Workspaces</span>
              </div>
              <span className="text-border">|</span>
              <div className="flex items-center gap-2">
                <FilesIcon className="h-4 w-4 text-primary" />
                <span>{totalMaterials} Files Indexed</span>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search workspaces by name or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-2xl bg-background border-border/80 text-xs font-medium focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Tag Filter Pills */}
          {allUniqueTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-muted-foreground mr-1">Filter by Tag:</span>
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                  selectedTag === null
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                All ({workspacesQuery.data?.length})
              </button>
              {allUniqueTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1 ${
                    selectedTag === tag
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <TagIcon className="h-2.5 w-2.5 opacity-60" />
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* WORKSPACES GRID */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorkspaces.map((workspace, index) => (
            <Card
              key={workspace.id}
              className="group relative cursor-pointer rounded-3xl border bg-card transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 overflow-hidden flex flex-col justify-between"
              onClick={() => navigate(`/workspaces/${workspace.id}`)}
            >
              <CardHeader className="space-y-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        #{index + 1}
                      </div>
                      <CardTitle className="text-lg font-bold truncate group-hover:text-primary transition-colors">
                        {workspace.name || `Workspace ${String(index + 1).padStart(2, "0")}`}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground font-medium">
                      Created {formatDate(workspace.created_at)}
                    </CardDescription>
                  </div>

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
                        className="cursor-pointer rounded-full h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <MoreVerticalIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-40 p-2 text-left"
                      align="end"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Button
                        className="w-full h-8 text-xs font-semibold text-destructive hover:text-destructive hover:bg-destructive/10 justify-start gap-2"
                        onClick={() => deleteMutation.mutate(workspace.id)}
                        disabled={deleteMutation.isPending}
                        variant="ghost"
                      >
                        <TrashIcon className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </PopoverContent>
                  </Popover>
                </div>

                <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed font-medium">
                  {workspace.description || "No description provided yet. Click settings to add details."}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {workspace.tags && workspace.tags.length > 0 ? (
                    workspace.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] font-semibold gap-1">
                        <TagIcon className="h-2.5 w-2.5 opacity-60" />
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground/60">
                      No tags
                    </Badge>
                  )}
                </div>
              </CardHeader>

              {/* CARD FOOTER & QUICK-ACTION SHORTCUTS */}
              <div className="border-t bg-muted/10">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <FilesIcon className="h-3.5 w-3.5 text-primary" />
                    <span>{workspace.materials?.length || 0} Material{workspace.materials?.length === 1 ? "" : "s"}</span>
                  </div>

                  {/* Quick Shortcut Buttons */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary cursor-pointer"
                      title="Open Chat"
                      onClick={() => navigate(`/workspaces/${workspace.id}/chat`)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary cursor-pointer"
                      title="Upload Files"
                      onClick={() => navigate(`/workspaces/${workspace.id}/upload`)}
                    >
                      <UploadCloud className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary cursor-pointer"
                      title="Settings"
                      onClick={() => navigate(`/workspaces/${workspace.id}/settings`)}
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredWorkspaces.length === 0 && !workspacesQuery.isLoading && (
          <Card className="max-w-2xl mx-auto rounded-3xl border-dashed bg-background p-8 text-center shadow-sm">
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <FolderPlusIcon className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold">
                  {searchQuery || selectedTag ? "No matching workspaces found" : "No RAG Workspaces Created Yet"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md font-medium">
                  {searchQuery || selectedTag
                    ? "Try clearing your filters or create a new workspace."
                    : "Create your first workspace to start uploading documents, parsing codebases, and querying neural AI."}
                </p>
              </div>
              <Button
                size="lg"
                className="rounded-xl font-bold text-xs gap-2 shadow-md cursor-pointer"
                onClick={() => {
                  resetModalState();
                  setIsModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> Create First Workspace
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* NEW WORKSPACE CREATION DIALOG */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[540px] rounded-3xl p-6 sm:p-8">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Initialize New RAG Workspace
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure details or select a preset template to set up your knowledge namespace.
            </DialogDescription>
          </DialogHeader>

          {/* Quick Presets */}
          <div className="space-y-2 py-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Or Pick a Quick Preset Template:
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl)}
                  className="p-3 rounded-2xl border text-left bg-muted/20 hover:bg-primary/10 hover:border-primary/40 transition-all cursor-pointer space-y-1.5"
                >
                  <tpl.icon className="h-4 w-4 text-primary" />
                  <p className="font-bold text-[11px] leading-tight line-clamp-1">{tpl.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ws-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Workspace Name
              </Label>
              <Input
                id="ws-name"
                placeholder="e.g. Q3 Financial Reports or React Architecture"
                value={newWsName}
                onChange={(e) => setNewWsName(e.target.value)}
                className="h-11 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ws-desc" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Description
              </Label>
              <Textarea
                id="ws-desc"
                placeholder="Brief summary of the documents and knowledge stored in this workspace..."
                value={newWsDescription}
                onChange={(e) => setNewWsDescription(e.target.value)}
                className="rounded-xl text-xs resize-none h-20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ws-tags" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tags (Comma Separated)
              </Label>
              <Input
                id="ws-tags"
                placeholder="e.g. codebase, pdfs, finance"
                value={newWsTags}
                onChange={(e) => setNewWsTags(e.target.value)}
                className="h-11 rounded-xl text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-xl font-bold text-xs gap-2 cursor-pointer shadow-md"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
            >
              <Plus className="h-4 w-4" />
              {createMutation.isPending ? "Initializing..." : "Create Workspace"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
