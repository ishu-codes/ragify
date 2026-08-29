import { Injectable } from '@angular/core';
import katex from 'katex';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

@Injectable({ providedIn: 'root' })
export class MarkdownService {
  render(content: string): string {
    return this.renderBlocks(this.splitBlocks(content)).join('\n');
  }

  private splitBlocks(content: string): string[] {
    const lines = content.replace(/\r\n/g, '\n').split('\n');
    const blocks: string[] = [];
    let current: string[] = [];

    const flush = (): void => {
      if (current.length) {
        blocks.push(current.join('\n'));
        current = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
        const fence = trimmed[0];
        const lang = trimmed.slice(3).trim();
        const code: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trimStart().startsWith(fence.repeat(3))) {
          code.push(lines[i]);
          i++;
        }
        flush();
        blocks.push(`__CODE__${lang}__${code.join('\n')}`);
        continue;
      }

      if (trimmed.startsWith('|') && this.isTableStart(lines, i)) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }
        i--;
        flush();
        blocks.push(`__TABLE__${tableLines.join('\n')}`);
        continue;
      }

      if (!trimmed) {
        flush();
        continue;
      }

      if (trimmed.startsWith('#')) {
        flush();
        blocks.push(trimmed);
        continue;
      }

      if (trimmed.startsWith('>')) {
        current.push(trimmed);
        continue;
      }

      if (/^[-*+]\s+/.test(trimmed) || /^\d+[.)]\s+/.test(trimmed)) {
        current.push(trimmed);
        continue;
      }

      if (/^([-*_])\1\1+$/.test(trimmed)) {
        flush();
        blocks.push('---');
        continue;
      }

      current.push(line);
    }

    flush();
    return blocks;
  }

  private isTableStart(lines: string[], index: number): boolean {
    if (index + 1 >= lines.length) {
      return false;
    }
    const separator = lines[index + 1].trim();
    return /^\|?[\s:|-]+\|?$/.test(separator) && separator.includes('-');
  }

  private renderBlocks(blocks: string[]): string[] {
    return blocks.map((block) => {
      if (block.startsWith('__CODE__')) {
        const langEnd = block.indexOf('__', 8);
        const lang = block.slice(8, langEnd);
        const code = block.slice(langEnd + 2);
        return `<pre><code${lang ? ` class="language-${escapeHtml(lang)}"` : ''}>${escapeHtml(code)}</code></pre>`;
      }

      if (block.startsWith('__TABLE__')) {
        return this.renderTable(block.slice(9));
      }

      if (block === '---') {
        return '<hr />';
      }

      if (block.startsWith('>')) {
        const quote = block
          .split('\n')
          .map((line) => line.replace(/^\s*>\s?/, ''))
          .join('\n');
        return `<blockquote>${this.renderInline(quote)}</blockquote>`;
      }

      const headingMatch = block.match(/^(#{1,4})\s+(.*)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        return `<h${level}>${this.renderInline(headingMatch[2])}</h${level}>`;
      }

      if (/^[-*+]\s+/.test(block)) {
        const items = block
          .split('\n')
          .filter((line) => /^[-*+]\s+/.test(line))
          .map((line) => `<li>${this.renderInline(line.replace(/^[-*+]\s+/, ''))}</li>`);
        return `<ul>${items.join('')}</ul>`;
      }

      if (/^\d+[.)]\s+/.test(block)) {
        const items = block
          .split('\n')
          .filter((line) => /^\d+[.)]\s+/.test(line))
          .map((line) => `<li>${this.renderInline(line.replace(/^\d+[.)]\s+/, ''))}</li>`);
        return `<ol>${items.join('')}</ol>`;
      }

      return `<p>${this.renderInline(block)}</p>`;
    });
  }

  private renderTable(block: string): string {
    const lines = block.split('\n').filter((line) => line.trim());
    if (lines.length < 2) {
      return '';
    }

    const splitRow = (line: string): string[] =>
      line
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => cell.trim());

    const headers = splitRow(lines[0]);
    const alignments = splitRow(lines[1]).map((cell) => {
      if (cell.startsWith(':') && cell.endsWith(':')) {
        return 'center';
      }
      if (cell.endsWith(':')) {
        return 'right';
      }
      return 'left';
    });

    const headerHtml = headers
      .map((header, index) => `<th style="text-align:${alignments[index] ?? 'left'}">${this.renderInline(header)}</th>`)
      .join('');
    const rows = lines
      .slice(2)
      .map(
        (line) =>
          `<tr>${splitRow(line)
            .map((cell, index) => `<td style="text-align:${alignments[index] ?? 'left'}">${this.renderInline(cell)}</td>`)
            .join('')}</tr>`,
      )
      .join('');

    return `<table><thead><tr>${headerHtml}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  private renderInline(text: string): string {
    const mathParts: string[] = [];
    const withoutDisplayMath = text.replace(/\$\$([\s\S]+?)\$\$/g, (_match, formula: string) => {
      try {
        mathParts.push(katex.renderToString(formula, { displayMode: true, throwOnError: false }));
      } catch {
        mathParts.push(escapeHtml(`$$${formula}$$`));
      }
      return `\u0000MATH{${mathParts.length - 1}}\u0000`;
    });

    const withoutMath = withoutDisplayMath.replace(/\$([^$\n]+?)\$/g, (_match, formula: string) => {
      try {
        mathParts.push(katex.renderToString(formula, { displayMode: false, throwOnError: false }));
      } catch {
        mathParts.push(escapeHtml(`$${formula}$`));
      }
      return `\u0000MATH{${mathParts.length - 1}}\u0000`;
    });

    const escaped = escapeHtml(withoutMath);

    let html = escaped
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]+)&quot;)?\)/g, '<img src="$2" alt="$1" />')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_]+)__/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/~~([^~]+)~~/g, '<del>$1</del>');

    html = html.replace(/\u0000MATH\{(\d+)\}\u0000/g, (_match, index: string) => mathParts[Number(index)] ?? '');

    return html;
  }
}
