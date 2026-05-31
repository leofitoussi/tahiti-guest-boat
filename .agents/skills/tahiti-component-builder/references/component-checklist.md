# Component Checklist

Use this checklist before claiming a component is complete.

## Before Coding

- `CONTEXT.md` read.
- Relevant ADRs read.
- Existing components inspected.
- Existing schemas inspected.
- Existing queries/loaders inspected.
- Screenshot structure validated by user when applicable.
- Reuse/extend/variant/new-block decision validated by user when multiple options are plausible.

## Implementation

- Fields are semantic and content-focused.
- Responsive options are constrained.
- No free style controls in Sanity.
- Schema registered in `schemas/index.ts` if new.
- Correct page builder or template updated.
- GROQ projection includes `_type`, `_key`, and needed fields.
- Image fields include asset, alt, dimensions, lqip or palette only when needed.
- `PageBuilder.astro` dispatch updated when relevant.
- Astro renderer uses project layout primitives and tokens.
- CTAs use `buttonVariants`.
- Images use the reusable Sanity image abstraction when available.
- React is used only for necessary interactivity.

## Live Sanity Validation

A Sanity-connected block is not validated until it is visible on the live site with real Sanity data.

Required:

- Schema deployed to hosted Sanity Studio.
- Block visible and editable in Studio.
- Dummy or real content exists in Sanity.
- Content is rendered by the real site query.
- Block is visible full width on `/composants`.
- `/composants` is `noindex` and not in global navigation.
- One experimental block is validated at a time unless the user asks otherwise.

If `/composants` does not exist:

- Do not create it automatically.
- Say validation is incomplete.
- Ask the user to create it first or explicitly request that infrastructure.

## MCP Sanity

When MCP Sanity is available:

- Load the current Sanity schema first.
- Identify the `/composants` document.
- Identify allowed page-builder block types.
- Create or patch dummy content that exactly matches the deployed schema.
- Never patch business pages unless the user explicitly asks.

When MCP Sanity is unavailable:

- Provide exact manual Studio steps.
- Do not invent payloads.
- Do not mark live validation complete until the user confirms visibility.

Manual fallback format:

```md
Validation manuelle Sanity

1. Ouvre le Studio Sanity en ligne.
2. Va dans le document `/composants`.
3. Ajoute le bloc `{Nom du bloc}`.
4. Remplis les champs:
   - Titre: ...
   - Texte: ...
   - Image: ...
   - CTA label: ...
   - CTA lien: ...
5. Publie le document.
6. Ouvre `/composants`.
7. Verifie desktop, mobile, hotspot/crop, CTA, headings, spacing.
```

## Commands

Minimum:

- `npm run check`

Also run `npm run build` when touching:

- schema-aware rendering
- GROQ queries
- routes
- page-builder dispatch
- shared rendering
- media behavior
- SEO metadata

Run `npx sanity deploy` when hosted Studio must receive schema changes.

## Final Report

Report:

- What was built.
- Which existing component was reused/extended or why a new block was justified.
- Which Sanity fields were added.
- Where dummy content was created or what manual steps remain.
- Live `/composants` validation status.
- Commands run and results.
- Any incomplete validation.
