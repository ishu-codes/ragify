# ragify-web-next

Ragify's browser app built with **Next.js 16 (App Router)**: landing page,
authentication, per-workspace dashboards, file upload and chat.

This is the Next.js implementation of the same product shipped in
`web-react`, with an identical visual design and feature set, reorganized
around Next.js conventions for optimized, production-ready code.

## Stack

- Next.js 16 App Router + React 19 + TypeScript
- Tailwind CSS v4, shadcn-style UI primitives (Base UI + Radix)
- TanStack Query, Zustand (persisted session + sidebar state)
- next-themes (dark-first), Sonner toasts
- React Markdown + KaTeX for chat answers
- next/font (Geist + Geist Mono, self-hosted)
- Biome for lint + format

## Scripts

```bash
pnpm dev       # Next.js dev server on :3000
pnpm build     # optimized production build (Turbopack)
pnpm start     # serve the production build
pnpm lint      # biome check
pnpm format    # biome format --write
pnpm typecheck # tsc --noEmit
```

## API configuration

The API base URL is read from `NEXT_PUBLIC_API_URL` (default
`http://localhost:8000`) with the version prefix from
`NEXT_PUBLIC_API_VERSION` (default `v1`). All calls go through
`src/lib/api.ts`, which attaches the persisted bearer token automatically.

## Structure

```text
src/
  app/
    (marketing)/          landing, privacy, terms (server components)
    (auth)/               sign-in / sign-up with shared shell
    workspaces/           workspace list + [workspaceId] routes
      [workspaceId]/      overview, chat, upload, settings
  components/
    marketing/            landing sections + copy source (sections.ts)
    ui/                   shadcn-style primitives
    workspaces/           shared workspace shell (sidebar, navbar, logout)
    providers.tsx         Query + theme providers
  context/                workspace upload status context
  hooks/                  auth session, responsive hooks
  lib/                    api client, types, utils, local session storage
  store/                  Zustand stores (session, sidebar)
```

## Routes

- `/` landing, `/privacy`, `/terms`
- `/sign-in`, `/sign-up` (`?plan=` supported)
- `/workspaces` list and `/workspaces/:id` (overview, chat, upload, settings)

The app expects the backend on `:8000` and the rag gRPC service reachable
from the backend on `:50051` (see the repo root README).
