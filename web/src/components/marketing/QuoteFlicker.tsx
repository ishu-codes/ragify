import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function QuoteFlicker({ text, className }: { text: string; className?: string }) {
  const [visibleChars, setVisibleChars] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisibleChars(text.length);
      return;
    }

    let i = 0;
    const interval = window.setInterval(() => {
      i += 1;
      setVisibleChars(i);
      if (i >= text.length) window.clearInterval(interval);
    }, 12);

    return () => window.clearInterval(interval);
  }, [text]);

  return (
    <p className={cn("leading-relaxed", className)}>
      {text.slice(0, visibleChars)}
      {visibleChars < text.length && (
        <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-foreground align-middle" />
      )}
    </p>
  );
}
