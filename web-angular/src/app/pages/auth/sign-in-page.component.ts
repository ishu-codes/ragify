import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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

  selector: 'app-sign-in-page',
  imports: [ReactiveFormsModule, RouterLink, InputComponent, ButtonComponent, IconComponent],
  template: `
    <div class="w-full">
      <div class="space-y-2 text-center">
        <h1 class="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p class="text-sm leading-relaxed text-muted-foreground">Sign in to access your workspaces.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-7 space-y-4" novalidate>
        <div class="space-y-2">
          <label appLabel for="email" class="text-muted-foreground text-sm font-medium uppercase">Email address</label>
          <input
            appInput
            id="email"
            formControlName="email"
            type="email"
            placeholder="email@example.com"
            autocomplete="email"
            class="h-10 rounded-md text-sm"
          />
          @if (form.controls.email.touched && form.controls.email.errors) {
            <p class="text-xs text-destructive">{{ emailError() }}</p>
          }
        </div>

        <div class="space-y-2">
          <label appLabel for="password" class="text-muted-foreground text-sm font-medium uppercase">Password</label>
          <div class="relative">
            <input
              appInput
              id="password"
              formControlName="password"
              [type]="showPassword() ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="current-password"
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

        <button appButton variant="pill" size="pill" type="submit" class="mt-1 w-full justify-center" [disabled]="isLoading()">
          {{ isLoading() ? 'Signing in...' : 'Sign in' }}
          <app-icon name="ArrowRight" class="size-4" />
        </button>
      </form>

      <div class="mt-4">
        <button appButton variant="outlinePill" size="pill" type="button" (click)="fillDemoCredentials()" class="w-full justify-center">
          <app-icon name="KeyRound" class="size-3.5" />
          Fill demo credentials
        </button>
      </div>

      <p class="mt-6 border-t border-border pt-5 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?
        <a routerLink="/sign-up" class="font-medium text-foreground transition-colors hover:underline underline-offset-4">
          Create a free account
        </a>
      </p>

      <p class="mt-5 text-center text-[11px] text-muted-foreground">
        Protected by end-to-end encryption and isolated vector security.
      </p>
    </div>
  `,
})
export class SignInPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly apiService = inject(ApiService);
  private readonly sessionService = inject(SessionService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    this.form.controls.email.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.form.controls.email.markAsTouched());
  }

  emailError(): string {
    const errors = this.form.controls.email.errors;
    if (errors?.['email']) {
      return 'Invalid email address';
    }
    return 'Email is required';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.apiService.login(this.form.getRawValue()).subscribe({
      next: (data) => {
        this.sessionService.setSession({ user: data.user, accessToken: data.access_token });
        this.toastService.success(`Welcome back, ${data.user.name}!`);
        void this.router.navigate(['/workspaces'], { replaceUrl: true });
      },
      error: (error: Error) => {
        this.toastService.error(error.message || 'Failed to sign in. Check your credentials.');
        this.isLoading.set(false);
      },
    });
  }

  fillDemoCredentials(): void {
    this.form.setValue({ email: 'demo@ragify.ai', password: 'demo123456' });
    this.toastService.info('Demo credentials filled!');
  }
}
