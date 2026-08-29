"use client";

import { LayoutDashboardIcon, LogOutIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/components/Logo";
import { ThemeToggle } from "@/components/navbar/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSidebar } from "@/components/ui/sidebar";
import { useSession } from "@/hooks/useAuthSession";
import { cn } from "@/lib/utils";
import Logout from "./Logout";

export default function Navbar({ children }: { children?: ReactNode }) {
  const { session } = useSession();
  let sidebarState: string | null = null;
  try {
    sidebarState = useSidebar().state;
  } catch {
    sidebarState = null;
  }
  const inSidebarShell = sidebarState !== null;

  return (
    <div
      className={cn(
        "flex h-[57px] w-full items-center justify-between gap-4 border-b border-border bg-background px-4 sm:px-6",
        inSidebarShell &&
          "fixed top-0 left-0 z-30 transition-[left,width] duration-200 ease-linear",
        inSidebarShell &&
          (sidebarState === "collapsed"
            ? "md:left-[var(--sidebar-width-icon)] md:w-[calc(100%-var(--sidebar-width-icon))]"
            : "md:left-[var(--sidebar-width)] md:w-[calc(100%-var(--sidebar-width))]"),
      )}
    >
      {children ? children : <Logo />}

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {session && (
          <Popover>
            <PopoverTrigger>
              <Avatar className="size-8 cursor-pointer rounded-full transition-transform hover:scale-105">
                <AvatarImage src={session?.user.image ?? ""} alt="profile" />
                <AvatarFallback className="bg-brand/10 text-xs font-semibold text-brand-text">
                  {session?.user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent className="w-72 border p-3" align="end">
              <div className="flex items-center gap-3 px-2 py-2">
                <Avatar className="size-9">
                  <AvatarImage src={session?.user.image ?? ""} alt="profile" />
                  <AvatarFallback className="bg-brand/10 text-xs font-semibold text-brand-text">
                    {session?.user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-none">
                    {session?.user.name}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {session?.user.email}
                  </p>
                </div>
              </div>
              <div className="space-y-1 border-border">
                <Button
                  asChild
                  variant="outline"
                  className="h-9 w-full justify-start gap-2 text-xs font-medium"
                >
                  <Link href="/workspaces">
                    <LayoutDashboardIcon className="size-3.5" /> Workspaces
                  </Link>
                </Button>
                <Logout
                  variant="outline"
                  className="h-9 w-full justify-start gap-2 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOutIcon className="size-3.5" /> Logout
                </Logout>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
