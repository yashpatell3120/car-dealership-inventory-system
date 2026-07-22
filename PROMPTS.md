# PROMPTS.md — AI Chat History

This document contains the prompt history of my interactions with Claude
(Anthropic's AI assistant) while developing this project, as required in the
AI Usage Policy section of the assignment brief. I am currently pursuing my
M.Tech and used this kata as an opportunity to also get hands-on experience
with AI-assisted development workflows, which is something I wanted to
explore properly rather than just using it for autocomplete.

I used Claude in an agentic setup — it had terminal access and could
install dependencies, execute my test suite, and run the actual build
commands, rather than just generating code snippets for me to copy-paste
and verify manually. This was useful because it meant the code I received
had actually been validated (tests run, builds checked) before I saw the
final output.

---

## Session 1: Requirement analysis

**Prompt:**
> "Explain me the full project"

Before starting implementation, I uploaded the kata specification PDF and
asked Claude to walk through the requirements with me. It broke down the
brief into the major components — the REST API with authentication, the
React frontend, the TDD process expectations (red-green-refactor pattern in
commit history), and the AI-usage documentation requirements (co-author
trailers, this file, and the "My AI Usage" section in README.md). This step
was useful for making sure I had a clear mental model of scope before any
code was written.

## Session 2: Full implementation

**Prompt:**
> "give me full project"

This was the primary implementation session. The work was broken down into
a backend phase and a frontend phase:

**Backend (Node.js + TypeScript + Express):**
- Evaluated database options and settled on Node's built-in `node:sqlite`
  module (available from Node 22.5+) instead of a third-party binding like
  `better-sqlite3`, to avoid native compilation dependencies while still
  meeting the "not in-memory" requirement with a real, file-persisted
  database.
- Implemented the data access layer (repositories for users and vehicles),
  authentication utilities (JWT signing/verification, bcrypt hashing), and
  middleware for route protection (`requireAuth`) and role-based access
  control (`requireAdmin`).
- Wrote the test suite using Jest and Supertest — 35 test cases across unit
  tests (repository layer) and integration tests (API routes), covering
  registration/login validation, CRUD operations, search/filter logic, and
  authorization boundaries.
- Ran the suite, identified and resolved a TypeScript type-narrowing issue
  in the SQLite repository (the driver's return type didn't structurally
  match my domain interfaces, requiring an explicit cast through
  `unknown`), then confirmed a clean `tsc` build and generated a coverage
  report (~92% statement coverage).

**Frontend (React + TypeScript + Vite + Tailwind CSS v4):**
- Scaffolded the SPA and set up a custom design system (palette, typography
  scale) rather than relying on default component styling, going with an
  automotive/showroom visual theme suited to the domain.
- Built the authentication context, protected routing, and the core pages
  (Login, Register, Dashboard) along with reusable components for the
  vehicle cards, search/filter bar, and the admin CRUD modal.
- On running the production build, encountered ~15 compile errors related
  to TypeScript's `verbatimModuleSyntax` compiler option (type-only imports
  require the `import type` syntax under this setting) — resolved across
  all affected files.
- Seeded the database and performed a manual smoke test of the running
  server using curl to validate the health check, login flow, and JWT
  issuance end-to-end.

## Session 3: Completion of deliverables

**Prompt:**
> "Continue"

Continued from the previous session to finish the remaining deliverables —
verified the frontend build was still clean, added environment
configuration (`.env.example`) and `.gitignore` files for both services,
generated the final test report, and authored the README (setup
instructions, API reference, design rationale, and the mandatory AI Usage
section) along with this file.

## Session 4: Feature extensions

I asked for suggestions on what additional features could be implemented
beyond the base requirements to demonstrate a more complete understanding
of the system, and after reviewing the options presented, requested:

> "all"

Three extensions were implemented in this session:

1. **Order/transaction history** — introduced an `orders` table (denormalized
   with make/model/price at time of purchase, so historical records remain
   accurate independent of later edits to the vehicle record), a
   corresponding repository module, and a `GET /api/orders` endpoint with
   role-aware behaviour (own history by default, full history via `?all=true`
   for admin users). Added 5 additional test cases for this.

2. **Sorting and vehicle imagery** — added an `image_url` column (with a
   migration guard for existing databases using `PRAGMA table_info`), and
   `sortBy`/`sortOrder` query parameters on the listing and search
   endpoints, with server-side validation against an allowlist of sortable
   fields to prevent unsafe dynamic SQL construction. Added 5 further test
   cases and updated the frontend accordingly (image rendering on cards,
   sort controls in the filter bar, image URL field in the admin form).

3. **CI/CD and deployment configuration** — added a GitHub Actions workflow
   to run the test suite and both builds on every push/PR, and a
   `render.yaml` blueprint for deployment to Render.com. It was also
   flagged (without my having asked) that the frontend's API client would
   need a configurable base URL for production, since the local
   development proxy is not applicable outside `localhost` — this was
   addressed via a `VITE_API_URL` build-time environment variable.

Post-implementation, the full suite was re-run (45/45 passing, ~93%
coverage), both services were rebuilt to confirm no regressions, and the
new functionality was verified against a live server instance before
concluding the session.

## Session 5: Final documentation pass

**Prompt:**
> "Continue"

Final cleanup pass — rebuilt the frontend after the last change to the API
client, regenerated the coverage report, and updated the README and this
file to reflect the extended feature set, along with the corresponding git
commit history (each commit tagged with the required AI co-author trailer).

---

## Reflection

As someone from an academic background where AI tool usage is still
somewhat new territory in terms of formal workflow integration, I found
this a useful exercise in understanding where such tools genuinely add
value versus where independent judgement is still required. The clearest
benefit was verification — having the assistant actually execute the test
suite and build pipeline rather than just producing code meant issues (the
SQLite type-casting bug, the `verbatimModuleSyntax` import errors) were
caught and resolved before I ever ran the project myself, which would
otherwise have required my own debugging cycle.

At the same time, I made a point of reviewing the architectural decisions
critically rather than accepting them by default — for instance, the choice
of `node:sqlite` over a third-party binding, the denormalization approach
used for the orders table, and the allowlist-based approach to preventing
SQL injection via the sort parameter. These are the kinds of design
decisions I would be expected to justify independently in a viva or
interview setting, so I made sure I understood the reasoning behind each
one rather than treating the tool's output as a black box.
