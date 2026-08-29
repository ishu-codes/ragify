import { DashedPanel } from "./DashedPanel";
import { QuoteFlicker } from "./QuoteFlicker";
import { Reveal } from "./Reveal";
import { Section, SectionHeader } from "./Section";
import { SLOP_COPY } from "./sections";

export function SlopSection() {
  return (
    <Section className="bg-muted/20">
      <SectionHeader
        heading={SLOP_COPY.heading}
        className="mx-auto text-center"
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        {/* Without Ragify */}
        <Reveal direction="left">
          <DashedPanel className="flex h-full flex-col bg-card p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {SLOP_COPY.without.label}
              </span>
              <div className="flex gap-1.5">
                {SLOP_COPY.without.badges.map((b) => (
                  <span
                    key={b}
                    className="rounded-full border border-border bg-muted px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {SLOP_COPY.without.answer}
            </p>
          </DashedPanel>
        </Reveal>

        {/* With Ragify */}
        <Reveal direction="right" delay={100}>
          <DashedPanel className="flex h-full flex-col bg-card p-6 ring-1 ring-brand/30 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-brand-text">
                {SLOP_COPY.with.label}
              </span>
              <div className="flex gap-1.5">
                {SLOP_COPY.with.badges.map((b) => (
                  <span
                    key={b}
                    className="rounded-full border border-brand/30 bg-brand/10 px-2.5 py-0.5 font-mono text-[10px] text-brand-text"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
            <QuoteFlicker
              text={SLOP_COPY.with.answer}
              className="mt-6 text-sm text-foreground sm:text-base"
            />
          </DashedPanel>
        </Reveal>
      </div>
    </Section>
  );
}
