# XTM Hub — Coding Agent Instructions

Shared, repository-wide context. Anything scoped to a single area lives in
[`.github/instructions/`](instructions/) and is applied automatically by path.

| Scope | File |
| --- | --- |
| `apps/backend/**` | [`backend.instructions.md`](instructions/backend.instructions.md) |
| `apps/frontend/**` | [`frontend.instructions.md`](instructions/frontend.instructions.md) |
| `apps/e2e/**` | [`e2e.instructions.md`](instructions/e2e.instructions.md) |
| Schema, resolvers, Relay operations | [`graphql.instructions.md`](instructions/graphql.instructions.md) |
| Knex / Elasticsearch migrations, seeds | [`migrations.instructions.md`](instructions/migrations.instructions.md) |
| `*.test.ts(x)`, `*.utils.ts` | [`testing.instructions.md`](instructions/testing.instructions.md) |
| Workflows, Docker, Helm | [`ci.instructions.md`](instructions/ci.instructions.md) |

Deeper task guidance lives in [`.github/skills/`](skills/) and
[`.github/agents/`](agents/).

This content drifts as the codebase changes. Use the [`hub-review`](skills/hub-review/SKILL.md) skill to audit it
against the real code — it asks a question (or flags a PR comment) instead of guessing when something doesn't match.

## Review

1. You must use the skill `hub-review`.
2. Follow the workflow.

## Critical rules

See [`AGENTS.md`](../AGENTS.md#critical-rules) for the repo's mandatory coding rules (console.log, generated output,
versions, UI library, GraphQL regeneration) — that file is the canonical, cross-tool source. It defers in turn to
[`.github/skills/coding-conventions/SKILL.md`](skills/coding-conventions/SKILL.md) for the baseline (no `console.log`,
`_`-prefix unused variables, strict typing, no `as never`/unjustified casts).

## What this is, setup, and validation

See [`AGENTS.md`](../AGENTS.md) for the stack overview, workspace table, `corepack`/`yarn install` setup, local
infrastructure (`docker compose`), dev servers, and the `test:ci` validation commands — that file is the canonical
source so it stays accurate for every tool that reads it, not just Copilot.

The pre-commit hook runs `yarn lint-staged --config .lintstagedrc.cjs` once from the root; it dispatches ESLint and
Prettier to whichever workspaces the staged files belong to.

## The one data flow to understand

The GraphQL schema is authored in the backend and flows to the frontend. Backend `.graphql` files feed
`yarn generate:ts` (resolver types) and, when the API starts outside production, are written out to
`apps/frontend/schema.graphql`, which `yarn relay` compiles into `apps/frontend/__generated__/`. Full detail in
[`graphql.instructions.md`](instructions/graphql.instructions.md).

**After any GraphQL change**, run `yarn workspace @xtm-hub/backend generate:ts` and
`yarn workspace @xtm-hub/frontend relay`. Skipping the second step is the most common cause of confusing frontend
type errors.

## Pitfalls

- **Yarn version mismatch** — always `corepack enable` first.
- **Missing Relay artifacts** — run `yarn relay` after any GraphQL change or before a frontend build.
- **Bogus `@public/*.svg` type errors** — `next-env.d.ts` is generated and gitignored. Run
  `yarn workspace @xtm-hub/frontend next typegen` before `check-ts` on a fresh checkout.
- **E2E failures** — the frontend (:3002) and backend (:4002) must already be running.
- **Test database** — backend tests use `test_database`, not `cloud-portal`, when `VITEST_MODE=true`, and Vitest runs
  with `fileParallelism: false`.
- **Frontend ports** — 3002 in development, 3000 inside the production container.
- **TypeScript ESLint version warning** — non-blocking, ignore it.
- **Three-day dependency age gate** — a brand-new package release will fail to install until it ages out.

<!-- filigran-conventions:start -->

## Commit, PR & issue conventions

All commits, pull requests and issues in this repository follow the
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
specification with a GitHub issue reference:

```
type(scope?)!?: description (#issue)
```

- Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`,
  `build`, `ci`, `revert`.
- The description starts with a lowercase letter and has no trailing period; preserve acronyms and proper nouns.
- Pull request titles **must** end with the related issue reference, e.g.
  `(#1234)`, and every pull request must be linked to an issue.
- Sign your commits.

When generating commit messages, PR titles or issue titles, always follow this convention. See [
`.github/LABELS.md`](.github/LABELS.md) for the full title and label taxonomy.
<!-- filigran-conventions:end -->


<!-- filigran-model-policy:start -->

## GitHub Copilot model usage

To keep token consumption under control, pick the model that matches the task:

- **Opus 4.6** — reserve for complex work: deep reasoning, large refactors, architecture design, tricky debugging. It is
  significantly more token-expensive, so it is not the daily driver.
- **Sonnet / Gemini / GPT** — default for everyday tasks: autocomplete, small fixes, quick questions, code explanations.

We have a limited token budget — being mindful of the model you pick makes a real difference at scale. Think of Opus as
a specialist you call in when you really need it.
<!-- filigran-model-policy:end -->
