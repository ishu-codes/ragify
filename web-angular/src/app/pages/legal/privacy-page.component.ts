import { Component } from '@angular/core';
import { LegalPageComponent } from './legal-page.component';

@Component({
  standalone: true,

  selector: 'app-privacy-page',
  imports: [LegalPageComponent],
  template: `
    <app-legal-page
      title="Privacy policy"
      meta="Last updated: August 18, 2026"
      footer="Questions? Contact privacy@ragify.ai."
      icon="Shield"
    >
      <section class="space-y-3">
        <h2 class="text-lg font-semibold tracking-tight">1. Overview</h2>
        <p class="text-sm leading-relaxed text-muted-foreground">
          Ragify provides grounded answers from your documents through isolated workspaces. This policy explains
          what data we process, how it is stored, and the choices you have over it.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold tracking-tight">2. Information we collect</h2>
        <ul class="list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            <span class="font-semibold text-foreground">Account data:</span> Email, name, and authentication
            credentials required to sign in.
          </li>
          <li>
            <span class="font-semibold text-foreground">Workspace content:</span> Documents, code, and metadata
            you upload into your workspaces.
          </li>
          <li>
            <span class="font-semibold text-foreground">Usage data:</span> Queries, chat sessions, and
            performance metrics used to operate and improve the service.
          </li>
        </ul>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold tracking-tight">3. How workspace content is processed</h2>
        <p class="text-sm leading-relaxed text-muted-foreground">
          Uploaded documents are chunked and embedded into vector indexes scoped to your workspace namespace. They
          are used to retrieve relevant context and produce cited answers. Your content is not used to train public
          models, and it is never shared with other workspaces or customers.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold tracking-tight">4. Retention and deletion</h2>
        <p class="text-sm leading-relaxed text-muted-foreground">
          You can delete a workspace at any time, which removes its documents, vector indexes, and chat history.
          Account data is retained while your account is active and deleted on request. Chat sessions created in
          your browser remain local to your device.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold tracking-tight">5. Third parties</h2>
        <p class="border-l-2 border-brand pl-4 text-sm leading-relaxed text-muted-foreground italic">
          Model providers and infrastructure vendors process data only to the extent required to deliver the
          service. Enterprise customers with dedicated clusters control their own embedding and model configuration.
        </p>
      </section>
    </app-legal-page>
  `,
})
export class PrivacyPageComponent {}
