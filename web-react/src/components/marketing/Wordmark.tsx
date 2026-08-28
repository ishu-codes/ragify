import { cn } from "@/lib/utils";

type WordmarkProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function Wordmark({ size = "md", className }: WordmarkProps) {
  const heights = { sm: 18, md: 24, lg: 32 };
  const fontSize = { sm: "0.875rem", md: "1.125rem", lg: "1.5rem" };
  const h = heights[size];
  const fs = fontSize[size];

  return (
    <span
      className={cn("inline-flex items-baseline gap-0 font-sans font-semibold tracking-tight text-foreground select-none", className)}
      style={{ height: h, fontSize: fs, lineHeight: 1 }}
      aria-label="Ragify"
    >
      <span className="font-mono text-brand-text">{"//"}</span>
      <span>ragify</span>
    </span>
  );
}
