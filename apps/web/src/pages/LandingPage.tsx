import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronDown,
  Database,
  FileCode2,
  FileJson,
  FileSpreadsheet,
  FileStack,
  FileTerminal,
  FileText,
  FileType2,
  Layers,
  MessageSquare,
  Shield,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Reveal } from "@/components/marketing/Reveal";
import { DemoConsole } from "@/components/marketing/DemoConsole";
import { cn } from "@/lib/utils";

const FORMATS = [
  { name: "PDF", icon: FileText },
  { name: "Markdown", icon: FileCode2 },
  { name: "TypeScript", icon: FileType2 },
  { name: "Python", icon: FileTerminal },
  { name: "JSON", icon: FileJson },
  { name: "CSV", icon: FileSpreadsheet },
];

const FEATURES = [
  {
    icon: Layers,
    title: "Isolated RAG workspaces",
    description:
      "Partition document collections into dedicated knowledge namespaces, each with its own index and metadata.",
    wide: true,
    bullets: ["Dedicated vector namespaces", "Custom metadata and tags", "Built for teams and projects"],
  },
  {
    icon: FileText,
    title: "Multi-format parsing",
    description: "Ingest PDFs, Markdown, code, and JSON with automatic chunking at smart boundaries.",
  },
  {
    icon: Brain,
    title: "Hybrid neural search",
    description: "Dense vector retrieval combined with sparse keyword matching for accurate, grounded answers.",
  },
  {
    icon: Zap,
    title: "Exact source citations",
    description: "Every answer links back to the exact file, page, or line range it came from.",
  },
  {
    icon: Shield,
    title: "Private by default",
    description: "Chat sessions stay inside your workspace. Your data is never used to train public models.",
  },
  {
    icon: Database,
    title: "REST and SDK access",
    description: "Query your workspaces programmatically with a simple REST API and client SDKs.",
    wide: true,
    full: true,
  },
];

const STEPS = [
  {
    icon: Layers,
    title: "Create a workspace",
    description: "Spin up an isolated namespace for a project, team, or research topic in one click.",
  },
  {
    icon: FileStack,
    title: "Upload your materials",
    description: "Drag in PDFs, Markdown, code, and JSON. Files are chunked and embedded automatically.",
  },
  {
    icon: MessageSquare,
    title: "Ask, then verify",
    description: "Ask anything. Ragify retrieves the relevant context and cites the exact source for every claim.",
  },
];

const PRICING = [
  {
    name: "Starter",
    description: "For individuals exploring AI document querying.",
    price: "Free",
    features: [
      "Up to 3 workspaces",
      "50 MB total document storage",
      "Standard neural search",
      "Local browser chat persistence",
    ],
    cta: "Get started free",
    href: "/sign-up",
  },
  {
    name: "Pro",
    description: "For professionals managing extensive knowledge bases.",
    monthly: "₹999",
    yearly: "₹799",
    features: [
      "Unlimited workspaces",
      "10 GB storage with hybrid search",
      "Code and PDF citation highlights",
      "Export sessions and history API",
    ],
    cta: "Start with Pro",
    href: "/sign-up?plan=pro",
    highlight: true,
  },
  {
    name: "Enterprise",
    description: "For organizations requiring dedicated vector clusters.",
    price: "Custom",
    features: [
      "Dedicated vector database cluster",
      "Custom embedding models",
      "VPC and air-gapped deployments",
      "24/7 support with SLA",
    ],
    cta: "Contact sales",
    href: "/sign-up?plan=enterprise",
  },
];

const FAQS = [
  {
    q: "What is retrieval-augmented generation (RAG)?",
    a: "RAG combines vector search retrieval with generative AI. Instead of relying only on a model's pre-trained memory, Ragify first searches your workspace documents for relevant context and provides it to the model, producing precise, citation-backed responses.",
  },
  {
    q: "Is my document data private and secure?",
    a: "Yes. Each workspace operates as an isolated namespace. Your documents become private vector embeddings in secure storage and are never used to train public models.",
  },
  {
    q: "What file formats can I upload?",
    a: "Ragify supports PDFs, Markdown, plain text, JSON, TypeScript, Python, CSV, and code repositories out of the box.",
  },
  {
    q: "Can I query multiple documents at the same time?",
    a: "Yes. Everything uploaded to a workspace is indexed together, so Ragify can retrieve and synthesize information across multiple files in a single answer.",
  },
];

export default function LandingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_9%,transparent),transparent_62%)]"
          />
          <div className="container relative">
            <div className="grid items-center gap-14 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
              <div className="space-y-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1 text-xs font-medium text-primary">
                  <Layers className="size-3.5" />
                  Retrieval-augmented AI for your documents
                </div>
                <h1 className="max-w-xl text-4xl leading-[1.05] font-semibold tracking-tighter text-balance sm:text-5xl lg:text-6xl">
                  Turn raw documents into answers you can verify.
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Upload PDFs, Markdown, code, and JSON into isolated workspaces. Ragify retrieves the right context
                  and answers with exact source citations.
                </p>
                <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                  <Button size="lg" className="gap-2 rounded-xl px-7 shadow-sm" asChild>
                    <Link to="/sign-up">
                      Start building free
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-xl px-7" asChild>
                    <a href="#how-it-works">See how it works</a>
                  </Button>
                </div>
              </div>

              <div id="interactive-demo">
                <Reveal delay={120}>
                  <DemoConsole />
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* FORMATS STRIP */}
        <section className="border-y bg-muted/20">
          <div className="container flex flex-wrap items-center justify-center gap-x-10 gap-y-4 py-8">
            <span className="text-xs font-medium text-muted-foreground">Index everything your team works with</span>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {FORMATS.map((format) => (
                <div key={format.name} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <format.icon className="size-4 text-foreground/70" />
                  {format.name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-24 lg:py-32">
          <div className="container">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-3xl font-semibold tracking-tighter text-balance sm:text-4xl">
                Everything you need for grounded answers
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                A complete pipeline from ingestion to retrieval, built so every response is precise and every source
                is verifiable.
              </p>
            </div>

            <div className="mt-14 grid gap-4 lg:grid-cols-3">
              {FEATURES.map((feature, index) => (
                <Reveal
                  key={feature.title}
                  delay={index * 60}
                  className={cn(feature.wide && "lg:col-span-2", feature.full && "lg:col-span-3")}
                >
                  <div className="group flex h-full flex-col rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_24px_64px_-36px] hover:shadow-primary/20">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/[0.08] text-primary ring-1 ring-primary/10">
                      <feature.icon className="size-5" />
                    </div>
                    <h3 className="mt-5 text-base font-semibold tracking-tight">{feature.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>

                    {feature.bullets ? (
                      <ul className="mt-5 space-y-2">
                        {feature.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {feature.full ? (
                      <div className="mt-5 rounded-xl border bg-muted/30 p-4 font-mono text-xs leading-relaxed">
                        <p>
                          <span className="text-muted-foreground">POST</span> /api/v1/workspaces/&#123;id&#125;/query
                        </p>
                        <p className="mt-2 text-muted-foreground">Authorization: Bearer &#123;token&#125;</p>
                        <p className="mt-2 text-muted-foreground">
                          &#123; "query": "Summarize Q3 results", "top_k": 5 &#125;
                        </p>
                      </div>
                    ) : null}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="border-y bg-muted/20 py-24 lg:py-32">
          <div className="container">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-3xl font-semibold tracking-tighter text-balance sm:text-4xl">
                From files to answers in three steps
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                No pipelines to wire up. Ragify handles chunking, embedding, and retrieval for you.
              </p>
            </div>

            <div className="mt-14 grid gap-10 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <Reveal key={step.title} delay={index * 90}>
                  <div className="flex h-full flex-col">
                    <div className="flex size-10 items-center justify-center rounded-xl border bg-card text-primary shadow-sm">
                      <step.icon className="size-5" />
                    </div>
                    <h3 className="mt-5 text-base font-semibold tracking-tight">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="py-24 lg:py-32">
          <div className="container">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl space-y-4">
                <h2 className="text-3xl font-semibold tracking-tighter text-balance sm:text-4xl">
                  Simple pricing that scales with your knowledge
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Start free, upgrade when your team needs more. Every plan includes grounded citations.
                </p>
              </div>

              <div className="inline-flex items-center rounded-full border bg-card p-1 text-xs font-medium shadow-sm">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={cn(
                    "cursor-pointer rounded-full px-4 py-1.5 transition-colors",
                    billingPeriod === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod("yearly")}
                  className={cn(
                    "cursor-pointer rounded-full px-4 py-1.5 transition-colors",
                    billingPeriod === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  Yearly
                  <span className="ml-1.5 text-[10px] font-semibold opacity-80">2 months free</span>
                </button>
              </div>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {PRICING.map((plan) => {
                const price =
                  plan.price ??
                  (billingPeriod === "monthly" ? plan.monthly : plan.yearly);

                return (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative flex flex-col rounded-2xl border bg-card p-7",
                      plan.highlight
                        ? "border-primary/50 shadow-[0_32px_80px_-44px] shadow-primary/30"
                        : "shadow-sm",
                    )}
                  >
                    {plan.highlight ? (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground">
                        Most popular
                      </span>
                    ) : null}

                    <h3 className="text-base font-semibold tracking-tight">{plan.name}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{plan.description}</p>

                    <div className="mt-6 flex items-baseline gap-1.5">
                      <span className="text-4xl font-semibold tracking-tight">{price}</span>
                      {plan.monthly ? <span className="text-xs text-muted-foreground">/ month</span> : null}
                    </div>

                    <ul className="mt-7 flex-1 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      className={cn("mt-8 w-full rounded-xl", plan.highlight && "shadow-sm")}
                      variant={plan.highlight ? "default" : "outline"}
                    >
                      <Link to={plan.href}>{plan.cta}</Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t bg-muted/20 py-24 lg:py-32">
          <div className="container max-w-3xl">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-3xl font-semibold tracking-tighter text-balance sm:text-4xl">
                Frequently asked questions
              </h2>
            </div>

            <div className="mt-10 space-y-3">
              {FAQS.map((faq, index) => (
                <div key={faq.q} className="overflow-hidden rounded-2xl border bg-card">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left text-sm font-medium transition-colors hover:bg-muted/30"
                  >
                    {faq.q}
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform",
                        openFaq === index && "rotate-180 text-primary",
                      )}
                    />
                  </button>
                  {openFaq === index ? (
                    <div className="animate-in fade-in border-t px-5 py-4 text-sm leading-relaxed text-muted-foreground duration-200">
                      {faq.a}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BAND */}
        <section className="py-24 lg:py-28">
          <div className="container">
            <div className="relative overflow-hidden rounded-2xl border bg-card px-6 py-16 text-center sm:px-12 lg:py-20">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_60%)]"
              />
              <div className="relative mx-auto max-w-xl space-y-5">
                <h2 className="text-3xl font-semibold tracking-tighter text-balance sm:text-4xl">
                  Start building your knowledge base today
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Free to start. No credit card required. Your first workspace is ready in under a minute.
                </p>
                <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
                  <Button size="lg" className="gap-2 rounded-xl px-8 shadow-sm" asChild>
                    <Link to="/sign-up">
                      Create your workspace
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-xl px-8" asChild>
                    <Link to="/sign-in">Sign in</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t bg-muted/20">
        <div className="container py-14">
          <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div className="max-w-xs space-y-4">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Brain className="size-4" />
                </div>
                <span className="text-lg font-semibold tracking-tight">Ragify</span>
              </Link>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Grounded AI answers for your documents, code, and data. Every response cites its source.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold tracking-wide text-foreground">Product</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="/#interactive-demo" className="transition-colors hover:text-foreground">Demo</a></li>
                <li><a href="/#features" className="transition-colors hover:text-foreground">Features</a></li>
                <li><a href="/#how-it-works" className="transition-colors hover:text-foreground">How it works</a></li>
                <li><a href="/#pricing" className="transition-colors hover:text-foreground">Pricing</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold tracking-wide text-foreground">Account</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link to="/workspaces" className="transition-colors hover:text-foreground">My workspaces</Link></li>
                <li><Link to="/sign-in" className="transition-colors hover:text-foreground">Sign in</Link></li>
                <li><Link to="/sign-up" className="transition-colors hover:text-foreground">Create account</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold tracking-wide text-foreground">Legal</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="transition-colors hover:text-foreground">Privacy policy</Link></li>
                <li><Link to="/terms" className="transition-colors hover:text-foreground">Terms of service</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} Ragify. All rights reserved.</p>
            <p>Built for grounded, verifiable AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
