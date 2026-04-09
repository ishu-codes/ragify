import Link from "next/link";
import { Trophy, Heart, Users, ArrowRight, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-background">
          <div className="container relative z-10">
            <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
              <div className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                <Heart className="mr-1.5 h-3 w-3" />
                <span>Impact Protocol Active</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
                Your Game, Their <span className="text-primary">Future.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl font-medium leading-relaxed">
                The elite golf platform where performance translates to impact. Subscribe, compete, and fund vetted
                charities through every round committed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="px-8 h-12 text-sm font-bold gap-2 rounded-lg" asChild>
                  <Link href="/sign-up">
                    Initialize Mission <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="px-8 h-12 text-sm font-bold rounded-lg border-2" asChild>
                  <Link href="#how-it-works">Review Protocol</Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 w-full max-w-2xl border-t mt-12 bg-muted/5 p-8 rounded-xl ring-1 ring-muted">
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold tracking-tight">$1.2M+</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                    Recovered
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold tracking-tight">24k+</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                    Active Nodes
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold tracking-tight">150k+</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                    Logged Data
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold tracking-tight">$500k+</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                    Distributed
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 bg-muted/30 border-y">
          <div className="container">
            <div className="flex flex-col items-center text-center space-y-4 mb-16">
              <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">Operational Framework</h2>
              <p className="text-muted-foreground max-w-xl text-sm font-medium">
                Participating in the mission is streamlined for direct impact.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "ESTABLISH STAKE",
                  desc: "Join the network with a monthly or yearly tier. A minimum of 10% of all platform fees is allocated to strategic partners.",
                  icon: <Trophy className="h-5 w-5 text-primary" />,
                },
                {
                  title: "DATA LOGGING",
                  desc: "Commit your scores after every round played. Our system validates your performance index in real-time.",
                  icon: <Users className="h-5 w-5 text-primary" />,
                },
                {
                  title: "DRAW EXECUTION",
                  desc: "Qualified nodes are entered into verified monthly distributions. Higher performance weights optimize your win probability.",
                  icon: <Heart className="h-5 w-5 text-primary" />,
                },
              ].map((step, i) => (
                <Card
                  key={i}
                  className="border bg-background shadow-sm rounded-lg overflow-hidden group hover:border-primary/30 transition-all"
                >
                  <CardHeader className="pb-2">
                    <div className="mb-4 h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                      {step.icon}
                    </div>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-xs font-medium leading-relaxed">
                    {step.desc}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Charities Section */}
        <section id="charities" className="py-24 bg-background">
          <div className="container">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
              <div className="space-y-4 text-left max-w-2xl">
                <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">Strategic Partners</h2>
                <p className="text-muted-foreground font-medium text-sm">
                  We funnel capital to vetted organizations dedicated to character development through sport.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] font-bold uppercase tracking-widest border h-8 px-4"
              >
                Full Registry <ArrowRight className="h-3.5 w-3.5 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Elite Development",
                  desc: "Building game-changers by providing verified educational protocols.",
                  image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800",
                },
                {
                  name: "Research Front",
                  desc: "Leveraging the network to fund critical medical breakthroughs.",
                  image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800",
                },
                {
                  name: "Heritage Fund",
                  desc: "Providing educational clearance for families of the fallen.",
                  image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800",
                },
              ].map((charity, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-xl bg-muted aspect-video border shadow-sm"
                >
                  <img
                    src={charity.image}
                    alt={charity.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">{charity.name}</h3>
                    <p className="text-white/70 text-[10px] font-medium leading-relaxed line-clamp-2 max-w-[200px]">
                      {charity.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-primary text-primary-foreground border-y">
          <div className="container">
            <div className="flex flex-col items-center text-center space-y-4 mb-16">
              <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">Access Tiers</h2>
              <p className="text-primary-foreground/70 max-w-xl text-sm font-medium">
                Select the commitment level for your impact node.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <Card className="bg-background text-foreground border-none shadow-xl rounded-xl overflow-hidden">
                <CardHeader className="pb-8 border-b bg-muted/5">
                  <CardTitle className="text-lg font-bold uppercase tracking-widest">Standard Entry</CardTitle>
                  <CardDescription className="font-semibold text-[10px] uppercase text-muted-foreground/60">
                    Seasonal Deployment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-8">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold tracking-tight text-foreground/80">&#8377; 999</span>
                    <span className="text-muted-foreground font-bold text-[10px] uppercase ml-1.5 opacity-60">
                      / Month
                    </span>
                  </div>
                  <ul className="space-y-4">
                    {[
                      "Unlimited Score Commitment",
                      "Monthly Prize Eligibility",
                      "Target Specific Impact",
                      "Authenticated Dashboard",
                      "Member Identification",
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-xs font-semibold text-foreground/70 tracking-tight"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full h-12 text-xs font-bold rounded-lg uppercase tracking-widest" asChild>
                    <Link href="/sign-up?plan=monthly">Initialize Monthly</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 text-white border border-white/10 shadow-2xl rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] rounded-bl-lg">
                  Priority Access
                </div>
                <CardHeader className="pb-8 border-b border-white/5 bg-white/5">
                  <CardTitle className="text-lg font-bold uppercase tracking-widest text-white">
                    Full Commitment
                  </CardTitle>
                  <CardDescription className="text-primary font-bold text-[10px] uppercase tracking-widest">
                    Protocol Hero Tier
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-8">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold tracking-tight text-white">&#8377; 9,999</span>
                    <span className="text-zinc-500 font-bold text-[10px] uppercase ml-1.5">/ Year</span>
                  </div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                    Save 20% on Annual Stake
                  </p>
                  <ul className="space-y-4 text-zinc-300">
                    {[
                      "Priority Results Audit",
                      "12 Verification Cycles",
                      "Unique Hero Badge ID",
                      "Advanced Impact Metrics",
                      "First-Class Network Hub",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs font-semibold tracking-tight">
                        <Star className="h-4 w-4 text-primary fill-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full h-12 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest border-none"
                    asChild
                  >
                    <Link href="/sign-up?plan=yearly">Activate annual access</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-zinc-950 text-zinc-500 py-16 border-t border-zinc-900">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-white">
                <Trophy className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold tracking-widest uppercase">ClubCommit</span>
              </div>
              <p className="max-w-xs text-xs font-medium leading-relaxed uppercase tracking-tight">
                The world's first charity-first golf subscription node. Bridging performance and purpose.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div className="space-y-4">
                <h4 className="text-white font-bold uppercase text-[10px] tracking-widest">Protocol</h4>
                <ul className="space-y-2 text-[11px] font-semibold uppercase tracking-tight">
                  <li>
                    <Link href="#how-it-works" className="hover:text-primary transition-colors">
                      How it works
                    </Link>
                  </li>
                  <li>
                    <Link href="#pricing" className="hover:text-primary transition-colors">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/draws" className="hover:text-primary transition-colors">
                      Audit Results
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-bold uppercase text-[10px] tracking-widest">Charity</h4>
                <ul className="space-y-2 text-[11px] font-semibold uppercase tracking-tight">
                  <li>
                    <Link href="#charities" className="hover:text-primary transition-colors">
                      Registry
                    </Link>
                  </li>
                  <li>
                    <Link href="/impact" className="hover:text-primary transition-colors">
                      Our Impact
                    </Link>
                  </li>
                  <li>
                    <Link href="/apply" className="hover:text-primary transition-colors">
                      Apply
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-bold uppercase text-[10px] tracking-widest">Security</h4>
                <ul className="space-y-2 text-[11px] font-semibold uppercase tracking-tight">
                  <li>
                    <Link href="/privacy" className="hover:text-primary transition-colors">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-primary transition-colors">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
            <p>© {new Date().getFullYear()} ClubCommit Unit. ALL RIGHTS RESERVED.</p>
            <p className="opacity-40">
              System verified by{" "}
              <Link
                href="https://github.com/ishu-codes"
                target="_blank"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Ishu
              </Link>
              .
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
