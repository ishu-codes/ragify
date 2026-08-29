import { FAQSection } from "@/components/marketing/FAQSection";
import { FrontierSection } from "@/components/marketing/FrontierSection";
import { Hero } from "@/components/marketing/Hero";
import { LatestFeed } from "@/components/marketing/LatestFeed";
import { PlansPricing } from "@/components/marketing/PlansPricing";
import { RagifyExplainer } from "@/components/marketing/RagifyExplainer";
import { SecondaryCTA } from "@/components/marketing/SecondaryCTA";
import { SlopSection } from "@/components/marketing/SlopSection";
import { ValueStack } from "@/components/marketing/ValueStack";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <FrontierSection />
      <SlopSection />
      <RagifyExplainer />
      <PlansPricing />
      <ValueStack />
      <FAQSection />
      <LatestFeed />
      <SecondaryCTA />
    </>
  );
}
