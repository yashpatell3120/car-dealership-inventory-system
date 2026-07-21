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

---

## Summary of how AI was used

Claude was used as the primary implementer under direction — architecture and
design decisions (auth strategy, database choice, validation approach, admin
permission model, visual design direction) were reviewed and steered rather
than accepted blindly, and Claude was asked to actually run tests, builds,
and a live server smoke-test rather than just generate code and assume it
worked.
