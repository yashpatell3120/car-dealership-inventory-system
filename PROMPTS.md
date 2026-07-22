# PROMPTS.md — My AI Chat History

This is the log of the prompts I used while building this project with Claude
(Anthropic's AI assistant). I'm including this because the kata brief asks for
the full AI chat history, prompts included, in the root of the project.

I used Claude in an agentic coding session, meaning it had access to a real
terminal and could actually install packages, write files, and run my tests
— not just suggest code in a chat window.

---

### 1. First I just asked it to explain the assignment

I uploaded the kata PDF and asked:

> "Explain me the full project"

Claude read through the brief and gave me back a summary of what was actually
being asked — backend API, frontend SPA, the TDD requirement, the AI
co-authorship rule, and the deliverables list. No code yet, just made sure I
understood the scope before diving in.

### 2. Then I asked it to actually build it

> "give me full project"

This is where the real work started. Claude:

- Checked what Node version was available and tested whether the built-in
  `node:sqlite` module would work, so we wouldn't run into the usual
  native-module install headaches you get with packages like better-sqlite3.
- Built out the whole backend: Express + TypeScript, the database schema,
  the user/vehicle data layer, JWT + bcrypt for auth, middleware for
  protected/admin-only routes, and validation with zod.
- Wrote the test suite (Jest + Supertest) — 35 tests covering registration,
  login, all the vehicle CRUD stuff, search, purchase/restock, and making
  sure non-admins get blocked from admin actions.
- Actually ran the tests and found a TypeScript bug in how the SQLite
  library's return type was being cast — fixed it, reran, all green.
- Ran the build to make sure it actually compiles, then generated a
  coverage report (came out around 92%).
- Built the frontend with Vite, React, and Tailwind — went with a car
  dealership "showroom" theme (dark background, amber accents) instead of
  just using default styling.
- Built the login/register/dashboard pages and all the components (vehicle
  cards, search bar, the admin add/edit form).
- Ran the frontend build and it threw about 15 errors related to
  TypeScript's `verbatimModuleSyntax` setting (basically type-only imports
  needed a different import syntax) — fixed all of them.
- Seeded the database, started the server, and used curl to actually test
  the login endpoint and confirm it returned a real token.

### 3. Continuing the build

> "Continue"

I'd cut it off mid-task last time, so I just said continue and it picked up
where it left off — reran the frontend build to double check nothing broke,
added the .env.example and .gitignore files, generated the test report, and
wrote the README and this file, then packaged everything up.

### 4. Asked what I could add on top of the base requirements

I asked what new features I could add to make the project stand out, and
Claude gave me a list of ideas (order history, sorting, images, deployment
setup, etc.). I said:

> "all"

So it built all three of what I picked:

- **Order history** — added an orders table, hooked it up so every purchase
  gets logged, and added a `/api/orders` endpoint so I can see my own
  purchase history (and admins can see everyone's). Wrote 5 more tests for
  this.
- **Sorting + car photos** — added an image_url field to vehicles, and
  sorting by price/make/stock/newest on the vehicle list and search.
  Updated the seed data with sample photos. Wrote 5 more tests.
- **CI + deployment config** — added a GitHub Actions workflow so tests run
  automatically on every push, and a render.yaml file so I could deploy it
  to Render.com if I wanted to. It also noticed on its own that the
  frontend would need to know the real backend URL once deployed (since
  the local proxy trick only works on localhost) and fixed that too.

Ran everything again after — 45 tests passing, both builds clean, tested
the new sort/image stuff against a running server before calling it done.

### 5. Wrapped up

> "Continue"

Finished the leftover bits — rebuilt the frontend one more time, regenerated
the test report, updated the README with the new features and deployment
instructions, updated this file, and made the git commits for everything
(with the AI co-author tag on each one like the brief asks for).

---

## My honest take on using AI for this

Having an AI that could actually run my code instead of just writing it
caught real bugs before I ever touched the project myself — I probably
would've spent a while hunting down those TypeScript import errors on my
own. It also meant I didn't have to just trust that the code worked; I got
to see the actual test output and a live server responding to real
requests.

That said, I made sure I understood and reviewed the bigger decisions myself
— things like how the database was structured, how the login/admin
permissions worked, what the sort-by-URL-parameter needed to be locked down
against (so someone couldn't sneak SQL into it). I didn't just accept
whatever it built without checking it made sense.
