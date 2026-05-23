# SmartEdu — Web Foundation Architecture

## Stack

- **Next.js 16** (App Router, `src/`)
- **TypeScript** (strict)
- **Tailwind CSS v4** (CSS design tokens)
- **Firebase** (Auth + Firestore — configured via env)
- **Zustand** (client auth state)
- **Zod + React Hook Form** (forms — used in Auth module)

## Folder structure

```
src/
├── app/                    # Routes only (thin pages)
│   ├── (marketing)/        # Public landing
│   ├── (auth)/             # Login, register
│   └── (portals)/          # student | teacher | admin
├── components/
│   ├── ui/                 # Button, Card, Input, Badge
│   ├── layout/             # Sidebar, Header, DashboardShell
│   └── shared/             # PageHeader, EmptyState, PlaceholderPage
├── config/                 # Site metadata
├── constants/              # Routes, roles, navigation
├── features/               # Domain modules (per sprint)
├── hooks/                  # Shared hooks
├── lib/
│   ├── firebase/           # Client SDK init
│   └── utils/              # cn, formatters
├── services/               # Data / API layer
├── store/                  # Zustand stores
└── types/                  # Shared TypeScript types
```

## Design system

**Tailwind CSS v4** + **shadcn/ui** (base-nova). See `DESIGN_SYSTEM.md`.

- Tokens: `src/app/globals.css`, `src/styles/tokens.ts`
- UI: `src/components/ui/` — Button, Card, Input, FormField, Dialog, Modal, Typography, Badge
- Pastel **white / blue / yellow** theme; semantic colors via `primary`, `secondary`, `accent`

## Authentication

- **Firebase Auth** (email/password) + **Firestore** `users/{uid}` for roles
- Env vars: see `.env.example`
- `AuthProvider` syncs Firebase → Zustand store
- `POST/DELETE /api/auth/session` sets httpOnly cookie for middleware
- `middleware.ts` blocks unauthenticated access to `/student`, `/teacher`, `/admin`
- `AuthGuard` / `GuestGuard` for client-side role routing

## Firestore data model

| Collection | Doc ID | Query keys | Notes |
|------------|--------|------------|-------|
| `users` | `uid` | — | Role + profile |
| `students` | auto | `status`, `classKey` (`{grade}_{section}`), `grade` + `orderBy(createdAt)` | Denormalized `classKey` on write |
| `attendance` | `{studentId}_{date}` | `date`, `yearMonth`, `classKey` | Monthly reports use `yearMonth` partition |
| `studyTasks` | `{studentId}_{YYYYMMDD}_{HHmm}` (AI) or auto (manual) | `studentId` + `weekKey` (Monday ISO date) | Week-scoped reads; batched creates |

- Shared helpers: `src/lib/firebase/firestore/` (`queryCollection`, `runBatchedSet`, limits)
- Composite indexes: `firestore.indexes.json` — deploy with `firebase deploy --only firestore:indexes`
- Security rules template: `firestore.rules.example`

## Module build order

1. ~~**Auth**~~ — Done
2. **Student** — Dashboard, marks, weak topics, readiness, planner
3. **Teacher** — Classes, analytics, AI assistant
4. **Admin** — School KPIs, interventions

## Commands

```bash
npm install
cp .env.example .env.local   # add Firebase keys
npm run dev
npm run build
npm run typecheck
```
