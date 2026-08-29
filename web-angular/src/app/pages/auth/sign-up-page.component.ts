import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';
import { ToastService } from '../../services/toast.service';
import { InputComponent } from '../../components/ui/input.component';
import { ButtonComponent } from '../../components/ui/button.component';
import { IconComponent } from '../../components/shared/icon.component';

@Component({
  standalone: true,

  selector: 'app-sign-up-page',
  imports: [ReactiveFormsModule, RouterLink, InputComponent, ButtonComponent, IconComponent],
  template: `
    <div class="w-full">
      <div class="space-y-2 text-center">
        <h1 class="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p class="text-sm leading-relaxed text-muted-foreground">
          Start building grounded AI workspaces in under a minute.
        </p>
        @if (plan()) {
          <p class="mx-auto w-fit rounded-full border border-brand/30 bg-brand/10 px-3 py-1 font-mono text-xs font-medium text-brand-text">
            Selected plan: {{ plan() }}
          </p>
        }
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-7 space-y-4" novalidate>
        <div class="space-y-2">
          <label appLabel for="name">Name</label>
          <input
            appInput
            id="name"
            formControlName="name"
            placeholder="Jane Cooper"
            autocomplete="name"
            class="h-10 rounded-md text-sm"
          />
          @if (form.controls.name.touched && form.controls.name.errors) {
            <p class="text-xs text-destructive">Name must be at least 2 characters</p>
          }
        </div>

        <div class="space-y-2">
          <label appLabel for="email">Email address</label>
          <input
            appInput
            id="email"
            formControlName="email"
            type="email"
            placeholder="you@company.com"
            autocomplete="email"
            class="h-10 rounded-md text-sm"
          />
          @if (form.controls.email.touched && form.controls.email.errors) {
            <p class="text-xs text-destructive">Invalid email address</p>
          }
        </div>

        <div class="space-y-2">
          <label appLabel for="password">Password</label>
          <div class="relative">
            <input
              appInput
              id="password"
              formControlName="password"
              [type]="showPassword() ? 'text' : 'password'"
              placeholder="At least 6 characters"
              autocomplete="new-password"
              class="h-10 rounded-md pr-10 text-sm"
            />
            <button
              type="button"
              (click)="showPassword.set(!showPassword())"
              class="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
              [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
            >
              <app-icon [name]="showPassword() ? 'Eye' : 'EyeClosed'" class="size-4" />
            </button>
          </div>
          @if (form.controls.password.touched && form.controls.password.errors) {
            <p class="text-xs text-destructive">Password must be at least 6 characters</p>
          }
        </div>

        <button appButton variant="pill" size="pillLg" type="submit" class="mt-1 w-full justify-center" [disabled]="isLoading()">
          {{ isLoading() ? 'Creating account...' : 'Create account' }}
          <app-icon name="ArrowRight" class="size-4" />
        </button>
      </form>

      <p class="mt-6 border-t border-border pt-5 text-center text-sm text-muted-foreground">
        Already have an account?
        <a routerLink="/sign-in" class="font-medium text-foreground transition-colors hover:underline underline-offset-4">
          Sign in
        </a>
      </p>

      <p class="mt-5 text-center text-[11px] text-muted-foreground">Free to start. No credit card required.</p>
    </div>
  `,
})
export class SignUpPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly apiService = inject(ApiService);
  private readonly sessionService = inject(SessionService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isLoading = signal(false);
  readonly showPassword = signal(false);
  readonly plan = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const raw = params.get('plan');
      this.plan.set(raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : null);
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.apiService.register(this.form.getRawValue()).subscribe({
      next: (data) => {
        this.sessionService.setSession({ user: data.user, accessToken: data.access_token });
        this.toastService.success('Account created successfully! Welcome to Ragify.');
        void this.router.navigate(['/workspaces'], { replaceUrl: true });
      },
      error: (error: Error) => {
        this.toastService.error(error.message || 'An unexpected error occurred');
        this.isLoading.set(false);
      },
    });
  }
}
