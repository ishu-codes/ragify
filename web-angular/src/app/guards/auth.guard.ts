import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

export const authGuard: CanActivateFn = () => {
  const sessionService = inject(SessionService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    // During SSR/prerender there is no persisted session; the client redirects
    // to sign-in if the user is not authenticated.
    return true;
  }

  if (!sessionService.hasHydrated()) {
    // Wait one tick for localStorage hydration.
    setTimeout(() => {
      if (!sessionService.isAuthenticated()) {
        void router.navigate(['/sign-in'], { replaceUrl: true });
      }
    }, 0);
    return true;
  }

  if (!sessionService.isAuthenticated()) {
    return router.createUrlTree(['/sign-in']);
  }

  return true;
};
