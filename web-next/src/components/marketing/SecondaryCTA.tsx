"use client";

import { DashedPanel } from "./DashedPanel";
import { NoiseOverlay } from "./NoiseOverlay";
import { OutlinePill, Pill } from "./Pill";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { SECONDARY_CTA } from "./sections";

export function SecondaryCTA() {
  return (
    <Section className="bg-muted/20">
      <Reveal>
        <DashedPanel className="relative overflow-hidden bg-card px-6 py-16 text-center sm:px-12 lg:py-24">
          <NoiseOverlay />
          <div className="relative z-10 mx-auto max-w-xl space-y-5">
            <h2 className="text-3xl font-semibold tracking-tighter text-balance sm:text-4xl lg:text-5xl">
              {SECONDARY_CTA.heading}
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              {SECONDARY_CTA.subhead}
            </p>
            <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
              <Pill asLink to={SECONDARY_CTA.primary.to}>
                {SECONDARY_CTA.primary.label}
              </Pill>
              <OutlinePill asLink to={SECONDARY_CTA.secondary.to}>
                {SECONDARY_CTA.secondary.label}
              </OutlinePill>
            </div>
          </div>
        </DashedPanel>
      </Reveal>
    </Section>
  );
}
