import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/marketing/Hero";
import { FrontierSection } from "@/components/marketing/FrontierSection";
import { SlopSection } from "@/components/marketing/SlopSection";
import { RagifyExplainer } from "@/components/marketing/RagifyExplainer";
import { PlansPricing } from "@/components/marketing/PlansPricing";
import { ValueStack } from "@/components/marketing/ValueStack";
import { FAQSection } from "@/components/marketing/FAQSection";
import { LatestFeed } from "@/components/marketing/LatestFeed";
import { SecondaryCTA } from "@/components/marketing/SecondaryCTA";
import { Footer } from "@/components/marketing/Footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <FrontierSection />
        <SlopSection />
        <RagifyExplainer />
        <PlansPricing />
        <ValueStack />
        <FAQSection />
        <LatestFeed />
        <SecondaryCTA />
      </main>
      <Footer />
    </div>
  );
}
