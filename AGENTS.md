# AGENTS.md

Instructions for AI coding agents (Claude Code, Cursor, Copilot, Codex, etc.) working on **EcoSpark Hub**. Read this first, then the linked docs. Put a copy in the root of both repos.

## 1. Project Summary

EcoSpark Hub is a portal where members submit sustainability ideas and admins approve or reject them. Approved ideas are public and can be voted on and commented on. Some ideas are **Paid** and require payment to view in full.

- **Roles:** `ADMIN`, `MEMBER`, plus unauthenticated visitors
- **Idea status:** `DRAFT -> UNDER_REVIEW -> APPROVED | REJECTED` (rejected ideas can be edited and resubmitted)
- **Repos:** `ecospark-client` (Next.js + Tailwind) and `ecospark-server` (Express + Prisma + PostgreSQL)

## 2. Read These Docs First

| File | Use it for |
|---|---|
| `EcoSpark-Hub-PRD.md` | What to build (requirements, priorities) |
| `ARCHITECTURE.md` | How the system, database, auth and flows work |
| `DESIGN_SYSTEM.md` | Colors, typography, components (client) |
| `RULES_AND_SKILLS.md` | Detailed coding rules and step-by-step playbooks |
| `README.md` | Setup and live URLs |

If the code and the PRD disagree, **stop and ask** instead of guessing.

## 3. Setup and Commands

**Server (`ecospark-server`)**
```bash
npm install
cp .env.example .env            # fill in values
npx prisma migrate dev          # apply migrations
npx prisma db seed              # admin user + default categories
npm run dev                     # start API (default :5000)
npm run build                   # type-check and compile
```

**Client (`ecospark-client`)**
```bash
npm install
cp .env.example .env.local
npm run dev                     # start app (default :3000)
npm run build                   # production build
npm run lint
```

Before finishing any task, run the build (and lint on the client) and fix errors.

## 4. Project Structure

**Server:** `src/modules/<name>/{routes,controller,service,validation}.ts`, plus `middlewares/`, `utils/`, `config/`, `routes/index.ts`. Database lives in `prisma/schema.prisma`.

**Client:** `src/app/` (routes), `src/components/{ui,layout,home,ideas,comments,dashboard,shared}`, `src/services/` (API calls), `src/lib/`, `src/hooks/`, `src/context/`, `src/types/`, `src/middleware.ts`.

## 5. Code Conventions

- **TypeScript everywhere.** No `any` without a comment explaining why.
- Small, single-purpose functions; clear names over comments.
- Never hardcode secrets or URLs. Use env vars and update `.env.example`.
- Make the **smallest change** that solves the task. Do not refactor unrelated code.
- Do not add a dependency if the existing ones can do the job.

### Server
- Flow is **routes -> controller -> service -> Prisma**. Controllers never call Prisma.
- Validate every body, query and param with **Zod** via `validateRequest`.
- Wrap controllers in `catchAsync`; throw `ApiError(status, message)`; reply with `sendResponse` (`{ success, message, data, meta? }`).
- Protect routes with `auth` then `role("ADMIN")`; check ownership in the service.
- Schema changes need a migration. Update `seed.ts` if defaults change.

### Client
- App Router. Server Components by default; add `"use client"` only when needed.
- Style with Tailwind only; reuse `components/ui`. Follow `DESIGN_SYSTEM.md` tokens.
- All API calls go through `lib/api.ts` / `services/`.
- Every async action needs a **loading state** and a **clear error message**.
- Forms use React Hook Form + Zod. Pages must work at 375px, 768px and 1280px.

## 6. Business Rules You Must Not Break

1. Members can edit or delete an idea **only** when it is `DRAFT` or `REJECTED`.
2. Only `APPROVED` ideas appear in public queries.
3. Approve and reject work only from `UNDER_REVIEW` (else `409`). Reject **requires** feedback.
4. Rejection feedback is visible only to the idea's author and admins.
5. Full content of a paid idea goes only to the author, admins, or a user with a `PAID` payment for it.
6. One vote per user per idea (`@@unique([userId, ideaId])`). Switching or removing a vote must never create duplicates.
7. Payments: **never trust the client.** Grant access only after the server verifies the gateway callback. Callbacks must be idempotent (unique `transactionId`).
8. Deactivated users cannot log in or call protected routes.
9. Never return `passwordHash` or log passwords, tokens or gateway secrets.

## 7. Workflow

1. Read the relevant docs and the files you will change.
2. For non-trivial work, state a short plan before editing.
3. Implement in small steps; keep each step buildable.
4. Test the happy path **and** failure paths (validation error, unauthorized, forbidden, not found).
5. Run build and lint; fix all errors and remove stray `console.log`.
6. Update `README.md` or `.env.example` if setup or config changed.
7. Summarize what changed and anything left undone or uncertain.

## 8. Git and Commits

- One logical change per commit; commit often (target 30+ per repo).
- Format: `type: imperative summary`, with types `feat`, `fix`, `style`, `refactor`, `docs`, `chore`, `test`.
  - Examples: `feat: add idea voting endpoint`, `fix: prevent duplicate votes`
- Never commit `.env`, `node_modules`, build output or credentials.
- Do not force-push or rewrite history on `main`. Use `feat/<name>` branches.

## 9. Boundaries

**Always**
- Enforce permissions on the server, even if the UI also hides the action.
- Validate input on both client and server.
- Keep the UI consistent with the design system.

**Ask first**
- Changing the Prisma schema in a way that affects existing data
- Adding a new dependency or changing the auth or payment approach
- Any behavior that differs from the PRD

**Never**
- Skip validation or authorization to save time
- Expose feedback, paid content or password data to the wrong user
- Commit secrets or real payment credentials
- Invent endpoints or fields not in the PRD without saying so
- Copy code from other projects (plagiarism means zero marks for this assignment)

## 10. Definition of Done

- [ ] Works for the correct role and is blocked for the wrong one
- [ ] Validated on client and server
- [ ] Loading, empty and error states handled
- [ ] Responsive on mobile and desktop
- [ ] Build and lint pass, no console errors
- [ ] Committed with a clear message
- [ ] Docs or `.env.example` updated if needed

## 11. When Unsure

Prefer the PRD and `ARCHITECTURE.md`. If they do not answer it, make the safest, simplest choice, say what you assumed, and ask the user to confirm.