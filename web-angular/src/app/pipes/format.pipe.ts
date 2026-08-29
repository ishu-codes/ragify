import { Pipe, PipeTransform } from '@angular/core';

function locale(): string {
  return (typeof navigator !== 'undefined' && navigator.language) || 'en-US';
}

@Pipe({
  standalone: true,
 name: 'dateMedium' })
export class DateMediumPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return new Intl.DateTimeFormat(locale(), { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }
}

@Pipe({
  standalone: true,
  name: 'timeShort',
})
export class TimeShortPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return new Intl.DateTimeFormat(locale(), { timeStyle: 'short' }).format(date);
  }
}

@Pipe({
  standalone: true,
  name: 'bytes',
})
export class BytesPipe implements PipeTransform {
  transform(size: number): string {
    if (size < 1024) {
      return `${size} B`;
    }
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
}
