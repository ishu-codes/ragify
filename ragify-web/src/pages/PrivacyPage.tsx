import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
            <Shield className="size-5" />
          </div>
        </div>

        {/* TODO: replace the section content below with Ragify-specific legal text. */}
        <div className="space-y-10 rounded-2xl border bg-card p-8 sm:p-12">
          <header className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">Privacy policy</h1>
            <p className="text-xs text-muted-foreground">Last updated: April 1, 2026</p>
          </header>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">1. Protocol overview</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              ClubCommit operates as a performance-based charitable distribution engine. This policy outlines how we
              handle identity data and performance logs within our terminal architecture.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">2. Information collection</h2>
            <p className="mb-4 text-sm font-medium text-muted-foreground">
              We ingest the following data points to maintain system integrity:
            </p>
            <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">Authentication meta:</span> Email, name, and verified
                provider IDs.
              </li>
              <li>
                <span className="font-semibold text-foreground">Performance data:</span> Golf scores, course telemetry,
                and date/time logs.
              </li>
              <li>
                <span className="font-semibold text-foreground">Terminal evidence:</span> Base64 encoded scorecard
                images for draw verification (purged within 24h of settlement).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">3. Data retention and purge logic</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We prioritize data weightlessness. Verification evidence (scorecard photos) is held in short-term
              volatile storage and deleted once a distribution cycle is audited. Performance history is maintained only
              to compute your rolling index.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">4. Third-party nodes</h2>
            <p className="border-l-2 border-primary pl-4 text-sm leading-relaxed text-muted-foreground italic">
              Transactions are handled via secure financial gateways. We do not store full credit card metadata on our
              primary clusters.
            </p>
          </section>

          <footer className="border-t pt-6">
            <p className="text-center text-xs text-muted-foreground">
              Secure identity handled via Better-Auth and SOC2 nodes.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
