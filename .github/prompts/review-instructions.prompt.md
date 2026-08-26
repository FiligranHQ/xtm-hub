---
mode: agent
description: Audit .github/copilot-instructions.md, AGENTS.md, .github/instructions/, .github/agents/ and .github/prompts/ for drift against the real codebase — ask a question or flag a PR comment instead of silently guessing when a claim doesn't match the code.
---

# Review AI instructions for drift

Documentation drift is worse than no documentation: a wrong claim gets trusted and repeated by every
agent that reads it. This prompt has two things to check for a target of source files (all instructions/
agents/prompts, or the ones touched by a specific PR/diff if you were pointed at one):

1. **Objective breakage** — broken paths, renamed commands, dead `applyTo` globs. Fix these directly, no
   question needed.
2. **Behavioral drift** — a doc describes how the code works or what convention to follow, and the real
   code contradicts it, or two authoritative sources (an instructions file, a custom agent, a skill)
   disagree with each other. Do not silently pick a winner here — see "Raising a question" below.

## Steps

1. **Run the mechanical harness**: `yarn check:ai-instructions`. It catches broken `applyTo` globs,
   `yarn workspace @xtm-hub/<app> <script>` references to scripts/binaries that no longer exist, and
   backtick-quoted paths that don't resolve under the repo root or any app directory. Fix everything it
   reports directly — these are objective and safe.

2. **Pick your scope.**
   - If you were asked to review a specific PR or diff: read the changed files, and for each one, find
     the instructions file(s) whose `applyTo` glob covers it (`.github/instructions/*.md`), the custom
     agent that would normally write that kind of file (`.github/agents/*.agent.md`), and any relevant
     skill (`.github/skills/*/SKILL.md`). Check whether the diff's code follows what those docs claim.
   - Otherwise: do a general audit. Read each instructions/agent/prompt file and, for every concrete claim
     about behavior (not just paths/commands — those are step 1's job), sample a handful of real,
     representative files in the area it covers and check the claim still holds. Prioritize files most
     likely to have drifted: anything describing a convention that looks mid-migration (two competing
     patterns both still present), or duplicated across two files that could have been edited
     independently.

3. **Cross-check for contradictions between sources.** The same fact (stack, preferred pattern, naming
   rule) sometimes lives in more than one file (a `.github/instructions/*.md` file, its matching
   `.github/agents/*.agent.md`, `AGENTS.md`, `copilot-instructions.md`). If two of them say different
   things, that's drift even if each one is individually plausible.

4. **Classify what you find:**
   - **Unambiguous drift** — the doc is simply stale (a file moved, a script was renamed, a number is out
     of date) and the codebase is clearly the source of truth. Fix the doc directly.
   - **Ambiguous drift** — you cannot tell whether the doc is stale or the code is the aberration; the
     "fix" requires a judgment call about team intent (e.g. a convention that's mid-migration, or one doc
     saying "always X" while another says "prefer X, Y is still fine"). Do **not** silently resolve this
     by guessing which side is right.

5. **Raise ambiguous drift instead of guessing:**
   - **Reviewing a PR** (a specific PR/diff is in scope): use `add_pr_review_comment` to flag it inline
     on the file/line where the contradiction is visible — state what the doc says, what the code does,
     and ask which is correct. If you're replying inside an existing review thread, use
     `reply_and_resolve_review_thread` instead once the author has answered.
   - **General audit with a user in the session**: use `ask_user` with the specific discrepancy (what the
     doc says, what the code does, and the realistic options) rather than picking one.
   - **Unattended** (no user, no PR in scope — e.g. invoked from automation with nobody to ask): open a
     GitHub issue describing the discrepancy precisely (files/lines, the doc claim, the counter-example in
     code, why it's ambiguous) instead of leaving it undocumented or guessing.

6. **Summarize**: what you fixed directly (with file references), what questions you raised and where
   (chat, PR comment, or issue link), and what's still open.

## Constraints

- Never resolve an ambiguous contradiction by editing docs to match whichever side you personally find
  more plausible — that's how drift gets silently baked in as "fixed."
- Don't restate this prompt's checks as new content in the docs themselves; this prompt is the review
  process, not a place to duplicate instructions content.
- Keep the diff small: fix only what's actually wrong, don't rewrite surrounding prose while you're in a
  file.
