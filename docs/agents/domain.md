# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- `CONTEXT.md` at the repo root.
- `docs/adr/` for architecture decisions relevant to the area you are about to change.

If a file does not exist, proceed silently.

## File structure

Single-context repo:

```txt
/
├── CONTEXT.md
├── docs/adr/
└── src/
```

## Use the glossary's vocabulary

When naming a domain concept in an issue title, refactor proposal, hypothesis, or test name, use the terms defined in `CONTEXT.md`.

If the concept you need is not in the glossary, treat that as a signal that the vocabulary needs clarification before proceeding.

## Flag ADR conflicts

If an output contradicts an existing ADR, surface the conflict explicitly instead of silently overriding it.
