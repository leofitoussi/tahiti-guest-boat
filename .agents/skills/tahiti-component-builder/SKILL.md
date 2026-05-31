---
name: tahiti-component-builder
description: Builds coherent Tahiti Guest Boat Astro/Sanity components with project design-system, shadcn/Tailwind v4, SEO, performance, and CMS rules. Use when creating or refactoring reusable sections, page-builder blocks, Sanity schemas, screenshot-based UI, editorial/premium layouts, media blocks, forms, navigation, or design-system-aligned components for this repo.
---

# Tahiti Component Builder

Use this skill as a strict production workflow for creating or refactoring Tahiti Guest Boat components. Do not improvise UI, schemas, or data flow before completing the relevant gates.

## Required Inputs

If the request is missing a key decision, ask one concise question before coding. If the answer is discoverable in the repo, inspect the repo instead.

- Target surface: homepage, page unique, template de page, archive de page, article, navigation globale, or shared block.
- Source: screenshot, existing component, Sanity document/schema, written brief, or legacy page.
- CMS need: static component, Sanity-connected block, shared global content, or fixed template field.
- User validation need: required for screenshot-derived structure and any ambiguous visual hierarchy.

## Workflow Gates

1. Read project context:
   - `CONTEXT.md`
   - relevant `docs/adr/*`
   - existing components in `src/components`
   - relevant schemas in `schemas`
   - relevant queries/loaders in `src/lib` and `src/pages`

2. Classify the component:
   - Page-builder block for page unique.
   - Fixed template section for croisiere or article.
   - Shared block driven by `siteSettings` or a dedicated shared document.
   - UI primitive/composition using shadcn.
   - Pure layout helper.

3. If starting from a screenshot:
   - Identify structure, hierarchy, content zones, media, CTA, responsive behavior, and Sanity fields.
   - Present the proposed block map to the user and wait for validation before coding.
   - See `references/screenshot-to-component.md`.

4. Design before code:
   - Choose the simplest visual pattern that matches "epure, premium, editorial".
   - Use the project design tokens and shadcn semantic tokens.
   - Reject raw colors, arbitrary typography, dark mode, visual gimmicks, and duplicated one-off CSS.
   - See `references/design-rules.md`.

5. Model content before UI:
   - Define editor-owned fields by meaning, not presentation.
   - Decide object vs reference.
   - Decide Portable Text vs string.
   - Decide whether the block belongs in a page builder, fixed template, or shared source of truth.
   - See `references/sanity-astro-rules.md`.

6. Implement in the repo's data flow:
   - Schema file in `schemas/*` when needed.
   - Register in `schemas/index.ts`.
   - Add to the correct builder/template only.
   - Add GROQ projection in the shared query/helper.
   - Add `PageBuilder.astro` dispatch when relevant.
   - Add Astro renderer using `Section`, `Container`, `buttonVariants`, `urlForImage`.
   - Keep React only for real client interactivity.

7. Optimize by default:
   - Semantic HTML and heading order.
   - Useful alt text strategy.
   - Lazy images except first-viewport hero.
   - Explicit Sanity image dimensions, quality, and `auto('format')`.
   - Minimal JS and no decorative runtime dependency.
   - See `references/seo-performance.md`.

8. Verify:
   - Run `npm run check`.
   - Run `npm run build` for schema, query, route, page-builder, media, SEO, or shared rendering changes.
   - Run `npx sanity deploy` only when hosted Studio must receive schema changes and the user expects deployment.
   - Report exact validation commands and any unverified items.

## Hard Rules

- Preserve public URLs unless explicitly asked.
- Use `CONTEXT.md` vocabulary in naming and explanations.
- Use Tailwind v4 imports only in `src/styles/global.css`; all `@import` stay before CSS rules.
- Do not add new design tokens unless existing tokens cannot express a repeated need.
- Do not copy Elementor or screenshot CSS; rebuild structure with project primitives.
- Do not put implementation notes into visible UI copy.
- Do not create a second similar block when an existing block can be extended cleanly.

## References

- `references/design-rules.md`
- `references/sanity-astro-rules.md`
- `references/screenshot-to-component.md`
- `references/seo-performance.md`
- `references/component-checklist.md`
