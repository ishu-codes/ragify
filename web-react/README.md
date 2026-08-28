# ragify-web

Browser app for Ragify: landing page, authentication, per-workspace dashboards, file upload and chat.

## Stack

- Vite 8 + React 19 + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- shadcn-style UI components (`src/components/ui`)
- TanStack Query, Zustand, React Router
- React Markdown + KaTeX for chat answers

## Scripts

```bash
pnpm dev      # Vite dev server on :3000
pnpm build    # tsc -b && vite build
pnpm lint     # oxlint
pnpm preview  # preview the production build
```

## API configuration

The API base URL is read from `VITE_API_URL` (default `http://localhost:8000`), with the version prefix from `VITE_API_VERSION` (default `v1`). All calls go through `src/lib/api.ts`.

## Structure

```text
src/
  components/
    marketing/    landing page Reveal + DemoConsole
    navbar/       app navigation
    ui/           shadcn-style primitives
    workspaces/   shared workspace UI
  fetchers/       typed API fetchers
  hooks/          auth session, responsive hooks
  lib/            api client, types, utils
  pages/
    auth/         sign in / sign up
    workspaces/   overview, chat, upload, settings
  store/          Zustand stores (session, sidebar)
```

## Pages

- `/` landing, `/terms`, `/privacy`
- `/sign-in`, `/sign-up`
- `/workspaces` list and `/workspaces/:id` (overview, chat, upload, settings)

The app expects the backend on `:8000` and the rag gRPC service reachable from the backend on `:50051` (see the repo root README).
