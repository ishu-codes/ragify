import { useState } from "react";
import { Link } from "react-router-dom";

import { useSession } from "@/hooks/useAuthSession";
import { Button } from "@/components/ui/button";
import { Brain, LogOut, LayoutDashboard, Menu, XIcon, ShieldCheck, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/navbar/ThemeToggle";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Logout from "@/components/workspaces/Logout";

export function Navbar() {
  const { session, isPending } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass-nav backdrop-blur-md transition-all">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">Ragify</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <a href="/#interactive-demo" className="transition-colors hover:text-foreground hover:text-primary flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Live Demo
          </a>
          <a href="/#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="/#how-it-works" className="transition-colors hover:text-foreground">
            How it Works
          </a>
          <a href="/#pricing" className="transition-colors hover:text-foreground">
            Pricing
          </a>
        </nav>

        {/* Action Controls & User Popover */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {isPending ? (
            <div className="h-9 w-20 animate-pulse rounded-xl bg-muted" />
          ) : session ? (
            <Popover>
              <PopoverTrigger>
                <Avatar className="cursor-pointer transition-transform hover:scale-105 border-2 border-primary/20">
                  <AvatarImage src={session?.user.image ?? ""} alt="profile" />
                  <AvatarFallback className="font-bold text-xs bg-primary/10 text-primary">
                    {session?.user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-80 rounded-2xl p-5 shadow-2xl border-border/60" align="end">
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-primary/20">
                      <AvatarImage src={session?.user.image ?? ""} alt="profile" />
                      <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                        {session?.user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold truncate leading-none">{session?.user.name}</h3>
                        {session?.user.role === "ADMIN" && (
                          <Badge variant="default" className="text-[9px] px-1.5 py-0 font-bold bg-primary uppercase">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate leading-none mt-1">{session?.user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-2 border-t">
                    <Button asChild className="h-9 text-xs font-bold rounded-xl justify-start gap-2">
                      <Link to="/workspaces">
                        <LayoutDashboard className="h-4 w-4" /> Go to Workspaces
                      </Link>
                    </Button>

                    {session?.user.role === "ADMIN" && (
                      <Button asChild variant="outline" className="h-9 text-xs font-bold rounded-xl justify-start gap-2">
                        <Link to="/admin">
                          <ShieldCheck className="h-4 w-4 text-primary" /> Admin Panel
                        </Link>
                      </Button>
                    )}

                    <Logout
                      variant="ghost"
                      className="h-9 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive justify-start gap-2 rounded-xl"
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </Logout>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="font-bold text-xs rounded-xl" asChild>
                <Link to="/sign-in">Sign In</Link>
              </Button>
              <Button size="sm" className="font-bold text-xs rounded-xl shadow-md shadow-primary/20" asChild>
                <Link to="/sign-up">Get Started</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <XIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-xl px-4 py-5 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
            <a
              href="/#interactive-demo"
              className="hover:text-primary transition-colors flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Sparkles className="h-4 w-4 text-primary" /> Live Demo
            </a>
            <a href="/#features" className="hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
              Features
            </a>
            <a href="/#how-it-works" className="hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
              How it Works
            </a>
            <a href="/#pricing" className="hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
              Pricing
            </a>
          </nav>
          <div className="flex flex-col space-y-2 pt-3 border-t">
            {session ? (
              <>
                <Link to="/workspaces" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full justify-start gap-2 rounded-xl text-xs font-bold">
                    <LayoutDashboard className="h-4 w-4" /> Workspaces Dashboard
                  </Button>
                </Link>
                {session?.user.role === "ADMIN" && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full justify-start gap-2 rounded-xl text-xs font-bold" variant="outline">
                      <ShieldCheck className="h-4 w-4 text-primary" /> Admin Panel
                    </Button>
                  </Link>
                )}
                <Logout className="w-full justify-start gap-2 rounded-xl text-xs font-semibold" variant="outline">
                  <LogOut className="h-4 w-4" /> Sign Out
                </Logout>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/sign-in" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full rounded-xl text-xs font-bold" variant="outline">
                    Sign In
                  </Button>
                </Link>
                <Link to="/sign-up" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full rounded-xl text-xs font-bold">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
