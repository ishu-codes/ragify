import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

type SectionProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  id?: string;
  dashed?: boolean;
};

export function Section({ children, className, innerClassName, id, dashed = false }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative border-b border-border py-20 lg:py-28",
        dashed && "dash-top dash-bottom",
        className,
      )}
    >
      <div className={cn("container relative z-10", innerClassName)}>{children}</div>
    </section>
  );
}

type SectionHeaderProps = {
  kicker?: string;
  heading: ReactNode;
  subhead?: ReactNode;
  className?: string;
};

export function SectionHeader({ kicker, heading, subhead, className }: SectionHeaderProps) {
  return (
    <Reveal className={cn("max-w-2xl space-y-4", className)}>
      {kicker ? (
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{kicker}</p>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tighter text-balance sm:text-4xl lg:text-5xl">
        {heading}
      </h2>
      {subhead ? <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{subhead}</p> : null}
    </Reveal>
  );
}
