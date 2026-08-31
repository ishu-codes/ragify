"use client";

import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

export function CreditsBadge({
  credits,
  className,
}: {
  credits?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-9 items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 text-xs font-medium text-muted-foreground",
        className,
      )}
      title="Free-tier credits remaining this month"
    >
      <Coins className="size-3.5 text-brand-text" />
      <span
        className={cn(
          "tabular-nums",
          credits === 0 && "font-semibold text-amber-600",
        )}
      >
        {credits ?? "—"}
      </span>
      <span className="hidden sm:inline">credits</span>
    </div>
  );
}
