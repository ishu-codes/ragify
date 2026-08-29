export type ChangelogEntry = {
  version: string;
  title: string;
  date: string;
  type: "feature" | "fix" | "breaking";
};

export const ANNOUNCEMENT_STRIP = {
  left: "Ragify is in private beta — request access.",
  right: [
    { label: "Citations per answer", value: "5–10" },
    { label: "Hybrid retrieval", value: "BM25 + dense" },
    { label: "Local-first chat", value: "browser-persisted" },
  ],
};

export const HERO_COPY = {
  kicker: "//the frontier RAG agent.",
  headline1: "Grounded answers,",
  headline2: "not hallucinations.",
  subhead:
    "Upload PDFs, Markdown, code, and JSON into isolated workspaces. Ragify retrieves the right context and answers with exact source citations.",
  primary: { label: "npm i @ragify/cli", to: "/sign-up" },
  secondary: { label: "Read the docs", href: "#features" },
};

export const FRONTIER_COPY = {
  heading: "//the frontier RAG agent.",
  subhead:
    "Stop uploading documents to a model that forgets them. Ragify indexes your workspace once, retrieves the right context every time, and cites every claim.",
};

export const SLOP_COPY = {
  heading: "//stop patching AI hallucinations.",
  without: {
    label: "Without Ragify",
    answer:
      "Based on the documents provided, the policy applies to all employees. Specific eligibility criteria may vary by role.",
    badges: ["no citations", "no source", "no trace"],
  },
  with: {
    label: "With Ragify",
    answer:
      "The remote-work policy applies to full-time employees [policy.pdf:page 3]. Contractors follow a separate schedule [handbook.md:section 2.1].",
    badges: ["3 citations", "2 sources", "verified"],
  },
};

export const EXPLAINER_COPY = {
  heading: "Hello, Ragify.",
  subhead:
    "The retrieval engine that grounds every LLM answer in your workspace.",
  items: [
    {
      num: "01",
      title: "Isolated workspaces",
      command: "npx ragify workspace create",
      description:
        "Partition documents into dedicated namespaces with their own index and metadata.",
    },
    {
      num: "02",
      title: "Multi-format ingestion",
      command: "ragify upload docs/",
      description:
        "PDFs, Markdown, TypeScript, Python, JSON, CSV — chunked and embedded automatically.",
    },
    {
      num: "03",
      title: "Hybrid dense + sparse retrieval",
      command: "ragify search --hybrid",
      description: "BM25 + vector recall, re-ranked for precision.",
    },
    {
      num: "04",
      title: "Exact source citations",
      command: "ragify query --cite",
      description: "Every claim links back to file, page, or line range.",
    },
    {
      num: "05",
      title: "Streaming chat, local-first",
      command: "ragify chat",
      description:
        "Sessions persist in your browser. Cancel mid-stream with one click.",
    },
    {
      num: "06",
      title: "REST + Python / Java / TypeScript SDKs",
      command: "npm i @ragify/sdk",
      description: "Query your workspaces programmatically from any stack.",
    },
    {
      num: "07",
      title: "Private by default",
      command: "ragify --offline",
      description: "Your documents are never used to train public models.",
    },
  ],
};

export const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "For individuals exploring grounded AI.",
    features: [
      "Up to 3 workspaces",
      "50 MB total document storage",
      "Standard neural search",
      "Local browser chat persistence",
    ],
    cta: "Start free",
    to: "/sign-up",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/ mo",
    description: "For professionals managing deep knowledge bases.",
    features: [
      "Unlimited workspaces",
      "10 GB storage with hybrid search",
      "Code and PDF citation highlights",
      "Export sessions and history API",
    ],
    cta: "Start with Pro",
    to: "/sign-up?plan=pro",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For organizations with dedicated vector clusters.",
    features: [
      "Dedicated vector database cluster",
      "Custom embedding models",
      "VPC and air-gapped deployments",
      "24/7 support with SLA",
    ],
    cta: "Contact sales",
    to: "/sign-up?plan=enterprise",
    highlight: false,
  },
];

export const PRICING_COPY = {
  heading: "Plans for every team.",
  subhead:
    "Start free. Upgrade when your team needs more. Every plan includes grounded citations.",
};

export const VALUE_PROPS = [
  { label: "Citations per answer", value: "5–10" },
  { label: "Sources per workspace", value: "1k+" },
  { label: "Latency p50", value: "<1.2s" },
];

export const VALUE_STACK_COPY = {
  heading: "//take command of your knowledge.",
};

export const FAQ_ITEMS = [
  {
    q: "How is Ragify different from uploading PDFs to ChatGPT?",
    a: "Ragify indexes your documents once into isolated workspaces and retrieves the exact passages needed for each answer. You get persistent workspaces, exact citations, and the ability to query thousands of pages without re-uploading.",
  },
  {
    q: "What does 'grounded' actually mean?",
    a: "Every claim in a Ragify answer is linked back to the exact file, page, or line range it came from. If the retrieval step finds no relevant context, Ragify says so instead of inventing an answer.",
  },
  {
    q: "Which file formats are supported?",
    a: "PDFs, Markdown, plain text, JSON, TypeScript, Python, CSV, and code repositories out of the box.",
  },
  {
    q: "Is my data private? Is it used for training?",
    a: "Your documents are stored as private vector embeddings inside your workspace namespace. They are never used to train public models.",
  },
  {
    q: "How do citations work?",
    a: "Ragify retrieves the most relevant chunks before generating an answer, then links each sentence back to its source chunk. You can click any citation to open the original file at the exact location.",
  },
  {
    q: "Do I need my own LLM API key?",
    a: "Ragify ships with built-in model access. Bring-your-own-key is supported for enterprise deployments.",
  },
  {
    q: "Can I query multiple workspaces at once?",
    a: "Yes. A query can fan out across any workspaces you have access to, and the answer merges citations from all of them.",
  },
];

export const FAQ_COPY = {
  heading: "Questions, answered.",
};

export const LATEST_FEED: ChangelogEntry[] = [
  {
    version: "v0.9",
    title: "Hybrid BM25 + dense retrieval",
    date: "2026-08-12",
    type: "feature",
  },
  {
    version: "v0.8",
    title: "Workspace templates",
    date: "2026-08-05",
    type: "feature",
  },
  {
    version: "v0.7",
    title: "Java SDK alpha",
    date: "2026-07-28",
    type: "feature",
  },
  {
    version: "v0.6",
    title: "Per-workspace citation export",
    date: "2026-07-20",
    type: "feature",
  },
];

export const LATEST_FEED_COPY = {
  heading: "Latest from Ragify.",
  subhead: "Recent releases and improvements.",
};

export const SECONDARY_CTA = {
  heading: "Ready to ground your answers?",
  subhead:
    "Start your first workspace in under a minute. No credit card required.",
  primary: { label: "Get started", to: "/sign-up" },
  secondary: { label: "Sign in", to: "/sign-in" },
};

export const FOOTER_COPY = {
  tagline:
    "Grounded AI answers for your documents, code, and data. Every response cites its source.",
};

export const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Demo", href: "/#demo" },
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Changelog", href: "/#changelog" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Docs", href: "#" },
      { label: "Python SDK", href: "#" },
      { label: "Java SDK", href: "#" },
      { label: "TypeScript SDK", href: "#" },
      { label: "API Reference", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Brand", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
];

export const FOOTER_LEGAL = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export const TERMINAL_DEMO = {
  command: "curl -X POST https://api.ragify.ai/v1/workspaces/demo/query",
  body: `{ "query": "What changed in the remote-work policy?", "top_k": 5 }`,
  response: `{
  "answer": "Full-time employees may work remotely up to 3 days/week [policy.pdf:page 3]. Contractors follow a separate schedule [handbook.md:section 2.1].",
  "citations": [
    { "source": "policy.pdf", "page": 3 },
    { "source": "handbook.md", "section": "2.1" }
  ]
}`,
};
