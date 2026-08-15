import { useState } from "react";
import {
  Brain,
  Check,
  Copy,
  FileText,
  LoaderCircle,
  Search,
  SendHorizonalIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SAMPLE_QUERIES = [
  {
    id: "q1",
    label: "Financial summary",
    prompt: "Summarize the revenue growth and operating margin from the Q3 report",
    answer:
      "Based on **Q3_Financial_Report.pdf** (p. 14):\n\n- **Revenue growth** increased 24.8% year over year to $14.2M.\n- **Operating margin** expanded from 18.2% to 22.5%, driven by enterprise subscriptions.\n- **Cash flow** remained positive at $3.8M for the quarter.",
    citations: [
      { doc: "Q3_Financial_Report.pdf", page: "p. 14" },
      { doc: "Executive_Overview.md", page: "Section 3.1" },
    ],
  },
  {
    id: "q2",
    label: "API auth flow",
    prompt: "How does the Bearer token authentication flow work in our backend?",
    answer:
      "According to **api_docs.md** and **auth_service.py**:\n\n1. Client calls `POST /api/v1/auth/login` with credentials.\n2. Auth service returns a JWT access token signed with RSA-256.\n3. Client sends `Authorization: Bearer <token>` on all workspace endpoints.\n4. Middleware validates the token and hydrates the user context.",
    citations: [
      { doc: "api_docs.md", page: "L45-L68" },
      { doc: "auth_service.py", page: "L102-L130" },
    ],
  },
  {
    id: "q3",
    label: "Deploy steps",
    prompt: "What are the helm upgrade deployment commands for staging?",
    answer:
      "Extracted from **deploy_playbook.md**:\n\n```bash\nhelm upgrade --install ragify-cluster ./charts/ragify \\\n  --namespace staging \\\n  --set vectorDb.replicas=3\n```\n\nVerify pod readiness with `kubectl rollout status deployment/ragify-api`.",
    citations: [{ doc: "deploy_playbook.md", page: "L12-L28" }],
  },
];

export function DemoConsole() {
  const [selectedDemo, setSelectedDemo] = useState(SAMPLE_QUERIES[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const runDemoQuery = (queryObj: typeof SAMPLE_QUERIES[0]) => {
    setIsSimulating(true);
    setSelectedDemo(queryObj);
    setCustomPrompt(queryObj.prompt);
    setTimeout(() => {
      setIsSimulating(false);
    }, 650);
  };

  const handleCopyCitation = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="rounded-2xl border bg-card p-2 shadow-[0_32px_80px_-40px] shadow-primary/25">
      <div className="overflow-hidden rounded-xl border bg-background/70">
        <div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Brain className="size-3.5 text-primary" />
            Workspace query
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">Live demo</span>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUERIES.map((q) => (
              <button
                key={q.id}
                onClick={() => runDemoQuery(q)}
                className={cn(
                  "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedDemo.id === q.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {q.label}
              </button>
            ))}
          </div>

          <div className="relative flex items-center gap-2">
            <Search className="absolute left-3.5 size-4 text-muted-foreground" />
            <input
              type="text"
              readOnly
              value={customPrompt || selectedDemo.prompt}
              className="h-10 w-full rounded-xl border bg-card pl-10 pr-2 text-sm font-medium outline-none"
            />
            <Button
              size="sm"
              onClick={() => runDemoQuery(selectedDemo)}
              disabled={isSimulating}
              className="shrink-0 cursor-pointer gap-1.5 rounded-xl px-3.5"
            >
              <SendHorizonalIcon className="size-3.5" />
              {isSimulating ? "Retrieving..." : "Run"}
            </Button>
          </div>

          <div className="min-h-44 rounded-xl border bg-card p-4 sm:p-5">
            {isSimulating ? (
              <div className="flex h-full min-h-36 flex-col items-center justify-center gap-3 text-muted-foreground">
                <LoaderCircle className="size-6 animate-spin text-primary" />
                <p className="text-xs font-medium">Retrieving context from your workspace...</p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between gap-2 border-b pb-2.5">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Brain className="size-3.5 text-primary" />
                    Grounded answer
                  </span>
                </div>

                <div className="markdown-body text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {selectedDemo.answer}
                  </ReactMarkdown>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                  <span className="text-[10px] font-medium text-muted-foreground">Sources</span>
                  {selectedDemo.citations.map((cit, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCopyCitation(`${cit.doc} (${cit.page})`, `${selectedDemo.id}-${idx}`)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/[0.06] px-2 py-1 font-mono text-[10px] text-primary transition-colors hover:bg-primary/10"
                      title="Copy citation reference"
                    >
                      <FileText className="size-3" />
                      <span>{cit.doc}</span>
                      <span className="opacity-60">{cit.page}</span>
                      {copiedId === `${selectedDemo.id}-${idx}` ? (
                        <Check className="size-3 text-emerald-500" />
                      ) : (
                        <Copy className="size-3 opacity-50" />
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
  );
}
