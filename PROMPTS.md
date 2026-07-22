# PROMPTS.md — AI Tooling Chat History

This file logs the prompts used with Claude (Anthropic) while building this project,
as required by the kata's AI usage policy. Entries are in chronological order.

> Note: this reflects the actual chat session used to build this project. If you
> continue building on top of this scaffold with your own AI sessions, append your
> own prompts below rather than replacing this history.

---

### Prompt 1
> [User shared the kata brief PDF] "Explain me the full project"

Claude summarized the kata requirements (backend API, frontend SPA, TDD process,
AI usage/co-authorship policy, deliverables) without writing any code yet.

### Prompt 2
> "give me full project"

Claude interpreted this as a request to actually build the full working
application (not just describe it further), and proceeded to:

1. Checked the sandbox's Node.js version and tested whether Node's built-in
   `node:sqlite` module was usable, to decide on a database approach that
   avoids native-binding build issues.
2. Scaffolded the backend: Express + TypeScript app, SQLite schema/migrations,
   user and vehicle repositories, JWT + bcrypt auth utilities, auth middleware
   (`requireAuth`, `requireAdmin`), zod validation schemas, and route handlers
   for `/api/auth/*` and `/api/vehicles/*`.
3. Wrote the Jest + Supertest test suite first for the repository layer and
   route layer (registration, login, CRUD, search, purchase/restock,
   authorization checks) — 35 tests total.
4. Installed dependencies, ran `npm test`, and fixed a TypeScript casting
   error in `vehicleRepository.ts` (`stmt.all()` return type from
   `node:sqlite` didn't structurally satisfy the `Vehicle[]` type) until all
   tests passed.
5. Ran `npm run build` to confirm a clean TypeScript compile, then generated
   a coverage report (`npm run test:coverage`, ~92% statement coverage).
6. Scaffolded the frontend with Vite (React + TypeScript), added Tailwind v4
   via `@tailwindcss/vite`, and planned a "dealership showroom" visual
   design (graphite/amber/teal palette, Oswald/Inter/JetBrains Mono
   typefaces) instead of default component styling.
7. Built the API client (with JWT injection via an axios interceptor), the
   `AuthContext` provider, and pages/components: Login, Register, Dashboard,
   VehicleCard, SearchFilterBar, VehicleFormModal, ProtectedRoute.
8. Ran `npm run build` on the frontend, which surfaced ~15
   `verbatimModuleSyntax` type-only-import errors; fixed all of them across
   the affected files and rebuilt successfully.
9. Seeded the database and started the backend server directly, then used
   `curl` to smoke-test `/api/health`, `/api/auth/login`, and confirmed a
   JWT was issued correctly.

### Prompt 3
> "Continue"

Claude picked up mid-task (having flagged remaining work explicitly at the
end of the prior turn): reran the frontend build to confirm no regressions,
added `.env.example` and `.gitignore` files for both the backend and
frontend, generated the test report file, and wrote this README and
PROMPTS.md file, before packaging the final project for delivery.

### Prompt 4
> [User asked what new features could be added, given a menu of options]
> "all"

Claude implemented all three of the previously-proposed enhancements in one
session:

1. **Order history**: added an `orders` table (with a defensive migration
   check for `image_url` on the vehicles table too), an `orderRepository.ts`
   data layer, wired order creation into the existing purchase endpoint, and
   added a new `GET /api/orders` route (own orders by default, `?all=true`
   for admins). Wrote 5 new tests for this (`tests/orders.test.ts`).
2. **Sorting + vehicle images**: added an `image_url` column, sort
   parameters (`sortBy`, `sortOrder`) to both `GET /api/vehicles` and
   `GET /api/vehicles/search`, with server-side allowlisting of sortable
   fields to prevent SQL injection via the sort parameter. Wrote 5 new
   tests (`tests/sorting.test.ts`). Updated the seed script with sample
   image URLs, and updated the frontend: vehicle photos on cards, a sort
   dropdown + direction toggle in the search bar, and an image URL field in
   the admin add/edit form.
3. **CI + deployment**: added `.github/workflows/ci.yml` (runs backend
   tests+coverage+build and frontend build on every push/PR) and
   `render.yaml` (a Render.com blueprint deploying the backend as a Node web
   service with a persistent disk, and the frontend as a static site).
   Claude also proactively updated the frontend's API client to read a
   `VITE_API_URL` build-time variable, since the local dev proxy setup
   wouldn't work once actually deployed — something not explicitly asked
   for but necessary for the deployment config to function.

Claude ran the full test suite (45/45 passing, ~93% coverage), rebuilt both
the backend and frontend to confirm clean TypeScript compiles, and did a
live smoke test of the new sort and image_url behavior against a running
server before considering the work done.

### Prompt 5
> "Continue"

Claude finished the remaining polish: reran the frontend build after the
last client-side change, regenerated the test coverage report, updated
README.md (new feature list, updated API table, a new CI/deployment
section) and this file, added new git commits with AI co-author trailers
for the new work, and repackaged the project for delivery.

---

## Summary of how AI was used

Claude was used as the primary implementer under direction — architecture and
design decisions (auth strategy, database choice, validation approach, admin
permission model, visual design direction) were reviewed and steered rather
than accepted blindly, and Claude was asked to actually run tests, builds,
and a live server smoke-test rather than just generate code and assume it
worked.
