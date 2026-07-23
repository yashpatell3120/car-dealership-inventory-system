# PROMPTS.md

AI tool used: Claude (Anthropic). This log documents the prompts used while building this
project, along with the reasoning behind each request, as required by the
AI usage policy.

---

### Prompt 1 — Understanding the problem before solving it

I've been given this kata brief. Before I start writing any code, I want
to fully understand what's being asked — the API design, the frontend
requirements, the testing expectations, and this AI documentation policy.
Can you break down what this actually requires me to build?

Starting implementation without a clear model of the full
scope (auth flow, protected routes, admin permissions, deliverables like
PROMPTS.md and the AI usage section) risks missing requirements discovered
late. Getting a structured breakdown first let me plan the architecture
before writing a single file.

### Prompt 2 — End-to-end implementation

Based on that breakdown, build the complete system — backend and
frontend. For the backend, pick a stack that satisfies the "real
database, not in-memory" requirement without introducing native-dependency
build issues in a constrained environment. Follow TDD: write the tests
that define expected behavior first, then implement against them. For the
frontend, don't default to generic styling — think about what a car
dealership's inventory tool should actually feel like.

Once it's built, don't just hand it to me — actually run the test suite,
run the production build for both services, and do a live smoke test of
the server to confirm the whole thing works end-to-end, not just that it
compiles.



Result: Express + TypeScript backend using Node's built-in node:sqlite
module, JWT + bcrypt auth, role-gated middleware, 35 passing tests
(~92% coverage). React + Vite + Tailwind frontend with a custom dark
"showroom" visual identity. Two categories of bugs were caught and fixed
during this process: a TypeScript type-narrowing issue in the SQLite
repository layer, and ~15 verbatimModuleSyntax import errors in the
frontend — both found by actually running the build, not by inspection.

### Prompt 3 — Closing the loop on deliverables

Continue from where you left off. Go back through the original
requirements list and make sure every deliverable is actually
present — environment config, gitignore, the test coverage report, and
proper documentation. Don't assume anything is done just because the code
works; check it against the checklist.

working code isn't the same as a complete submission — the
kata explicitly grades documentation and process artifacts, not just a
functioning app. This prompt was about closing that gap deliberately.

### Prompt 4 — Extending beyond the minimum

The base requirements are met, but a submission that only does the
minimum doesn't demonstrate much beyond following instructions. What
would meaningfully extend this system — something that shows real data
modeling thought, not just more CRUD? Give me a few options ranked by
what they'd actually demonstrate, and I'll choose.

Then, after reviewing the options:

Implement all of them — the order history, the sorting and imagery, and
the CI/deployment setup. For the order history specifically, think about
whether a purchase record should just reference the vehicle by ID, or
whether it needs to be more resilient than that — what happens to order
history if a vehicle's price changes later, or if it's deleted?

The follow-up question about referencing vs. snapshotting data
was intentional — a naive foreign-key-only order record breaks
historical accuracy the moment a price is edited. Asking the question
directly, rather than accepting whatever schema came first, is what led
to the denormalized orders table (storing make/model/price at time of
sale).

Result: orders table + /api/orders endpoint, sortBy/sortOrder
query parameters validated against a server-side allowlist (to prevent
building unsafe SQL from user input), image_url support with a migration
path for already-existing databases, a GitHub Actions CI workflow, and a
Render.com deployment blueprint. The assistant also independently
identified that the frontend's API client would break in production
without a configurable base URL — a requirement I hadn't explicitly asked
for but that followed logically from adding a deployment target.

### Prompt 5 — Final verification pass

Before calling this finished, go back through everything one more time —
rebuild both services, regenerate the coverage report, and make sure the
documentation actually reflects what was built, not what was originally
planned. Update the commit history to match.

Documentation drift is a real risk when features are added
incrementally — the README and AI usage section needed to describe the
system as it actually ended up, not just the original scope.

### Prompt 6 — Practical deployment troubleshooting

I'm running this locally now and hitting environment-specific issues —
Windows path handling, an environment variable syntax that doesn't work
in cmd.exe the way it does in bash, and image URLs that don't render.
Walk me through diagnosing each of these rather than just giving me a fix
to copy — I want to understand why they're happening.

for issues like the NODE_OPTIONS syntax failing on Windows,
understanding why bash-style inline environment variables don't work in
Command Prompt (versus just being handed the corrected command) matters
for debugging similar issues independently later — the kind of judgment
that's harder to demonstrate if every fix is just handed over pre-solved.

### Prompt 7 — A scoped, self-contained change

I want to switch the currency display from USD to INR. This should be a
purely presentational change — walk me through exactly which files are
involved and why, but implement it yourself so I can see the complete,
correct set of changes rather than guessing which files matter.

Then, on a related follow-up:

Actually, don't implement this one — just tell me the exact files and
line-level changes. I want to make this edit myself.

 The second version was a deliberate shift toward doing the
implementation myself once I understood the scope — using the assistant
to identify where a change needs to happen without having it do the
mechanical part, as a way of actually engaging with the codebase directly
rather than treating it as a black box.

---

## Reflection

Across these sessions, the throughline was treating the assistant as
something to verify against and reason with, not just delegate to
blindly — asking "why" before accepting an architectural decision (the
orders table design, the sort-field allowlist, the database choice),
requiring executable proof (tests run, builds passing, live smoke tests)
rather than static code review, and shifting toward doing changes myself
once I understood the pattern well enough to extend it independently.