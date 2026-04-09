import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
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
                        <FileText className="h-6 w-6 text-primary" />
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border shadow-sm rounded-2xl p-8 sm:p-12 space-y-10">
                    <header className="space-y-4">
                        <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>
                        <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Effective Date: April 1, 2026</p>
                    </header>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold tracking-tight">1. Operational Model</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            By accessing the ClubCommit terminal, you agree to engage in our performance-based impact network. Users provide performance logs (golf scores) to become eligible for charitable prize distributions.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold tracking-tight">2. Subscription Protocols</h2>
                        <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
                            <p className="text-sm text-foreground font-bold uppercase tracking-tight">Monthly/Annual Stake:</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Participation requires an active membership protocol. Your stake supports system maintenance and charitable pools. You may disconnect your identity (cancel) at any time through the dashboard.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold tracking-tight">3. Distribution Eligibility</h2>
                        <ul className="space-y-3 list-disc pl-5 text-sm text-muted-foreground leading-relaxed">
                            <li>Users must log at least <span className="text-foreground font-bold">5 valid rounds</span> to calculate a rolling index.</li>
                            <li>Verification requires uploading terminal evidence (scorecards) upon draw selection.</li>
                            <li>System nodes reserve the right to audit and invalidate fraudulent logs.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold tracking-tight">4. Charitable Allocation</h2>
                        <p className="text-muted-foreground leading-relaxed text-sm italic">
                            Allocated prizes are distributed via registered strategic partners. ClubCommit does not take custody of funds intended for charitable entities beyond service fees.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold tracking-tight">5. Terminal Security</h2>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                            Unauthorized access or attempt to manipulate performance logs via automated bots will result in immediate identity purge and eligibility ban.
                        </p>
                    </section>

                    <footer className="pt-8 border-t">
                        <p className="text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">
                            ClubCommit Operational Agreement v1.0
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
