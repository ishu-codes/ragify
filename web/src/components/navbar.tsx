"use client";

import { useState } from "react";
import Link from "next/link";

import { useSession } from "@/hooks/useAuthSession";
import { Button } from "@/components/ui/button";
import { GraduationCapIcon, LogOut, LayoutDashboard, Menu, XIcon } from "lucide-react";
// import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/navbar/ThemeToggle";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Logout from "@/components/workspaces/Logout";

export function Navbar() {
  const { session, isPending } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <GraduationCapIcon className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">Ragify</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/#how-it-works" className="transition-colors hover:text-primary">
            How it Works
          </Link>
          <Link href="/#charities" className="transition-colors hover:text-primary">
            Charities
          </Link>
          <Link href="/#pricing" className="transition-colors hover:text-primary">
            Pricing
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {isPending ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          ) : session ? (
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="cursor-pointer transition-opacity hover:opacity-80">
                  <AvatarImage src={session?.user.image ?? ""} alt="profile" />
                  <AvatarFallback className="font-semibold">{session?.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-80 rounded-xl p-6 shadow-xl border-border/50" align="end">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={session?.user.image ?? ""} alt="profile" />
                      <AvatarFallback className="text-base font-semibold">
                        {session?.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm font-semibold leading-none mb-1">{session?.user.name}</h3>
                      <p className="text-xs text-muted-foreground leading-none">{session?.user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild className="h-9 text-xs">
                      <Link href={"/workspaces"}>Workspaces</Link>
                    </Button>
                    <Logout
                      variant="outline"
                      className="h-9 text-xs text-destructive hover:bg-destructive/5 hover:text-destructive"
                    >
                      Logout
                    </Logout>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Link href="/sign-in">
              <Button size="lg">Sign In</Button>
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <XIcon /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-4 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col space-y-3">
            <Link href="/#how-it-works" className="text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
              How it Works
            </Link>
            <Link href="/#charities" className="text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
              Charities
            </Link>
            <Link href="/#pricing" className="text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
              Pricing
            </Link>
          </nav>
          <div className="flex flex-col space-y-2 pt-2 border-t">
            {session ? (
              <>
                <Link href="/workspaces" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full justify-start gap-2" variant="ghost">
                    <LayoutDashboard className="h-4 w-4" />
                    Workspaces
                  </Button>
                </Link>
                <Logout className="w-full justify-start gap-2" variant="outline">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Logout>
              </>
            ) : (
              <>
                <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full" variant="ghost">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Join Now</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
