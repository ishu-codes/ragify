import { Component, input } from '@angular/core';
import { inject } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  standalone: true,

  selector: 'app-sidebar-shell',
  template: `
    <div class="flex min-h-dvh w-full">
      <aside
        [class]="
          collapsed() ?
            'flex w-[64px] shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200' :
            'flex w-64 shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200'
        "
      >
        <ng-content select="[sidebarHeader]" />
        <div class="flex-1 overflow-y-auto">
          <ng-content select="[sidebarContent]" />
        </div>
        <ng-content select="[sidebarFooter]" />
      </aside>
      <div class="min-w-0 flex-1">
        <ng-content />
      </div>
    </div>
  `,
})
export class SidebarShellComponent {
  private readonly sidebarService = inject(SidebarService);
  readonly collapsed = this.sidebarService.collapsed;
}

@Component({
  standalone: true,

  selector: 'app-sidebar-trigger',
  template: `
    <button
      type="button"
      (click)="toggle()"
      [attr.aria-label]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
      [attr.aria-expanded]="!collapsed()"
      class="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <ng-content />
    </button>
  `,
})
export class SidebarTriggerComponent {
  private readonly sidebarService = inject(SidebarService);
  readonly collapsed = this.sidebarService.collapsed;

  toggle(): void {
    this.sidebarService.toggle();
  }
}
