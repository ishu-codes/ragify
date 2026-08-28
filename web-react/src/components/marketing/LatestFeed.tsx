import { Section, SectionHeader } from "./Section";
import { Reveal } from "./Reveal";
import { DashedPanel } from "./DashedPanel";
import { LATEST_FEED, LATEST_FEED_COPY } from "./sections";
import { cn } from "@/lib/utils";

const typeColor: Record<string, string> = {
  feature: "border-brand/30 bg-brand/10 text-brand-text",
  fix: "border-warning/30 bg-warning/10 text-warning",
  breaking: "border-destructive/30 bg-destructive/10 text-destructive",
};

export function LatestFeed() {
  return (
    <Section id="changelog" className="bg-background">
      <SectionHeader heading={LATEST_FEED_COPY.heading} subhead={LATEST_FEED_COPY.subhead} />

      <div className="mt-14 space-y-3">
        {LATEST_FEED.map((entry, index) => (
          <Reveal key={entry.version} delay={index * 50}>
            <DashedPanel className="flex flex-col gap-3 bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center gap-4">
                <span className="rounded-full border border-border bg-muted px-3 py-1 font-mono text-xs font-semibold text-foreground">
                  {entry.version}
                </span>
                <span className="text-sm font-medium text-foreground sm:text-base">{entry.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground">{entry.date}</span>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest",
                    typeColor[entry.type],
                  )}
                >
                  {entry.type}
                </span>
              </div>
            </DashedPanel>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
