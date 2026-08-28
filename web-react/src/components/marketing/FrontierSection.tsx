import { Section, SectionHeader } from "./Section";
import { Reveal } from "./Reveal";
import { TerminalMockup } from "./TerminalMockup";
import { FRONTIER_COPY } from "./sections";

export function FrontierSection() {
  return (
    <Section id="demo" className="bg-background">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <SectionHeader heading={FRONTIER_COPY.heading} subhead={FRONTIER_COPY.subhead} />
        <Reveal direction="right" delay={120}>
          <TerminalMockup />
        </Reveal>
      </div>
    </Section>
  );
}
