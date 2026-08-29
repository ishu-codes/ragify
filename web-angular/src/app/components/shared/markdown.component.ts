import { Component, computed, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { inject } from '@angular/core';
import { MarkdownService } from '../../services/markdown.service';

@Component({
  standalone: true,

  selector: 'app-markdown',
  template: `
    <div class="markdown-body wrap-break-words" [innerHTML]="html()"></div>
  `,
})
export class MarkdownComponent {
  readonly content = input.required<string>();

  private readonly markdownService = inject(MarkdownService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly html = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.markdownService.render(this.content() ?? '')),
  );
}
