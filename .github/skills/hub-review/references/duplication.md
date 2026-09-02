# Duplication Lens

**Goal:** Find guidance restated across `.github/instructions/*.md`, `.github/agents/*.agent.md`, and
`.github/skills/*/SKILL.md` instead of one file holding the canonical version and the others linking to it.

## Evidence rules

- Repetition alone is not a finding — only flag it when the duplicate has already drifted (worded differently
  enough that the two copies could diverge silently without either author noticing), or is substantial enough that
  it is likely to drift over time (more than a couple of sentences of concrete rules, not just a shared theme).
- A short cross-reference ("see `X.instructions.md` for the full workflow") is not duplication — that is the
  correct pattern, not a problem.
- Prefer the more specific or path-scoped file as the source of truth when proposing a fix (an `.instructions.md`
  file for stack/workflow detail, a `SKILL.md` for a cross-cutting practice), and the more general file
  (`copilot-instructions.md`, an `.agent.md` file) as the one that should link to it instead of restating it.

## Review sequence

1. For each substantial rule or section in the in-scope content, search the other instruction-surface files for the
   same content — grep for shared keywords, tool names, or file paths.
2. When a candidate duplicate is found, diff the wording side by side. Identical or near-identical text across two
   or more files is the clearest case; paraphrased-but-equivalent rules still count if they'd need to be updated
   together.
3. Propose which file becomes canonical and the replacement link text for the others.

## Output

Each finding: `lens: duplication`, `location` (all files holding the duplicate), `finding` (what's duplicated and
why it's likely to drift), `status` (with the proposed canonical file if fixed or escalated).
