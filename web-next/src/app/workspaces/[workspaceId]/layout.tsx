"use client";

import { useQuery } from "@tanstack/react-query";
import { DatabaseZap } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { type ReactNode, Suspense, useEffect } from "react";
import { DashedPanel } from "@/components/marketing/DashedPanel";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { AppSidebar, Navbar } from "@/components/workspaces";
import { WorkspaceUploadProvider } from "@/context/workspace-upload";
import { useSession } from "@/hooks/useAuthSession";
import { workspaceApi } from "@/lib/api";

function WorkspaceShell({ children }: { children: ReactNode }) {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params?.workspaceId ?? "";
  const { session, isPending: loading } = useSession();
  const accessToken = session?.accessToken;
  const router = useRouter();

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

  useEffect(() => {
    if (!loading && !session?.user) {
      router.replace("/sign-in");
    }
  }, [session, loading, router]);

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
          <div className="pt-[57px]">
            {workspaceQuery.isError ? (
              <DashedPanel className="m-6 border border-destructive/30 bg-destructive/5 p-6">
                <div className="flex items-center gap-3 text-sm text-destructive">
                  <DatabaseZap className="size-4" />
                  <span>Unable to load this workspace right now.</span>
                </div>
              </DashedPanel>
            ) : null}

            {children}
          </div>
        </main>
      </WorkspaceUploadProvider>
    </SidebarProvider>
  );
}

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <WorkspaceShell>{children}</WorkspaceShell>
    </Suspense>
  );
}
