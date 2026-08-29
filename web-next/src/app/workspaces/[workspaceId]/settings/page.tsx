"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Cable,
  Check,
  Copy,
  Save,
  Settings2,
  Trash2,
  Wrench,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DashedPanel } from "@/components/marketing/DashedPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/hooks/useAuthSession";
import { API_URL, workspaceApi } from "@/lib/api";
import { clearWorkspaceSession } from "@/lib/workspace-session";

export default function WorkspaceSettingsPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params?.workspaceId ?? "";
  const { session } = useSession();
  const accessToken = session?.accessToken;
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<{
    name: string;
    description: string;
    tags: string;
  } | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);

  const workspaceQuery = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Session token is unavailable");
      }
      return workspaceApi.get(accessToken, workspaceId);
    },
    enabled: Boolean(accessToken && workspaceId),
  });

  const name = draft?.name ?? workspaceQuery.data?.name ?? "";
  const description =
    draft?.description ?? workspaceQuery.data?.description ?? "";
  const tags = draft?.tags ?? workspaceQuery.data?.tags.join(", ") ?? "";

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!accessToken) {
        throw new Error("Session token is unavailable");
      }
      return workspaceApi.update(accessToken, workspaceId, {
        name,
        description,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
    },
    onSuccess: (workspace) => {
      queryClient.setQueryData(["workspace", workspaceId], workspace);
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setDraft(null);
      toast.success("Workspace details updated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function handleCopyUrl() {
    navigator.clipboard.writeText(API_URL);
    setUrlCopied(true);
    toast.success("API URL copied");
    setTimeout(() => setUrlCopied(false), 2000);
  }

  return (
    <div className="container max-w-3xl space-y-8 py-10">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Workspace settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage identity, environment, and maintenance for this workspace.
        </p>
      </header>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="details"
            className="gap-1.5 rounded-none border-b-2 border-transparent px-4 py-2.5 text-xs data-[state=active]:border-brand data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            <Settings2 className="size-3.5" />
            Details
          </TabsTrigger>
          <TabsTrigger
            value="environment"
            className="gap-1.5 rounded-none border-b-2 border-transparent px-4 py-2.5 text-xs data-[state=active]:border-brand data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            <Cable className="size-3.5" />
            Environment
          </TabsTrigger>
          <TabsTrigger
            value="maintenance"
            className="gap-1.5 rounded-none border-b-2 border-transparent px-4 py-2.5 text-xs data-[state=active]:border-brand data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            <Wrench className="size-3.5" />
            Maintenance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <DashedPanel className="bg-card p-6 sm:p-8">
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold tracking-tight">
                Workspace details
              </h2>
              <p className="text-xs text-muted-foreground">
                Edit the identity and context shown across this workspace.
              </p>
            </div>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name" className="text-sm font-medium">
                  Name
                </Label>
                <Input
                  id="workspace-name"
                  value={name}
                  onChange={(event) =>
                    setDraft((current) => ({
                      name: event.target.value,
                      description:
                        current?.description ??
                        workspaceQuery.data?.description ??
                        "",
                      tags:
                        current?.tags ??
                        workspaceQuery.data?.tags.join(", ") ??
                        "",
                    }))
                  }
                  className="h-10 rounded-md text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="workspace-description"
                  className="text-sm font-medium"
                >
                  Description
                </Label>
                <Textarea
                  id="workspace-description"
                  value={description}
                  onChange={(event) =>
                    setDraft((current) => ({
                      name: current?.name ?? workspaceQuery.data?.name ?? "",
                      description: event.target.value,
                      tags:
                        current?.tags ??
                        workspaceQuery.data?.tags.join(", ") ??
                        "",
                    }))
                  }
                  className="min-h-24 rounded-md text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspace-tags" className="text-sm font-medium">
                  Tags
                </Label>
                <Input
                  id="workspace-tags"
                  value={tags}
                  onChange={(event) =>
                    setDraft((current) => ({
                      name: current?.name ?? workspaceQuery.data?.name ?? "",
                      description:
                        current?.description ??
                        workspaceQuery.data?.description ??
                        "",
                      tags: event.target.value,
                    }))
                  }
                  placeholder="research, onboarding, product docs"
                  className="h-10 rounded-md text-sm"
                />
              </div>
              <div className="flex justify-end pt-1">
                <Button
                  variant="pill"
                  className="gap-2 cursor-pointer"
                  onClick={() => updateMutation.mutate()}
                  disabled={updateMutation.isPending}
                >
                  <Save className="size-4" />
                  {updateMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </div>
          </DashedPanel>
        </TabsContent>

        <TabsContent value="environment">
          <DashedPanel className="bg-card p-6 sm:p-8">
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold tracking-tight">
                Environment
              </h2>
              <p className="text-xs text-muted-foreground">
                Current backend configuration used by this workspace.
              </p>
            </div>
            <div className="mt-6">
              <div className="flex flex-col gap-3 border border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Cable className="size-3.5" />
                    API base URL
                  </div>
                  <p className="truncate font-mono text-sm">{API_URL}</p>
                </div>
                <Button
                  variant="ghost"
                  className="shrink-0 cursor-pointer gap-1.5 text-xs"
                  onClick={handleCopyUrl}
                >
                  {urlCopied ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  {urlCopied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          </DashedPanel>
        </TabsContent>

        <TabsContent value="maintenance">
          <DashedPanel className="bg-card p-6 sm:p-8">
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold tracking-tight">
                Maintenance
              </h2>
              <p className="text-xs text-muted-foreground">
                Clear any locally cached chat session for this workspace.
              </p>
            </div>
            <div className="mt-6">
              <Button
                variant="outlinePill"
                className="gap-2 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  if (!workspaceId) {
                    return;
                  }

                  clearWorkspaceSession(workspaceId);
                  toast.success("Local session cache cleared");
                }}
              >
                <Trash2 className="size-4" />
                Clear local session cache
              </Button>
            </div>
          </DashedPanel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
