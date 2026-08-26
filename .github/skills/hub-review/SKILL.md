---
name: hub-review
description: >-
  Reviews the XTM Hub AI-instruction surface — `.github/copilot-instructions.md`, `AGENTS.md`,
  `.github/instructions/*.md`, `.github/agents/*.agent.md`, `.github/skills/*/SKILL.md`, `.github/prompts/*.md` —
  for drift against the real codebase and against each other. Use when asked to review AI instructions, docs, agents,
  skills, or prompts; when reviewing a PR/diff that touches any of those paths; or when directed here as
  `skill:hub-review` from another instruction (e.g. the reviewer agent's "Documentation drift" step). Never invoke
  this uninvited on edits you just made without being asked.
---

# Hub Review

Review the AI-instruction surface through four lenses, each a distinct check with its own evidence bar. Report only
what you actually verified — never pad a report to look thorough, and never claim drift you did not confirm by
reading the referenced file, command, or code.

## Scope

Determine what is in scope before starting:

- **PR / diff review** — only the instruction-surface files the diff touches, plus anything they reference that the
  diff did not update (a changed convention with a stale cross-reference elsewhere).
- **Named file(s)** — whatever the caller pointed at.
- **Full audit** — every file under `.github/instructions/`, `.github/agents/`, `.github/skills/`,
  `.github/prompts/`, plus `.github/copilot-instructions.md` and `AGENTS.md`.

## Lenses

1. **Stale reference** — a backtick-quoted path, `yarn <script>` / `yarn workspace @xtm-hub/<name> <cmd>` command,
   `applyTo` glob, or version literal that no longer resolves in the repo. Verify with `grep`/`glob`/`view`
   (path exists, script exists in the relevant `package.json`'s `scripts` or `dependencies`, glob matches at least one
   real file) before flagging — don't guess from the file name alone.
2. **Contradiction** — two authoritative sources disagree on the same situation: an instructions file vs. a custom
   agent, an agent vs. a skill, or a prompt vs. the instructions it's supposed to follow. Quote both sides.
3. **Code-usage mismatch** — a documented convention or pattern the real code no longer follows, or a convention the
   code has adopted that no doc captures. Sample actual usage (grep for the pattern, read a representative file)
   before concluding drift either way.
4. **Duplication** — content restated across instructions/agents/skills instead of one file linking to the other as
   the single source of truth. Not every repetition is a problem — call it out only when it has already drifted, or
   is likely to (the same rule phrased two different ways).

## Execution

1. Resolve scope per above and load the in-scope files.
2. Run each applicable lens against that content. Skip a lens with nothing to check (e.g. no version literals in
   scope) rather than forcing a finding.
3. Classify every finding:
   - **Unambiguous** — a path/command/glob that objectively does not resolve, an exact stale literal (a hardcoded
     version that contradicts the "reference `.nvmrc`/`packageManager`/catalog" rule), or a duplicate paragraph with
     an obvious single source of truth. Fix it directly.
   - **Ambiguous** — the two sides of a contradiction are both plausible, resolving it requires a product/architecture
     decision, or the convention looks mid-migration (some code follows the old pattern, some the new one, and it's
     unclear which the docs should mandate). Do not silently pick a side.
4. Report ambiguous findings depending on context, and never resolve them yourself:
   - Reviewing a PR/diff: use `add_pr_review_comment` on the relevant line, and `reply_and_resolve_review_thread`
     once the author responds.
   - Interactive session with a user present, no PR in scope: use `ask_user` with the concrete question, not a vague
     "does this look right?".
   - Unattended (no PR, no user to ask): open a GitHub issue describing the drift and where it was found.
5. Summarize: which files/lenses were checked, what was fixed directly, and what was escalated and how.

## Output

A short report grouped by lens. Each finding states its location, what's stale/contradictory/mismatched, and either
the fix already applied or how it was escalated. `0 findings` for a lens is a valid, and expected, result — do not
invent a finding to avoid reporting a clean pass.
