"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TERMINAL_DEMO } from "./sections";

export function TerminalMockup({ className }: { className?: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(2);
      return;
    }

    const timers: number[] = [];
    timers.push(window.setTimeout(() => setStep(1), 600));
    timers.push(window.setTimeout(() => setStep(2), 1800));

    return () => {
      for (const t of timers) {
        window.clearTimeout(t);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-border bg-card font-mono text-xs sm:text-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-muted-foreground">terminal</span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="text-muted-foreground">
          <span className="text-brand-text">$</span> {TERMINAL_DEMO.command}
        </div>
        <div className="mt-1 text-muted-foreground/80">
          {TERMINAL_DEMO.body}
        </div>

        <div
          className={cn(
            "mt-4 transition-opacity duration-500",
            step >= 1 ? "opacity-100" : "opacity-0",
          )}
        >
          <span className="text-muted-foreground">{"//"} [Thinking]</span>
        </div>

        <pre
          className={cn(
            "mt-2 overflow-x-auto whitespace-pre-wrap text-foreground transition-opacity duration-700",
            step >= 2 ? "opacity-100" : "opacity-0",
          )}
        >
          {TERMINAL_DEMO.response}
        </pre>
      </div>
    </div>
  );
}
