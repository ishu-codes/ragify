import { Section, SectionHeader } from "./Section";
import { Reveal } from "./Reveal";
import { DashedPanel } from "./DashedPanel";
import { Pill, OutlinePill } from "./Pill";
import { PRICING, PRICING_COPY } from "./sections";
import { Check } from "lucide-react";

export function PlansPricing() {
  return (
    <Section id="pricing" className="bg-muted/20">
      <SectionHeader heading={PRICING_COPY.heading} subhead={PRICING_COPY.subhead} />

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {PRICING.map((plan, index) => (
          <Reveal key={plan.name} delay={index * 80}>
            <DashedPanel
              className={`flex h-full flex-col bg-card p-7 ${
                plan.highlight ? "ring-1 ring-brand/50" : ""
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-foreground">
                  Most popular
                </span>
              )}

              <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="font-mono text-4xl font-semibold tracking-tight tabular-nums">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                )}
              </div>

              <ul className="mt-7 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand-text" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {plan.highlight ? (
                  <Pill asLink to={plan.to} className="w-full justify-center">
                    {plan.cta}
                  </Pill>
                ) : (
                  <OutlinePill asLink to={plan.to} className="w-full justify-center">
                    {plan.cta}
                  </OutlinePill>
                )}
              </div>
            </DashedPanel>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
