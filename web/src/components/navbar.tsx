import { useState } from "react";
import { Link } from "react-router-dom";

import { useSession } from "@/hooks/useAuthSession";
import { Button } from "@/components/ui/button";
import { Brain, LayoutDashboard, LogOut, Menu, ShieldCheck, XIcon } from "lucide-react";
import { ThemeToggle } from "@/components/navbar/ThemeToggle";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Logout from "@/components/workspaces/Logout";

const NAV_LINKS = [
  { label: "Demo", href: "/#interactive-demo" },
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
];

export function Navbar() {
  const { session, isPending } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Brain className="size-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Ragify</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {isPending ? (
            <div className="h-9 w-20 animate-pulse rounded-xl bg-muted" />
          ) : session ? (
            <Popover>
              <PopoverTrigger>
                <Avatar className="cursor-pointer transition-transform hover:scale-105">
                  <AvatarImage src={session?.user.image ?? ""} alt="profile" />
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {session?.user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-72 rounded-2xl border p-3" align="end">
                <div className="flex items-center gap-3 rounded-xl px-2 py-2">
                  <Avatar className="size-9">
                    <AvatarImage src={session?.user.image ?? ""} alt="profile" />
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {session?.user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold leading-none">{session?.user.name}</p>
                      {session?.user.role === "ADMIN" && (
                        <Badge variant="default" className="rounded-full px-1.5 py-0 text-[9px] font-semibold uppercase">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{session?.user.email}</p>
                  </div>
                </div>

                <div className="mt-1 space-y-1 border-t pt-2">
                  <Button asChild className="h-9 w-full justify-start gap-2 rounded-xl text-xs font-medium">
                    <Link to="/workspaces">
                      <LayoutDashboard className="size-3.5" /> Go to workspaces
                    </Link>
                  </Button>

                  {session?.user.role === "ADMIN" && (
                    <Button asChild variant="outline" className="h-9 w-full justify-start gap-2 rounded-xl text-xs font-medium">
                      <Link to="/admin">
                        <ShieldCheck className="size-3.5 text-primary" /> Admin panel
                      </Link>
                    </Button>
                  )}

                  <Logout
                    variant="ghost"
                    className="h-9 w-full justify-start gap-2 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="size-3.5" /> Log out
                  </Logout>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="rounded-xl text-sm font-medium" asChild>
                <Link to="/sign-in">Sign in</Link>
              </Button>
              <Button size="sm" className="rounded-xl text-sm font-medium shadow-sm" asChild>
                <Link to="/sign-up">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="flex size-9 cursor-pointer items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label="Toggle navigation"
        >
          {isMenuOpen ? <XIcon className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t bg-background/95 px-4 py-5 backdrop-blur-xl animate-in slide-in-from-top duration-200 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-4 space-y-2 border-t pt-4">
            {session ? (
              <>
                <Button asChild className="w-full justify-start gap-2 rounded-xl text-sm font-medium">
                  <Link to="/workspaces" onClick={() => setIsMenuOpen(false)}>
                    <LayoutDashboard className="size-4" /> Go to workspaces
                  </Link>
                </Button>
                {session?.user.role === "ADMIN" && (
                  <Button asChild variant="outline" className="w-full justify-start gap-2 rounded-xl text-sm font-medium">
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                      <ShieldCheck className="size-4 text-primary" /> Admin panel
                    </Link>
                  </Button>
                )}
                <Logout className="w-full justify-start gap-2 rounded-xl text-sm font-medium" variant="outline">
                  <LogOut className="size-4" /> Log out
                </Logout>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" className="rounded-xl text-sm font-medium">
                  <Link to="/sign-in" onClick={() => setIsMenuOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button asChild className="rounded-xl text-sm font-medium">
                  <Link to="/sign-up" onClick={() => setIsMenuOpen(false)}>
                    Get started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
