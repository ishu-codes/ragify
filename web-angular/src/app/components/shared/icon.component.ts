import { Component, computed, input } from '@angular/core';
import { ICONS, type IconName } from './icons';

@Component({
  standalone: true,
  selector: 'app-icon',
  template: `
    <svg
      [attr.viewBox]="'0 0 24 24'"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      [class]="class()"
    >
      @for (node of nodes(); track $index) {
        @switch (node.tag) {
          @case ('path') {
            <path [attr.d]="node.attrs['d']" />
          }
          @case ('rect') {
            <rect
              [attr.x]="node.attrs['x']"
              [attr.y]="node.attrs['y']"
              [attr.width]="node.attrs['width']"
              [attr.height]="node.attrs['height']"
              [attr.rx]="node.attrs['rx']"
              [attr.ry]="node.attrs['ry']"
            />
          }
          @case ('circle') {
            <circle [attr.cx]="node.attrs['cx']" [attr.cy]="node.attrs['cy']" [attr.r]="node.attrs['r']" />
          }
          @case ('ellipse') {
            <ellipse
              [attr.cx]="node.attrs['cx']"
              [attr.cy]="node.attrs['cy']"
              [attr.rx]="node.attrs['rx']"
              [attr.ry]="node.attrs['ry']"
            />
          }
          @case ('line') {
            <line
              [attr.x1]="node.attrs['x1']"
              [attr.x2]="node.attrs['x2']"
              [attr.y1]="node.attrs['y1']"
              [attr.y2]="node.attrs['y2']"
            />
          }
        }
      }
    </svg>
  `,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly class = input('');

  readonly nodes = computed(() => ICONS[this.name()] ?? []);
}
