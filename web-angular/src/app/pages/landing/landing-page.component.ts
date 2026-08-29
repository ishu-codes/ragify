import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HeroComponent } from '../../components/marketing/hero.component';
import { FrontierSectionComponent } from '../../components/marketing/frontier-section.component';
import { SlopSectionComponent } from '../../components/marketing/slop-section.component';
import { RagifyExplainerComponent } from '../../components/marketing/ragify-explainer.component';
import { PlansPricingComponent } from '../../components/marketing/plans-pricing.component';
import { ValueStackComponent } from '../../components/marketing/value-stack.component';
import { FaqSectionComponent } from '../../components/marketing/faq-section.component';
import { LatestFeedComponent } from '../../components/marketing/latest-feed.component';
import { SecondaryCtaComponent } from '../../components/marketing/secondary-cta.component';
import { FooterComponent } from '../../components/marketing/footer.component';

@Component({
  standalone: true,

  selector: 'app-landing-page',
  imports: [
    NavbarComponent,
    HeroComponent,
    FrontierSectionComponent,
    SlopSectionComponent,
    RagifyExplainerComponent,
    PlansPricingComponent,
    ValueStackComponent,
    FaqSectionComponent,
    LatestFeedComponent,
    SecondaryCtaComponent,
    FooterComponent,
  ],
  template: `
    <div class="flex min-h-dvh flex-col overflow-x-clip bg-background text-foreground">
      <app-navbar />
      <main class="flex-1">
        <app-hero />
        <app-frontier-section />
        <app-slop-section />
        <app-ragify-explainer />
        <app-plans-pricing />
        <app-value-stack />
        <app-faq-section />
        <app-latest-feed />
        <app-secondary-cta />
      </main>
      <app-footer />
    </div>
  `,
})
export class LandingPageComponent {}
