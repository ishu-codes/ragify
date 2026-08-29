import { DashedPanel } from "./DashedPanel";
import { Reveal } from "./Reveal";
import { Section, SectionHeader } from "./Section";
import { EXPLAINER_COPY } from "./sections";

export function RagifyExplainer() {
  return (
    <Section id="features" className="bg-background">
      <SectionHeader
        heading={EXPLAINER_COPY.heading}
        subhead={EXPLAINER_COPY.subhead}
      />

      <div className="mt-14 grid gap-0">
        {EXPLAINER_COPY.items.map((item, index) => (
          <Reveal key={item.num} delay={index * 60}>
            <DashedPanel className="group flex flex-col gap-4 bg-card p-6 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <div className="flex items-start gap-5 sm:items-center">
                <span className="font-mono text-sm font-semibold text-brand-text">
                  {item.num}
                </span>
                <div>
                  <h3 className="text-base font-semibold tracking-tight sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
              <code className="font-mono text-xs text-muted-foreground/80 sm:text-sm">
                {item.command}
              </code>
            </DashedPanel>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
