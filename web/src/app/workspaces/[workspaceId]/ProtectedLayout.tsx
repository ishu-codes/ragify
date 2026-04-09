"use client";

import { type ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DatabaseZap, MessageSquareText, Settings2, Upload } from "lucide-react";

import { AppSidebar, Navbar } from "@/components/workspaces";
import { Badge } from "@/components/ui/badge";
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
  const pathname = usePathname();

  const workspaceQuery = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceApi.get(session!.accessToken, workspaceId),
    enabled: Boolean(session?.accessToken && workspaceId),
  });

  const currentSection =
    pathname === `/workspaces/${workspaceId}` ? "Overview" : (pathname.split("/").at(-1) ?? "overview");
  const sectionLabel = currentSection.charAt(0).toUpperCase() + currentSection.slice(1);

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
            <Skeleton className="h-[600px] w-64" />
            <Skeleton className="h-[600px] flex-1" />
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
          <div className="space-y-6 p-6 lg:p-8">
            <Card className="rounded-3xl border-primary/10 bg-gradient-to-r from-primary/10 via-background to-background">
              <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-end lg:justify-between lg:p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/workspaces" className="hover:text-foreground">
                      Workspaces
                    </Link>
                    <span>/</span>
                    <span>{workspaceId}</span>
                    <span>/</span>
                    <span>{sectionLabel}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-semibold tracking-tight">
                        {workspaceQuery.data?.name ?? "Workspace"}
                      </h1>
                    </div>
                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                      {workspaceQuery.data?.description ||
                        "Upload source material, run queries, review prior sessions, and tune the workspace configuration."}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {workspaceQuery.data?.tags.length ? (
                        workspaceQuery.data.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline">No tags</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2"></div>
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-3 xl:hidden">
              <Link href={`/workspaces/${workspaceId}/chat`} className="rounded-2xl border p-4 text-sm hover:bg-muted/40">
                <div className="flex items-center gap-2 font-medium">
                  <MessageSquareText className="size-4 text-primary" />
                  Chat
                </div>
              </Link>
              <Link
                href={`/workspaces/${workspaceId}/upload`}
                className="rounded-2xl border p-4 text-sm hover:bg-muted/40"
              >
                <div className="flex items-center gap-2 font-medium">
                  <Upload className="size-4 text-primary" />
                  Upload
                </div>
              </Link>
              <Link
                href={`/workspaces/${workspaceId}/settings`}
                className="rounded-2xl border p-4 text-sm hover:bg-muted/40"
              >
                <div className="flex items-center gap-2 font-medium">
                  <Settings2 className="size-4 text-primary" />
                  Settings
                </div>
              </Link>
            </div>

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
