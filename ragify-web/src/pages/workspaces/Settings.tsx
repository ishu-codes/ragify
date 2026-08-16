import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Cable, Check, Copy, Save, Settings2, Trash2, Wrench } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/hooks/useAuthSession";
import { API_URL, workspaceApi } from "@/lib/api";
import { clearWorkspaceSession } from "@/lib/workspace-session";

export default function WorkspaceSettingsPage() {
  const { workspaceId = "" } = useParams<{ workspaceId: string }>();
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<{ name: string; description: string; tags: string } | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);

  const workspaceQuery = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceApi.get(session!.accessToken, workspaceId),
    enabled: Boolean(session?.accessToken && workspaceId),
  });

  const name = draft?.name ?? workspaceQuery.data?.name ?? "";
  const description = draft?.description ?? workspaceQuery.data?.description ?? "";
  const tags = draft?.tags ?? workspaceQuery.data?.tags.join(", ") ?? "";

  const updateMutation = useMutation({
    mutationFn: () =>
      workspaceApi.update(session!.accessToken, workspaceId, {
        name,
        description,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }),
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
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Workspace settings</h1>
        <p className="text-sm text-muted-foreground">Manage identity, environment, and maintenance for this workspace.</p>
      </header>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="h-auto w-fit flex-wrap justify-start gap-1 rounded-xl bg-muted p-1">
          <TabsTrigger
            value="details"
            className="gap-1.5 rounded-lg px-3 py-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <Settings2 className="size-3.5" />
            Details
          </TabsTrigger>
          <TabsTrigger
            value="environment"
            className="gap-1.5 rounded-lg px-3 py-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <Cable className="size-3.5" />
            Environment
          </TabsTrigger>
          <TabsTrigger
            value="maintenance"
            className="gap-1.5 rounded-lg px-3 py-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <Wrench className="size-3.5" />
            Maintenance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-tight">Workspace details</CardTitle>
              <CardDescription className="text-xs">
                Edit the identity and context shown across this workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                      description: current?.description ?? workspaceQuery.data?.description ?? "",
                      tags: current?.tags ?? workspaceQuery.data?.tags.join(", ") ?? "",
                    }))
                  }
                  className="h-10 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspace-description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="workspace-description"
                  value={description}
                  onChange={(event) =>
                    setDraft((current) => ({
                      name: current?.name ?? workspaceQuery.data?.name ?? "",
                      description: event.target.value,
                      tags: current?.tags ?? workspaceQuery.data?.tags.join(", ") ?? "",
                    }))
                  }
                  className="min-h-24 rounded-xl text-sm"
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
                      description: current?.description ?? workspaceQuery.data?.description ?? "",
                      tags: event.target.value,
                    }))
                  }
                  placeholder="research, onboarding, product docs"
                  className="h-10 rounded-xl text-sm"
                />
              </div>
              <div className="flex justify-end pt-1">
                <Button
                  className="gap-2 cursor-pointer rounded-xl shadow-sm"
                  onClick={() => updateMutation.mutate()}
                  disabled={updateMutation.isPending}
                >
                  <Save className="size-4" />
                  {updateMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environment">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-tight">Environment</CardTitle>
              <CardDescription className="text-xs">
                Current backend configuration used by this workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Cable className="size-3.5" />
                    API base URL
                  </div>
                  <p className="truncate font-mono text-sm">{API_URL}</p>
                </div>
                <Button
                  variant="ghost"
                  className="shrink-0 cursor-pointer gap-1.5 rounded-xl text-xs"
                  onClick={handleCopyUrl}
                >
                  {urlCopied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  {urlCopied ? "Copied" : "Copy"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-tight">Maintenance</CardTitle>
              <CardDescription className="text-xs">
                Clear any locally cached chat session for this workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="gap-2 cursor-pointer rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
