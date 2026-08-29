# ragify-web (Angular)

Angular port of the Ragify browser app: landing page, authentication, per-workspace dashboards, file upload, chat, and session history.

## Stack

- Angular 22 (standalone components, signals, lazy-loaded routes)
- Tailwind CSS v4 with the shared Ragify design system (Geist, dashed panels, brand indigo)
- Angular Reactive Forms, HttpClient, and Angular Router with an SSR server
- KaTeX for math rendering in chat answers
- The same API surface as the React app (`web-react`)

## Scripts

```bash
npm start       # dev server on :3000 (Angular CLI requires Node >= 22.22.3)
npm run build   # production build with SSR server
npm test        # unit tests (Vitest)
npm run serve:ssr:web-angular  # serve the built app on :3000
```

## API configuration

The API base URL defaults to `http://localhost:8000` with the `v1` version prefix, matching the backend in the repo root. All calls go through `src/app/services/api.service.ts`; requests that need an explicit token (used by workspace flows) pass it directly, while authenticated calls read the session store.

## Structure

```text
src/app/
  components/
    marketing/    landing sections (Hero, Frontier, Slop, Explainer, Pricing, FAQ, Feed, CTA, Footer)
    navbar/       landing navbar + theme toggle
    shared/       icons, markdown renderer, toaster
    ui/           button, input, textarea, label, badge, avatar, skeleton, dialog, popover, sidebar
    workspaces/   workspace sidebar + inner navbar
  directives/     Reveal (IntersectionObserver scroll animation)
  guards/         auth guard for workspace routes
  pages/
    landing/      /
    legal/        /privacy, /terms
    auth/         /sign-in, /sign-up
    workspaces/   list, overview, chat, upload, settings, history
  pipes/          date/time/bytes formatting
  services/       api, session, theme, sidebar, toast, upload polling, markdown, local workspace sessions
```

## Pages

- `/` landing, `/terms`, `/privacy`
- `/sign-in`, `/sign-up`
- `/workspaces` list and `/workspaces/:id` (overview, chat, upload, settings, history)

The app expects the backend on `:8000` and the rag gRPC service reachable from the backend on `:50051` (see the repo root README).
