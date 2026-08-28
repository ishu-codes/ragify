import { useEffect } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { useSession } from "@/hooks/useAuthSession";
import { Wordmark } from "@/components/marketing/Wordmark";
import { DashedPanel } from "@/components/marketing/DashedPanel";
import { ThemeToggle } from "@/components/navbar/ThemeToggle";

export default function AuthLayout() {
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session?.user) {
      navigate("/workspaces", { replace: true });
    }
  }, [session, navigate]);

  if (session?.user) return null;

  return (
    <div className="relative flex min-h-dvh flex-col bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <div className="container flex h-[85px] items-center justify-between">
          <Link to="/" aria-label="Ragify home">
            <Wordmark size="lg" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <DashedPanel className="bg-card p-7 sm:p-9">
            <Outlet />
          </DashedPanel>
        </div>
      </main>

      <footer className="border-t border-border bg-background py-6">
        <div className="container flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <Wordmark size="sm" />
          <p>Grounded answers from your documents. Every response cites its source.</p>
        </div>
      </footer>
    </div>
  );
}
