import { useEffect } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DatabaseZap } from "lucide-react";

import { AppSidebar, Navbar } from "@/components/workspaces";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/useAuthSession";
import { workspaceApi } from "@/lib/api";
import { WorkspaceUploadProvider } from "./UploadContext";

export default function WorkspaceLayout() {
  const { workspaceId = "" } = useParams<{ workspaceId: string }>();
  const { session, isPending: loading } = useSession();
  const navigate = useNavigate();

  const workspaceQuery = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceApi.get(session!.accessToken, workspaceId),
    enabled: Boolean(session?.accessToken && workspaceId),
  });

  useEffect(() => {
    if (!loading && !session?.user) {
      navigate("/sign-in", { replace: true });
    }
  }, [session, loading, navigate]);

  if (loading || workspaceQuery.isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-150 w-64" />
            <Skeleton className="h-150 flex-1" />
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <SidebarProvider>
      <WorkspaceUploadProvider workspaceId={workspaceId}>
        <AppSidebar workspaceId={workspaceId} />
        <main className="w-full min-w-0">
          <Navbar>
            <SidebarTrigger />
          </Navbar>
          <div>
            {workspaceQuery.isError ? (
              <Card className="rounded-3xl border-destructive/30 bg-destructive/5">
                <CardContent className="flex items-center gap-3 p-6 text-sm text-destructive">
                  <DatabaseZap className="size-4" />
                  <span>Unable to load this workspace right now.</span>
                </CardContent>
              </Card>
            ) : null}

            <Outlet />
          </div>
        </main>
      </WorkspaceUploadProvider>
    </SidebarProvider>
  );
}
