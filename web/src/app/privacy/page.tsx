import { Shield, ChevronLeft, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild className="gap-2">
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4" /> Back to Home
                        </Link>
                    </Button>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Shield className="h-6 w-6 text-primary" />
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border shadow-sm rounded-2xl p-8 sm:p-12 space-y-10">
                    <header className="space-y-4">
                        <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
                        <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Last Updated: April 1, 2026</p>
                    </header>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold tracking-tight">1. Protocol Overview</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            ClubCommit operates as a performance-based charitable distribution engine. This policy outlines how we handle identity data and performance logs within our terminal architecture.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold tracking-tight">2. Information Collection</h2>
                        <p className="text-muted-foreground leading-relaxed font-medium mb-4">We ingest the following data points to maintain system integrity:</p>
                        <ul className="space-y-3 list-disc pl-5 text-sm text-muted-foreground leading-relaxed">
                            <li><span className="text-foreground font-bold uppercase tracking-tight">Authentication Meta:</span> Email, Name, and verified provider IDs.</li>
                            <li><span className="text-foreground font-bold uppercase tracking-tight">Performance Data:</span> Golf scores, course telemetry, and date/time logs.</li>
                            <li><span className="text-foreground font-bold uppercase tracking-tight">Terminal Evidence:</span> Base64 encoded scorecard images for draw verification (purged within 24h of settlement).</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold tracking-tight">3. Data Retention & Purge Logic</h2>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                            We prioritize data weightlessness. Verification evidence (scorecard photos) is held in short-term volatile storage and deleted once a distribution cycle is audited. Performance history is maintained only to compute your rolling index.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold tracking-tight">4. Third-Party Nodes</h2>
                        <p className="text-muted-foreground leading-relaxed text-sm italic border-l-2 pl-4 border-primary">
                            Transactions are handled via secure financial gateways. We do not store full credit card metadata on our primary clusters.
                        </p>
                    </section>

                    <footer className="pt-8 border-t">
                        <p className="text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">
                            Secure Identity Handled via Better-Auth & SOC2 Nodes.
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
