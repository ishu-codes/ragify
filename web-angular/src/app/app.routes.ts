import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing-page.component').then((m) => m.LandingPageComponent),
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./pages/legal/privacy-page.component').then((m) => m.PrivacyPageComponent),
  },
  {
    path: 'terms',
    loadComponent: () =>
      import('./pages/legal/terms-page.component').then((m) => m.TermsPageComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/auth/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: 'sign-in',
        loadComponent: () =>
          import('./pages/auth/sign-in-page.component').then((m) => m.SignInPageComponent),
      },
      {
        path: 'sign-up',
        loadComponent: () =>
          import('./pages/auth/sign-up-page.component').then((m) => m.SignUpPageComponent),
      },
    ],
  },
  {
    path: 'workspaces',
    loadComponent: () =>
      import('./pages/workspaces/workspaces-page.component').then((m) => m.WorkspacesPageComponent),
  },
  {
    path: 'workspaces/:workspaceId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/workspaces/workspace-layout.component').then((m) => m.WorkspaceLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/workspaces/overview-page.component').then((m) => m.OverviewPageComponent),
      },
      {
        path: 'chat',
        loadComponent: () =>
          import('./pages/workspaces/chat-page.component').then((m) => m.ChatPageComponent),
      },
      {
        path: 'upload',
        loadComponent: () =>
          import('./pages/workspaces/upload-page.component').then((m) => m.UploadPageComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/workspaces/settings-page.component').then((m) => m.SettingsPageComponent),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./pages/workspaces/history-page.component').then((m) => m.HistoryPageComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
