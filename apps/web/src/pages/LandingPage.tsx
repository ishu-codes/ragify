import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Brain,
  Zap,
  Shield,
  FileText,
  FileCode,
  FileSpreadsheet,
  Layers,
  Database,
  Search,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Cpu,
  Copy,
  Check,
  Play,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";

// Sample interactive RAG queries for live demo
const SAMPLE_QUERIES = [
  {
    id: "q1",
    label: "Q3 Financial Summary",
    prompt: "Summarize the revenue growth and operating margin from Q3 report",
    answer: "Based on **Q3_Financial_Report.pdf** (p. 14):\n\n• **Revenue Growth**: Increased by **24.8% YoY** to $14.2M.\n• **Operating Margin**: Expanded from 18.2% to **22.5%** driven by enterprise workspace subscriptions.\n• **Cash Flow**: Positive net cash flow of $3.8M.",
    citations: [
      { doc: "Q3_Financial_Report.pdf", page: "p. 14", score: 0.98 },
      { doc: "Executive_Overview.md", page: "Section 3.1", score: 0.94 },
    ],
  },
  {
    id: "q2",
    label: "API & Auth Flow",
    prompt: "How does the Bearer token authentication flow work in our backend?",
    answer: "According to **api_docs.md** and **auth_service.py**:\n\n1. Client issues `POST /api/v1/auth/login` with credentials.\n2. Auth service returns JWT `access_token` signed with RSA-256.\n3. Client includes header `Authorization: Bearer <token>` on all `/workspaces` endpoints.\n4. Middleware validates token hydration and extracts `userId` state.",
    citations: [
      { doc: "api_docs.md", page: "L45-L68", score: 0.99 },
      { doc: "auth_service.py", page: "L102-L130", score: 0.96 },
    ],
  },
  {
    id: "q3",
    label: "Kubernetes Deploy Steps",
    prompt: "What are the helm upgrade deployment commands for staging?",
    answer: "Extracted from **deploy_playbook.md**:\n\n```bash\nhelm upgrade --install ragify-cluster ./charts/ragify \\\n  --namespace staging \\\n  --set vectorDb.replicas=3 \\\n  --set api.env=staging\n```\nRun `kubectl rollout status deployment/ragify-api` to verify pod readiness.",
    citations: [
      { doc: "deploy_playbook.md", page: "L12-L28", score: 0.97 },
    ],
  },
];

export default function LandingPage() {
  const [selectedDemo, setSelectedDemo] = useState(SAMPLE_QUERIES[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Handle demo prompt trigger
  const runDemoQuery = (queryObj: typeof SAMPLE_QUERIES[0]) => {
    setIsSimulating(true);
    setSelectedDemo(queryObj);
    setCustomPrompt(queryObj.prompt);
    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  const handleCopyCitation = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-grid-pattern">
          {/* Glowing Background Light Orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
          <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="container relative z-10">
            <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide bg-primary/10 text-primary border border-primary/20 backdrop-blur-md shadow-sm">
                <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
                <span>Next-Gen Neural RAG Engine v2.0</span>
                <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  LIVE
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance leading-[1.1]">
                Turn Raw Documents into <br className="hidden sm:inline" />
                <span className="text-gradient-purple">Instant AI Intelligence.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-xl text-muted-foreground max-w-2xl font-medium leading-relaxed">
                Upload your PDFs, Markdown, JSON, and source code. Query isolated AI workspaces with instant vector retrieval and verifiable source citations.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2 w-full sm:w-auto justify-center">
                <Button size="lg" className="px-8 h-12 text-sm font-bold gap-2 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all cursor-pointer" asChild>
                  <Link to="/sign-up">
                    Start Building Workspaces <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="px-8 h-12 text-sm font-bold rounded-xl border-2 hover:bg-muted/50 cursor-pointer" asChild>
                  <a href="#interactive-demo">
                    <Play className="h-4 w-4 mr-1 text-primary fill-primary" /> Try Live Interactive Demo
                  </a>
                </Button>
              </div>

              {/* Trust Metric Badges */}
              <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Sub-120ms Hybrid Search</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>100% Vector Data Isolation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Multi-Format Ingestion</span>
                </div>
              </div>
            </div>

            {/* INTERACTIVE DEMO SANDBOX WIDGET */}
            <div id="interactive-demo" className="mt-16 max-w-5xl mx-auto">
              <div className="glass-card rounded-3xl border shadow-2xl overflow-hidden backdrop-blur-xl">
                {/* Window Bar Header */}
                <div className="px-6 py-4 border-b bg-muted/40 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5 text-primary" /> Ragify Neural Query Terminal
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                      ● Model: Ragify-Dense-v2
                    </Badge>
                  </div>
                </div>

                {/* Demo Content Grid */}
                <div className="p-6 md:p-8 space-y-6">
                  {/* Sample Query Selectors */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Click a sample prompt to simulate RAG retrieval:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {SAMPLE_QUERIES.map((q) => (
                        <button
                          key={q.id}
                          onClick={() => runDemoQuery(q)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                            selectedDemo.id === q.id
                              ? "bg-primary text-primary-foreground border-primary shadow-md"
                              : "bg-background/80 text-foreground hover:bg-muted border-border"
                          }`}
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Simulation Field */}
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      readOnly
                      value={customPrompt || selectedDemo.prompt}
                      className="w-full pl-11 pr-24 py-3 text-sm font-medium rounded-xl border bg-background/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    />
                    <Button
                      size="sm"
                      onClick={() => runDemoQuery(selectedDemo)}
                      disabled={isSimulating}
                      className="absolute right-2 text-xs font-bold gap-1 rounded-lg cursor-pointer"
                    >
                      <Sparkles className="size-3.5" />
                      {isSimulating ? "Querying..." : "Run Query"}
                    </Button>
                  </div>

                  {/* Live Simulation Output Box */}
                  <div className="rounded-2xl border bg-background/90 p-5 space-y-4 shadow-inner min-h-[160px]">
                    {isSimulating ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-3 text-muted-foreground">
                        <Cpu className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-xs font-semibold animate-pulse">
                          Embedding query vector & retrieving top-k chunks from workspace vector store...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between text-xs text-muted-foreground border-b pb-2">
                          <span className="font-semibold text-primary flex items-center gap-1.5">
                            <Brain className="h-4 w-4" /> AI Answer Response
                          </span>
                          <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded-full">
                            Latency: 114ms
                          </span>
                        </div>

                        <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                          {selectedDemo.answer}
                        </div>

                        {/* Citation Badges */}
                        <div className="pt-2 border-t flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                            Verified Citations:
                          </span>
                          {selectedDemo.citations.map((cit, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleCopyCitation(`${cit.doc} (${cit.page})`, `${selectedDemo.id}-${idx}`)}
                              className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all cursor-pointer"
                              title="Click to copy citation reference"
                            >
                              <FileText className="h-3 w-3" />
                              <span>{cit.doc}</span>
                              <span className="opacity-60">{cit.page}</span>
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                ({(cit.score * 100).toFixed(0)}%)
                              </span>
                              {copiedId === `${selectedDemo.id}-${idx}` ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3 opacity-40 hover:opacity-100" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* METRICS & PERFORMANCE BAND */}
        <section className="py-12 bg-muted/40 border-y">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-1">
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary">&lt; 120ms</p>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Retrieval Latency</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary">99.8%</p>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vector Citation Precision</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary">10M+</p>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Document Chunks Indexed</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary">100%</p>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Workspace Data Privacy</p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE MATRIX SECTION */}
        <section id="features" className="py-24 bg-background">
          <div className="container">
            <div className="flex flex-col items-center text-center space-y-4 mb-16 max-w-2xl mx-auto">
              <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Architectural Capabilities</h2>
              <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                Built for High-Precision Knowledge RAG
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base font-medium">
                Everything you need to transform static enterprise documents into dynamic conversational AI assistants.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Isolated RAG Workspaces",
                  description: "Partition your document collections into distinct knowledge workspaces with dedicated index tables and custom metadata tags.",
                  icon: <Layers className="h-6 w-6 text-primary" />,
                  badge: "Architecture",
                },
                {
                  title: "Multi-Format Parsing",
                  description: "Seamlessly ingest PDFs, Markdown, JSON, Code repositories, and text files. Automatic chunking with smart overlap boundaries.",
                  icon: <FileText className="h-6 w-6 text-primary" />,
                  badge: "Ingestion",
                },
                {
                  title: "Hybrid Neural Search",
                  description: "Combines dense vector embeddings with sparse keyword BM25 search to deliver hyper-accurate responses with zero hallucination.",
                  icon: <Brain className="h-6 w-6 text-primary" />,
                  badge: "Search",
                },
                {
                  title: "Exact Source Citations",
                  description: "Every answer comes with clickable citation pills pointing directly to the exact file path, page number, or code line range.",
                  icon: <Zap className="h-6 w-6 text-primary" />,
                  badge: "Accuracy",
                },
                {
                  title: "Local State & Privacy",
                  description: "Keep your chat sessions persisted securely in browser storage or encrypted backend stores. Your raw data never trains public models.",
                  icon: <Shield className="h-6 w-6 text-primary" />,
                  badge: "Security",
                },
                {
                  title: "REST & API SDK Access",
                  description: "Query your RAG workspaces programmatically via simple REST endpoints and Python/TypeScript SDK integrations.",
                  icon: <Database className="h-6 w-6 text-primary" />,
                  badge: "Developer API",
                },
              ].map((feature, idx) => (
                <Card
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl border bg-background p-6 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-xs font-medium leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 3-STEP PROCESS FLOW */}
        <section id="how-it-works" className="py-24 bg-muted/20 border-y">
          <div className="container">
            <div className="flex flex-col items-center text-center space-y-4 mb-16 max-w-2xl mx-auto">
              <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Simple Workflow</h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">How Ragify Works in 3 Steps</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {[
                {
                  step: "01",
                  title: "Create Workspace",
                  desc: "Initialize a dedicated RAG workspace for your project, team, or research topic.",
                  icon: <Layers className="h-5 w-5 text-primary" />,
                },
                {
                  step: "02",
                  title: "Upload Materials",
                  desc: "Drag & drop files or provide file paths. Ragify automatically chunks and embeds your documents.",
                  icon: <Cpu className="h-5 w-5 text-primary" />,
                },
                {
                  step: "03",
                  title: "Query & Extract Insights",
                  desc: "Ask any question. Get precise AI-generated answers grounded in your exact source documents.",
                  icon: <Sparkles className="h-5 w-5 text-primary" />,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="glass-card rounded-2xl p-8 border relative flex flex-col space-y-4 hover:border-primary/40 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-extrabold font-mono text-gradient-purple">{item.step}</span>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      {item.icon}
                    </div>
                  </div>
                  <h4 className="text-lg font-bold">{item.title}</h4>
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SUPPORTED FORMATS GRID */}
        <section className="py-20 bg-background">
          <div className="container">
            <div className="flex flex-col items-center text-center space-y-3 mb-12">
              <h3 className="text-2xl font-bold tracking-tight">Multi-Format Document Support</h3>
              <p className="text-xs text-muted-foreground font-medium max-w-lg">
                Ragify ingests all your structured and unstructured files seamlessly out of the box.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {[
                { name: "PDF Documents", ext: ".pdf", icon: <FileText className="h-5 w-5 text-rose-500" /> },
                { name: "Markdown", ext: ".md", icon: <FileCode className="h-5 w-5 text-sky-500" /> },
                { name: "TypeScript / JS", ext: ".ts, .tsx", icon: <FileCode className="h-5 w-5 text-blue-500" /> },
                { name: "Python Code", ext: ".py", icon: <FileCode className="h-5 w-5 text-emerald-500" /> },
                { name: "JSON Data", ext: ".json", icon: <FileSpreadsheet className="h-5 w-5 text-amber-500" /> },
                { name: "Plain Text", ext: ".txt", icon: <FileText className="h-5 w-5 text-purple-500" /> },
              ].map((fmt, i) => (
                <div
                  key={i}
                  className="rounded-xl border bg-muted/10 p-4 flex flex-col items-center text-center space-y-2 hover:border-primary/30 hover:bg-muted/30 transition-all"
                >
                  <div className="p-2 rounded-lg bg-background border">{fmt.icon}</div>
                  <span className="text-xs font-bold">{fmt.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{fmt.ext}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="py-24 bg-muted/30 border-y">
          <div className="container">
            <div className="flex flex-col items-center text-center space-y-4 mb-16 max-w-xl mx-auto">
              <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Predictable Pricing</h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Flexible Plans for Individuals & Teams</h3>
              
              {/* Billing Period Toggle */}
              <div className="inline-flex items-center rounded-full p-1 bg-muted border text-xs font-bold mt-2">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                    billingPeriod === "monthly" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  onClick={() => setBillingPeriod("yearly")}
                  className={`px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                    billingPeriod === "yearly" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  Yearly Billing
                  <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full uppercase">Save 20%</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Starter Plan */}
              <Card className="rounded-2xl border bg-background p-6 space-y-6 flex flex-col justify-between shadow-sm">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold">Starter</h4>
                    <p className="text-xs text-muted-foreground">For individuals exploring AI document querying.</p>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold">Free</span>
                  </div>
                  <ul className="space-y-3 pt-2 text-xs font-medium text-muted-foreground">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Up to 3 Workspaces</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 50 MB Total Document Storage</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Standard Neural Search</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Local Browser Chat Persistence</li>
                  </ul>
                </div>
                <Button className="w-full rounded-xl font-bold text-xs" variant="outline" asChild>
                  <Link to="/sign-up">Get Started Free</Link>
                </Button>
              </Card>

              {/* Pro Plan */}
              <Card className="rounded-2xl border-2 border-primary bg-background p-6 space-y-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-bl-lg">
                  Most Popular
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold">Pro Intelligence</h4>
                    <p className="text-xs text-muted-foreground">For professionals managing extensive knowledge bases.</p>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold">{billingPeriod === "monthly" ? "₹ 999" : "₹ 799"}</span>
                    <span className="text-xs text-muted-foreground font-medium ml-1.5">/ month</span>
                  </div>
                  <ul className="space-y-3 pt-2 text-xs font-medium text-foreground">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Unlimited Workspaces</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 10 GB Storage & Hybrid Search</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Code & PDF Citation Highlights</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Export Sessions & History API</li>
                  </ul>
                </div>
                <Button className="w-full rounded-xl font-bold text-xs shadow-md" asChild>
                  <Link to="/sign-up?plan=pro">Initialize Pro Workspace</Link>
                </Button>
              </Card>

              {/* Enterprise Plan */}
              <Card className="rounded-2xl border bg-background p-6 space-y-6 flex flex-col justify-between shadow-sm">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold">Enterprise</h4>
                    <p className="text-xs text-muted-foreground">For organizations requiring dedicated vector clusters.</p>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold">Custom</span>
                  </div>
                  <ul className="space-y-3 pt-2 text-xs font-medium text-muted-foreground">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Dedicated Qdrant / Milvus Cluster</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Custom LLM Embedding Models</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> SOC2 & Air-gapped VPC Deployments</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 24/7 Dedicated Support SLA</li>
                  </ul>
                </div>
                <Button className="w-full rounded-xl font-bold text-xs" variant="outline" asChild>
                  <Link to="/sign-up?plan=enterprise">Contact Architecture Team</Link>
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section className="py-24 bg-background">
          <div className="container max-w-3xl">
            <div className="flex flex-col items-center text-center space-y-3 mb-12">
              <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Clear Answers</h2>
              <h3 className="text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h3>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "What is Retrieval-Augmented Generation (RAG)?",
                  a: "RAG combines vector search retrieval with generative AI. Instead of relying solely on an LLM's pre-trained memory, Ragify first searches your workspace documents for relevant context chunks and provides them to the AI to construct precise, citation-backed responses.",
                },
                {
                  q: "Is my document data private and secure?",
                  a: "Yes. Each workspace operates as an isolated namespace. Your documents are processed into private vector embeddings and stored in secure vector stores. They are never used to train public models.",
                },
                {
                  q: "What file formats can I upload?",
                  a: "Ragify supports PDFs, Markdown (.md), Plain Text (.txt), JSON, TypeScript (.ts, .tsx), Python (.py), and code repositories out of the box.",
                },
                {
                  q: "Can I query multiple documents at the same time?",
                  a: "Absolutely. All materials uploaded to a workspace are indexed together. Ragify automatically retrieves and synthesizes information across multiple files in a single answer.",
                },
              ].map((faq, i) => (
                <div
                  key={i}
                  className="rounded-2xl border bg-card overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-5 text-left font-bold text-sm flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/30"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openFaq === i ? "rotate-180 text-primary" : "text-muted-foreground"}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-200 border-t pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* SLEEK FOOTER */}
      <footer className="bg-zinc-950 text-zinc-400 py-16 border-t border-zinc-900">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div className="space-y-4 max-w-sm">
              <div className="flex items-center space-x-2 text-white">
                <Brain className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold tracking-tight">Ragify</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                The next-generation AI Knowledge Engine. Ground your conversations in verifiable source documents.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-mono text-zinc-400">All Systems Operational</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 text-xs">
              <div className="space-y-3">
                <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Platform</h4>
                <ul className="space-y-2 text-zinc-500">
                  <li><a href="#interactive-demo" className="hover:text-white transition-colors">Live RAG Sandbox</a></li>
                  <li><a href="#features" className="hover:text-white transition-colors">Neural Architecture</a></li>
                  <li><a href="#how-it-works" className="hover:text-white transition-colors">Workflow</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Workspaces</h4>
                <ul className="space-y-2 text-zinc-500">
                  <li><Link to="/workspaces" className="hover:text-white transition-colors">My Workspaces</Link></li>
                  <li><Link to="/sign-in" className="hover:text-white transition-colors">Sign In</Link></li>
                  <li><Link to="/sign-up" className="hover:text-white transition-colors">Create Account</Link></li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Legal & Trust</h4>
                <ul className="space-y-2 text-zinc-500">
                  <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
            <p>© {new Date().getFullYear()} Ragify AI Platform. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Engineered with precision for AI pair programming.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
