# Libraries

Approved stack for this Next.js App Router + Supabase app. Prefer these over alternatives. Do not add Zustand, TanStack Query, or Redux until the conditions below are met.

## Backend

- **@supabase/ssr** + **@supabase/supabase-js** — official Next.js App Router clients (cookies/session). Do not use the old auth-helpers packages.

## UI / styling

- **shadcn/ui** — not an npm component library. CLI copies source into `components/ui/`. Add components with `npx shadcn@latest add <name>`. Do not reinvent primitives that shadcn already has.
- **Tailwind CSS v4** — required by shadcn; no runtime CSS-in-JS.
- **lucide-react** — default shadcn icon set. Tree-shakeable; keep icons at `h-4 w-4` / `h-5 w-5`.
- **clsx** + **tailwind-merge** — used only via `cn()` in `lib/utils.ts` for conditional classNames.

## Forms & validation

- **zod** — schemas live in `validations/`. Same schema for client forms and Server Actions.
- **react-hook-form** — performant forms (uncontrolled inputs). Do not drive forms with a pile of `useState`.
- **@hookform/resolvers** — `zodResolver` connects Zod to react-hook-form.

## Dates & IDs

- **date-fns** — tree-shakeable date utils. Import only the functions you need. Never use moment.js.
- **nanoid** — short client-side IDs (e.g. optimistic UI temp IDs). DB IDs stay `gen_random_uuid()`.

## Control flow

- **ts-pattern** — type-safe matching in `data/` and `actions/` (error/result branching). Prefer over large `switch`/`if` chains on discriminated unions.

## Testing

- **Vitest** — unit and component tests (`npm test`). Fast, isolated logic.
- **Playwright** — E2E (`npm run test:e2e`), especially auth and RLS. First machine: `npx playwright install chromium`.
- They are not interchangeable. Do not add Jest.

## Do not install unless needed

- **zustand** — only for genuine cross-component client state that Server Components and URL search params cannot handle. Do not create `stores/` or install Zustand by default. Never Redux.
- **@tanstack/react-query** — only for client-side data that changes after load (polling, optimistic updates, infinite scroll, client-triggered refetches). Initial reads go through Server Components + `data/`. Do not add it just to “fetch data.”
