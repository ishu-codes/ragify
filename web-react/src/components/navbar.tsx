import { useState } from "react";
import { Link } from "react-router-dom";

import { useSession } from "@/hooks/useAuthSession";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut, Menu, ShieldCheck, XIcon } from "lucide-react";
import { ThemeToggle } from "@/components/navbar/ThemeToggle";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Logout from "@/components/workspaces/Logout";
import { Wordmark } from "@/components/marketing/Wordmark";
import { Pill } from "@/components/marketing/Pill";

const NAV_LINKS = [
  { label: "Docs", href: "#" },
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Demo", href: "/#demo" },
  { label: "Blog", href: "#" },
];

export function Navbar() {
  const { session, isPending } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border bg-background">
      <div className="container flex h-[85px] items-center justify-between">
        <Link to="/" aria-label="Ragify home">
          <Wordmark size="lg" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground/80 transition-colors duration-300 hover:bg-foreground hover:text-background"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          {isPending ? (
            <div className="h-10 w-24 animate-pulse rounded-full bg-muted" />
          ) : session ? (
            <Popover>
              <PopoverTrigger>
                <Avatar className="cursor-pointer transition-transform hover:scale-105">
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
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold leading-none">{session?.user.name}</p>
                      {session?.user.role === "ADMIN" && (
                        <Badge
                          variant="default"
                          className="rounded-full px-1.5 py-0 text-[9px] font-semibold uppercase"
                        >
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{session?.user.email}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Button asChild variant="outline" className="h-9 w-full justify-start gap-2 text-xs font-medium">
                    <Link to="/workspaces">
                      <LayoutDashboard className="size-3.5" /> Go to workspaces
                    </Link>
                  </Button>

                  {session?.user.role === "ADMIN" && (
                    <Button asChild variant="outline" className="h-9 w-full justify-start gap-2 text-xs font-medium">
                      <Link to="/admin">
                        <ShieldCheck className="size-3.5 text-brand-text" /> Admin panel
                      </Link>
                    </Button>
                  )}

                  <Logout
                    variant="outline"
                    className="h-9 w-full justify-start gap-2 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="size-3.5" /> Log out
                  </Logout>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Pill asLink to="/sign-up">
              Get started
            </Pill>
          )}
        </div>

        <button
          className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label="Toggle navigation"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <XIcon className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-5 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-4 space-y-2 border-t border-border pt-4">
            {session ? (
              <>
                <Button asChild className="w-full justify-start gap-2 text-sm font-medium">
                  <Link to="/workspaces" onClick={() => setIsMenuOpen(false)}>
                    <LayoutDashboard className="size-4" /> Go to workspaces
                  </Link>
                </Button>
                {session?.user.role === "ADMIN" && (
                  <Button asChild variant="outline" className="w-full justify-start gap-2 text-sm font-medium">
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                      <ShieldCheck className="size-4 text-brand-text" /> Admin panel
                    </Link>
                  </Button>
                )}
                <Logout className="w-full justify-start gap-2 text-sm font-medium" variant="outline">
                  <LogOut className="size-4" /> Log out
                </Logout>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" className="text-sm font-medium">
                  <Link to="/sign-in" onClick={() => setIsMenuOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Pill asLink to="/sign-up" className="w-full justify-center">
                  Get started
                </Pill>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
