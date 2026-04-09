"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Cable, Save, Trash2 } from "lucide-react";
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

export default function SettingsPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = Array.isArray(params.workspaceId) ? params.workspaceId[0] : params.workspaceId;
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<{ name: string; description: string; tags: string } | null>(null);

  const workspaceQuery = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceApi.get(session!.accessToken, workspaceId!),
    enabled: Boolean(session?.accessToken && workspaceId),
  });

  const name = draft?.name ?? workspaceQuery.data?.name ?? "";
  const description = draft?.description ?? workspaceQuery.data?.description ?? "";
  const tags = draft?.tags ?? workspaceQuery.data?.tags.join(", ") ?? "";

  const updateMutation = useMutation({
    mutationFn: () =>
      workspaceApi.update(session!.accessToken, workspaceId!, {
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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start rounded-2xl p-1">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-2xl">Workspace details</CardTitle>
              <CardDescription>Edit the identity and context shown across this workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Name</Label>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspace-description">Description</Label>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspace-tags">Tags</Label>
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
                />
              </div>
              <div className="flex justify-end">
                <Button className="cursor-pointer" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                  <Save />
                  {updateMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environment">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-xl">Environment</CardTitle>
              <CardDescription>Current backend configuration used by this workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-border/60 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Cable className="size-4" />
                  API base URL
                </div>
                <p className="mt-2 break-all font-medium">{API_URL}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-xl">Maintenance</CardTitle>
              <CardDescription>Clear any locally cached chat session for this workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => {
                  if (!workspaceId) {
                    return;
                  }

                  clearWorkspaceSession(workspaceId);
                  toast.success("Local session cache cleared");
                }}
              >
                <Trash2 />
                Clear local session cache
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
