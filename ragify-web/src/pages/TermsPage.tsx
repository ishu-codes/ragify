import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-background py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="gap-2 rounded-xl">
            <Link to="/">
              <ArrowLeft className="size-4" /> Back to home
            </Link>
          </Button>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/[0.08] text-primary ring-1 ring-primary/10">
            <FileText className="size-5" />
          </div>
        </div>

        {/* TODO: replace the section content below with Ragify-specific legal text. */}
        <div className="space-y-10 rounded-2xl border bg-card p-8 sm:p-12">
          <header className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">Terms of service</h1>
            <p className="text-xs text-muted-foreground">Effective date: April 1, 2026</p>
          </header>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">1. Operational model</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              By accessing the ClubCommit terminal, you agree to engage in our performance-based impact network. Users
              provide performance logs (golf scores) to become eligible for charitable prize distributions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">2. Subscription protocols</h2>
            <div className="space-y-2 rounded-xl border bg-muted/20 p-4">
              <p className="text-sm font-semibold text-foreground">Monthly/annual stake:</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Participation requires an active membership protocol. Your stake supports system maintenance and
                charitable pools. You may disconnect your identity (cancel) at any time through the dashboard.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">3. Distribution eligibility</h2>
            <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>
                Users must log at least <span className="font-semibold text-foreground">5 valid rounds</span> to
                calculate a rolling index.
              </li>
              <li>Verification requires uploading terminal evidence (scorecards) upon draw selection.</li>
              <li>System nodes reserve the right to audit and invalidate fraudulent logs.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">4. Charitable allocation</h2>
            <p className="text-sm leading-relaxed text-muted-foreground italic">
              Allocated prizes are distributed via registered strategic partners. ClubCommit does not take custody of
              funds intended for charitable entities beyond service fees.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">5. Terminal security</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Unauthorized access or attempt to manipulate performance logs via automated bots will result in immediate
              identity purge and eligibility ban.
            </p>
          </section>

          <footer className="border-t pt-6">
            <p className="text-center text-xs text-muted-foreground">ClubCommit operational agreement v1.0</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
