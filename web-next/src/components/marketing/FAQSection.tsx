"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DashedPanel } from "./DashedPanel";
import { Reveal } from "./Reveal";
import { Section, SectionHeader } from "./Section";
import { FAQ_COPY, FAQ_ITEMS } from "./sections";

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section className="bg-muted/20">
      <SectionHeader
        heading={FAQ_COPY.heading}
        className="mx-auto text-center"
      />

      <div className="mx-auto mt-14 max-w-3xl space-y-3">
        {FAQ_ITEMS.map((faq, index) => (
          <Reveal key={faq.q} delay={index * 40}>
            <DashedPanel className="bg-card">
              <button
                type="button"
                onClick={() => setOpen(open === index ? null : index)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium transition-colors hover:bg-muted/30 sm:px-6 sm:py-5"
                aria-expanded={open === index}
              >
                {faq.q}
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    open === index && "rotate-180 text-brand-text",
                  )}
                />
              </button>
              {open === index && (
                <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground sm:px-6">
                  {faq.a}
                </div>
              )}
            </DashedPanel>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
