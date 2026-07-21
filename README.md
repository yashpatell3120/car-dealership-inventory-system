# Ironclad Motors — Car Dealership Inventory System

A full-stack inventory management system for a car dealership: token-authenticated
users can browse and search vehicles and purchase them; admins can add, edit,
delete, and restock inventory. Built as a TDD kata.

- **Backend**: Node.js, TypeScript, Express, SQLite (via Node's built-in `node:sqlite`), JWT auth
- **Frontend**: React, TypeScript, Vite, Tailwind CSS v4
- **Testing**: Jest + Supertest, 35 tests, ~92% statement coverage on the backend

---

## Project structure

```
car-dealership/
├── backend/          Express API, SQLite database, JWT auth, tests
├── frontend/          React + Vite + Tailwind SPA
├── TEST_REPORT.txt   Latest backend test run + coverage output
└── PROMPTS.md         AI chat/prompt history for this project
```

---

## Setup & running locally

### Prerequisites
- Node.js 22+ (this project uses Node's built-in `node:sqlite` module, which requires Node 22.5+ and is currently marked experimental — you'll see a harmless `ExperimentalWarning` in the console, which is expected)
- npm

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # adjust JWT_SECRET etc. if you like
npm run seed               # creates the SQLite DB + demo admin/user accounts + sample vehicles
npm run dev                 # starts the API on http://localhost:4000
```

Demo accounts created by the seed script:

| Role  | Email                  | Password       |
|-------|-------------------------|----------------|
| Admin | admin@dealership.com    | AdminPass123   |
| User  | user@dealership.com     | UserPass123    |

Run the test suite:

```bash
npm test               # run all tests
npm run test:coverage  # run tests with a coverage report
```

Build for production:

```bash
npm run build
npm start
```

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev   # starts the SPA on http://localhost:5173, proxying /api to :4000
```

Open http://localhost:5173, log in with one of the demo accounts above (or register
a new one — new accounts default to the `user` role), and browse the inventory.

Build for production:

```bash
npm run build
npm run preview
```

---

## API overview

| Method | Endpoint                         | Auth          | Description                          |
|--------|-----------------------------------|---------------|----------------------------------------|
| POST   | `/api/auth/register`              | —             | Create an account                     |
| POST   | `/api/auth/login`                 | —             | Log in, receive a JWT                 |
| GET    | `/api/vehicles`                   | user          | List all vehicles                     |
| GET    | `/api/vehicles/search`            | user          | Filter by make/model/category/price   |
| POST   | `/api/vehicles`                   | user          | Add a vehicle                         |
| PUT    | `/api/vehicles/:id`                | user          | Update a vehicle                      |
| DELETE | `/api/vehicles/:id`                | admin         | Delete a vehicle                      |
| POST   | `/api/vehicles/:id/purchase`       | user          | Decrease quantity                     |
| POST   | `/api/vehicles/:id/restock`        | admin         | Increase quantity                     |

All protected routes require an `Authorization: Bearer <token>` header.

---

## Design notes

- **Database**: I used Node's built-in `node:sqlite` module rather than a third-party
  binding like `better-sqlite3`. It's a real, file-backed, persistent SQLite database
  (not in-memory), and avoids native-module build issues while keeping the same
  synchronous, prepared-statement API style.
- **Auth**: passwords are hashed with bcrypt; JWTs carry `userId`, `email`, and `role`
  and are verified on every protected route via middleware. Admin-only routes layer
  a second `requireAdmin` check on top of `requireAuth`.
- **Validation**: request bodies are validated with `zod` schemas before touching the
  database layer.
- **Frontend**: a small "showroom" visual identity (graphite background, amber/teal
  accents, condensed display type) rather than default component-library styling,
  built with Tailwind v4.

---

## My AI Usage

**Tools used:** Claude (Anthropic), used directly in an agentic coding session with
file-system and terminal access.

**How I used it:**
- I used Claude to scaffold the entire project end-to-end: the Express/TypeScript
  backend structure (routes, middleware, repository layer, validation schemas), the
  Jest/Supertest test suite (written and run before/alongside the implementation in a
  red-green loop), and the React/Vite/Tailwind frontend (pages, components, API
  client, auth context).
- I asked Claude to research and choose a SQLite approach that would avoid
  native-binding install issues in a constrained sandbox — it landed on Node's
  built-in `node:sqlite` module after testing it directly, rather than assuming
  `better-sqlite3` would work.
- I had Claude actually run the test suite, the TypeScript build for both backend and
  frontend, and a live smoke test of the running server (health check, login, JWT
  issuance) rather than just generating code it assumed would work — several bugs
  (a TypeScript casting issue in the SQLite repository layer, `verbatimModuleSyntax`
  type-import errors across ~10 frontend files) were caught and fixed this way before
  delivery.
- I asked for a deliberate, non-templated visual design for the frontend (a
  "dealership showroom" aesthetic) rather than default Tailwind styling.

**Reflection:** Using an agentic coding assistant that can install dependencies, run
tests, and inspect real output (rather than just generate code from a prompt) caught
real bugs before I ever ran the project myself — the type-import errors in particular
would have been a tedious one-by-one fix cycle. The main thing I had to stay
deliberate about was architecture decisions (e.g., the database approach, validation
strategy, auth middleware layering) — I reviewed and directed those rather than
accepting the first suggestion, since that's where judgment matters most.

---

## Test report

See [`TEST_REPORT.txt`](./TEST_REPORT.txt) for the latest full test run and coverage
output (35/35 tests passing, ~92% statement coverage on the backend). Regenerate it
anytime with `npm run test:coverage` in `backend/`.

## Screenshots

_Add screenshots of the running application here (login screen, dashboard, admin
add/edit forms) before submitting._
