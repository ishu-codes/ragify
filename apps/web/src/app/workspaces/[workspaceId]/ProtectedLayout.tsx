"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DatabaseZap } from "lucide-react";

import { AppSidebar, Navbar } from "@/components/workspaces";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/useAuthSession";
import { workspaceApi } from "@/lib/api";
import { WorkspaceUploadProvider } from "./WorkspaceUploadContext";

interface Props {
  children: ReactNode;
  workspaceId: string;
}

export default function ProtectedLayout({ children, workspaceId }: Props) {
  const { session, isPending: loading } = useSession();
  const router = useRouter();

  const workspaceQuery = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceApi.get(session!.accessToken, workspaceId),
    enabled: Boolean(session?.accessToken && workspaceId),
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
        <main className="w-full">
          <Navbar>
            <SidebarTrigger />
          </Navbar>
          <div className="space-y-6">
            {workspaceQuery.isError ? (
              <Card className="rounded-3xl border-destructive/30 bg-destructive/5">
                <CardContent className="flex items-center gap-3 p-6 text-sm text-destructive">
                  <DatabaseZap className="size-4" />
                  <span>Unable to load this workspace right now.</span>
                </CardContent>
              </Card>
            ) : null}

            {children}
          </div>
        </main>
      </WorkspaceUploadProvider>
    </SidebarProvider>
  );
}
