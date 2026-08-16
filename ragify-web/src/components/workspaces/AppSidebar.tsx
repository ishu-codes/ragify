import { Link, useLocation } from "react-router-dom";
import {
  FolderKanbanIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MessageSquareIcon,
  SettingsIcon,
  UploadIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Logout from "./Logout";

type AppSidebarProps = {
  workspaceId?: string;
};

export default function AppSidebar({ workspaceId }: AppSidebarProps) {
  const { pathname } = useLocation();
  const { state } = useSidebar();

  const sidebarItems = workspaceId
    ? [
        { name: "Overview", href: `/workspaces/${workspaceId}`, icon: LayoutDashboardIcon },
        { name: "Chat", href: `/workspaces/${workspaceId}/chat`, icon: MessageSquareIcon },
        { name: "Upload", href: `/workspaces/${workspaceId}/upload`, icon: UploadIcon },
        { name: "Settings", href: `/workspaces/${workspaceId}/settings`, icon: SettingsIcon },
      ]
    : [{ name: "Workspaces", href: "/workspaces", icon: FolderKanbanIcon }];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="items-center py-4">
        <Link
          to="/workspaces"
          className="flex items-center gap-3 transition-opacity hover:opacity-80 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
        >
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/10 group-data-[collapsible=icon]:size-8">
            <GraduationCapIcon className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-xl font-bold tracking-tight leading-none">Ragify</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <nav className="pb-8">
            <SidebarMenu className="gap-2">
              {sidebarItems.map((item) => {
                const isActive = workspaceId
                  ? item.href === `/workspaces/${workspaceId}`
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                  : pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link to={item.href} />}
                      tooltip={item.name}
                      isActive={isActive}
                      className={cn(
                        isActive
                          ? "pointer-events-none bg-primary! text-primary-foreground! hover:bg-primary! hover:text-primary-foreground! data-active:bg-primary! data-active:text-primary-foreground!"
                          : "text-muted-foreground hover:bg-muted/50! hover:text-foreground! active:bg-muted/50! active:text-foreground!",
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                      <span className="tracking-tight">{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </nav>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Tooltip>
          <TooltipTrigger
            render={
              <Logout
                variant="ghost"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group relative w-full justify-start",
                  "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  "group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0",
                )}
              />
            }
          >
            <LogOutIcon className="h-4 w-4 transition-transform group-hover:scale-105" />
            <span className="tracking-tight group-data-[collapsible=icon]:hidden">Logout</span>
          </TooltipTrigger>
          <TooltipContent side="right" align="center" hidden={state !== "collapsed"}>
            Logout
          </TooltipContent>
        </Tooltip>
      </SidebarFooter>
    </Sidebar>
  );
}
