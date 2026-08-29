export type ClassValue = string | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}

export const INPUT_CLASS =
  'h-9 w-full min-w-0 rounded-4xl border border-input bg-input/30 px-3 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/25 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';

export const TEXTAREA_CLASS =
  'flex field-sizing-content min-h-16 w-full resize-none rounded-xl border border-input bg-input/30 px-3 py-3 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';

export function formatDate(value: string): string {
  const locale = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function formatTime(value: string): string {
  const locale = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';
  return new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(new Date(value));
}

export function formatBytes(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
