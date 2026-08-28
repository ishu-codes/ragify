import { Link, useLocation } from "react-router-dom";
import {
  FolderKanbanIcon,
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
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/marketing/Wordmark";
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
          <span className="group-data-[collapsible=icon]:hidden">
            <Wordmark size="md" />
          </span>
          <span className="hidden font-mono text-sm font-semibold text-brand-text group-data-[collapsible=icon]:block">
            {"//"}
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground group-data-[collapsible=icon]:hidden">
            {"// workspace"}
          </SidebarGroupLabel>
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
                          ? "pointer-events-none rounded-[6px] bg-muted! text-foreground! hover:bg-muted! hover:text-foreground! data-active:bg-muted! data-active:text-foreground!"
                          : "rounded-[6px] text-sm text-muted-foreground hover:bg-muted/50! hover:text-foreground! active:bg-muted/50! active:text-foreground!",
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                      <span className="text-sm font-medium tracking-tight">{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </nav>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <Logout
                variant="ghost"
                className={cn(
                  "flex items-center gap-3 rounded-[6px] px-3 py-2 transition-colors group relative w-full justify-start",
                  "text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  "group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0",
                )}
              />
            }
          >
            <LogOutIcon className="h-4 w-4 transition-transform group-hover:scale-105" />
            <span className="text-sm font-medium tracking-tight group-data-[collapsible=icon]:hidden">Logout</span>
          </TooltipTrigger>
          <TooltipContent side="right" align="center" hidden={state !== "collapsed"}>
            Logout
          </TooltipContent>
        </Tooltip>
      </SidebarFooter>
    </Sidebar>
  );
}
