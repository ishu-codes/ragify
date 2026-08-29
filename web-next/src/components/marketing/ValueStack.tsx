import { DashedPanel } from "./DashedPanel";
import { Reveal } from "./Reveal";
import { Section, SectionHeader } from "./Section";
import { VALUE_PROPS, VALUE_STACK_COPY } from "./sections";

export function ValueStack() {
  return (
    <Section className="bg-background">
      <SectionHeader heading={VALUE_STACK_COPY.heading} />

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {VALUE_PROPS.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 80}>
            <DashedPanel className="flex flex-col items-center bg-card p-8 text-center">
              <span className="font-mono text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                {stat.value}
              </span>
              <span className="mt-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </span>
            </DashedPanel>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
