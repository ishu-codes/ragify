import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { DashedPanel } from "@/components/marketing/DashedPanel";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Privacy policy — Ragify",
};

export default function PrivacyPage() {
  return (
    <div className="bg-background py-12">
      <div className="container max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href="/">
              <ArrowLeft className="size-4" /> Back to home
            </Link>
          </Button>
          <div className="flex size-10 items-center justify-center bg-brand/10 text-brand-text ring-1 ring-brand/20">
            <Shield className="size-5" />
          </div>
        </div>

        <DashedPanel className="bg-card p-8 sm:p-12">
          <div className="space-y-10">
            <header className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                Privacy policy
              </h1>
              <p className="font-mono text-xs text-muted-foreground">
                Last updated: August 18, 2026
              </p>
            </header>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">
                1. Overview
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Ragify provides grounded answers from your documents through
                isolated workspaces. This policy explains what data we process,
                how it is stored, and the choices you have over it.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">
                2. Information we collect
              </h2>
              <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
                <li>
                  <span className="font-semibold text-foreground">
                    Account data:
                  </span>{" "}
                  Email, name, and authentication credentials required to sign
                  in.
                </li>
                <li>
                  <span className="font-semibold text-foreground">
                    Workspace content:
                  </span>{" "}
                  Documents, code, and metadata you upload into your workspaces.
                </li>
                <li>
                  <span className="font-semibold text-foreground">
                    Usage data:
                  </span>{" "}
                  Queries, chat sessions, and performance metrics used to
                  operate and improve the service.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">
                3. How workspace content is processed
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Uploaded documents are chunked and embedded into vector indexes
                scoped to your workspace namespace. They are used to retrieve
                relevant context and produce cited answers. Your content is not
                used to train public models, and it is never shared with other
                workspaces or customers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">
                4. Retention and deletion
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                You can delete a workspace at any time, which removes its
                documents, vector indexes, and chat history. Account data is
                retained while your account is active and deleted on request.
                Chat sessions created in your browser remain local to your
                device.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">
                5. Third parties
              </h2>
              <p className="border-l-2 border-brand pl-4 text-sm leading-relaxed text-muted-foreground italic">
                Model providers and infrastructure vendors process data only to
                the extent required to deliver the service. Enterprise customers
                with dedicated clusters control their own embedding and model
                configuration.
              </p>
            </section>

            <footer className="border-t pt-6">
              <p className="text-center text-xs text-muted-foreground">
                Questions? Contact privacy@ragify.ai.
              </p>
            </footer>
          </div>
        </DashedPanel>
      </div>
    </div>
  );
}
