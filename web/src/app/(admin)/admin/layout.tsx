"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Users,
  Heart,
  Trophy,
  ShieldCheck,
  TrophyIcon,
  LogOutIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useSession } from "@/hooks/useAuthSession";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Navbar } from "@/components/workspaces";
import Logout from "@/components/workspaces/Logout";

const adminItems = [
  { name: "Overview", href: "/admin", icon: BarChart3 },
  { name: "Charities", href: "/admin/charities", icon: Heart },
  { name: "Draw Management", href: "/admin/draws", icon: Trophy },
  { name: "Winner Verification", href: "/admin/winners", icon: ShieldCheck },
  { name: "User Management", href: "/admin/users", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session && session.user.role !== "ADMIN") {
      toast.error("Unauthorized. Admin access required.");
      router.replace("/workspaces");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <Navbar />
        <div className="p-8">{children}</div>
      </main>
    </SidebarProvider>
  );
}

function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar>
      <SidebarHeader className="items-center py-4">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/10">
            <TrophyIcon className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight leading-none">Admin Panel</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-8">
            {adminItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group relative",
                    isActive
                      ? "bg-primary text-primary-foreground pointer-events-none"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-4">
        {/*<Button variant="ghost" size="sm" className="w-full justify-start py-2!" asChild>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group relative text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          >
            <LayoutDashboard className="h-4 w-4" />
            User Dashboard
          </Link>
        </Button>*/}
        <Logout
          variant="ghost"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group relative w-full justify-start",
            "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          <LogOutIcon className="h-4 w-4 transition-transform group-hover:scale-105" />
          <span className="tracking-tight">Logout</span>
        </Logout>
      </SidebarFooter>
    </Sidebar>
  );
}
