# PROMPTS.md

AI tooling chat log for this repo. Tool: Claude (Anthropic), agentic mode
(terminal + file system access — it ran the actual test suite and builds,
not just generated snippets). Log kept per the kata's AI usage policy.

---

## session 1 — spec review

**prompt:** `Explain me the full project` (kata PDF attached)

No code. Had it parse the brief and confirm scope: REST API + JWT auth,
React SPA, TDD process requirement (red/green/refactor in commit history),
AI co-author trailers on commits, this file + README's "My AI Usage"
section as deliverables.

## session 2 — initial build

**prompt:** `give me full project`

### backend
- stack: Express + TS. DB: `node:sqlite` (built into Node 22.5+) instead of
  `better-sqlite3` — same real, file-persisted SQLite, skips the native
  build step.
- `db/connection.ts` — schema + migrations
- `db/userRepository.ts`, `db/vehicleRepository.ts` — data layer
- `utils/auth.ts` — JWT sign/verify, bcrypt hash/compare
- `middleware/auth.ts` — `requireAuth`, `requireAdmin`
- `utils/validation.ts` — zod schemas for request bodies
- `routes/auth.ts`, `routes/vehicles.ts` — route handlers
- test suite: Jest + Supertest, 35 cases (repo-layer unit tests + route
  integration tests — auth validation, CRUD, search filters, admin-only
  guard checks)
- ran `npm test` → hit a TS error: `stmt.all()` from `node:sqlite` doesn't
  structurally match my `Vehicle[]` type. Fixed with `as unknown as
  Vehicle[]` at the repo boundary. Reran, green.
- `npm run build` clean. `npm run test:coverage` → ~92%.

### frontend
- Vite + React + TS + Tailwind v4
- custom theme instead of default Tailwind styling — graphite/amber
  "dealership showroom" palette, Oswald/Inter/JetBrains Mono
- `AuthContext`, `ProtectedRoute`, pages (Login/Register/Dashboard),
  components (VehicleCard, SearchFilterBar, VehicleFormModal)
- `npm run build` → ~15 errors, all `verbatimModuleSyntax` complaints on
  type-only imports (`import { Foo }` → needs `import type { Foo }` when
  `Foo` is a type). Fixed across every affected file.
- seeded DB, started server, curled `/api/health` and `/api/auth/login` to
  confirm a real JWT came back before calling it done.

## session 3 — finish deliverables

**prompt:** `Continue`

Rebuilt frontend (sanity check), added `.env.example` + `.gitignore`
(backend, frontend, root), regenerated coverage report, wrote README.md
(setup, API table, design notes, AI Usage section) and this file.

## session 4 — feature additions

Asked for a menu of feature ideas beyond the base spec, picked:

**prompt:** `all`

- **order history**: `orders` table (denormalized — stores make/model/price
  at time of sale so history doesn't break if the vehicle record changes
  later), `db/orderRepository.ts`, wired into `POST
  /api/vehicles/:id/purchase`, new `GET /api/orders` (own history by
  default, admins get `?all=true`). +5 tests (`tests/orders.test.ts`).
- **sorting + images**: `image_url` column (guarded migration via `PRAGMA
  table_info` check for existing DBs), `sortBy`/`sortOrder` params on
  `GET /api/vehicles` and `/search`, allowlisted against a fixed set of
  columns (`price`, `created_at`, `make`, `quantity`) to avoid building
  raw SQL off user input. +5 tests (`tests/sorting.test.ts`). Frontend:
  image render on `VehicleCard`, sort dropdown + asc/desc toggle in
  `SearchFilterBar`, image URL field in `VehicleFormModal`.
- **CI/deploy**: `.github/workflows/ci.yml` (test+coverage+build on push/PR
  for both services), `render.yaml` blueprint (backend as a Node web
  service w/ persistent disk for the sqlite file, frontend as static site).
  Also flagged on its own that the frontend needed a configurable API base
  URL for prod (`VITE_API_URL` env var), since the local Vite dev proxy is
  localhost-only — not something I explicitly asked for but correct catch.

Full suite: 45/45 passing, ~93% coverage. Both builds clean. Smoke-tested
sort params + image_url against a running instance before wrapping up.

## session 5 — docs pass

**prompt:** `Continue`

Rebuilt frontend post-client-change, regenerated coverage report, updated
README (new endpoints, CI/deploy section, AI usage addendum) and this file,
committed everything.

## session 6 — local run support / debugging

Ongoing back-and-forth getting the project running on my machine (Windows,
VS Code):

- walked through `cd`/drive-switching syntax differences (Command Prompt
  vs PowerShell) for a `D:\` drive setup
- `NODE_OPTIONS=X command` (bash-style inline env var) doesn't work in
  `cmd.exe` — needed `set NODE_OPTIONS=--experimental-sqlite` as a separate
  line first, then run the command
- process restart routine after a PC reboot (no reinstall needed, just
  restart both dev servers)
- running both servers side-by-side in VS Code's integrated terminal
  (`Ctrl+Shift+`` ` `` for a second tab)
- confirmed SQLite-vs-in-memory distinction against the kata requirement
  (proved via restart persistence)
- debugging an image not showing after edit — likely cause: copied a
  webpage link instead of a direct image-file link (`Copy image address`
  vs `Copy link`), or a host blocking hotlinking. Gave a known-good test
  URL to isolate whether the feature itself was broken vs the specific
  link being bad.
- how to change a seeded vehicle's photo directly in `seed.ts` (edit the
  `image_url` field or the `img('...')` seed string), plus the gotcha that
  reseeding only inserts new rows — existing rows need the sqlite file
  deleted first (`del data\dealership.sqlite`) for a full reset

No code changes from this session beyond what shipped in session 4/5 —
this was purely getting the existing build running correctly locally.

---

## notes to self

- `node:sqlite` is still flagged experimental — fine for a kata, would
  reconsider for anything actually going to prod (or just confirm the flag
  requirement is gone in whatever Node LTS is current by then).
- orders table is denormalized on purpose (make/model/price snapshotted at
  purchase time) — normal DB design would just FK to vehicles, but that
  breaks history if a vehicle's price changes or gets deleted later.
- sort param is allowlisted server-side, not just validated client-side —
  don't ever interpolate a query param straight into `ORDER BY`.
- test coverage number moved from ~92% → ~93% after the orders/sorting
  test files were added — checked coverage each time not just test count,
  since 45 passing tests means nothing if new code paths aren't hit.
