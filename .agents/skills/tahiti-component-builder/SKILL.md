---
name: tahiti-component-builder
description: Create or update reusable Tahiti Guest Boat components and Sanity page-builder blocks. Use when building Astro components, Sanity schemas, page builder sections, responsive blocks, image/video integrations, Studio fields, or design-system-aligned UI for this project.
---

# Tahiti Component Builder

Use this skill to create project-native Astro/Sanity components for Tahiti Guest Boat.
Start by reading `references/project-patterns.md` when the task involves a new or changed page-builder block, schema field, media component, or reusable UI section.

## Workflow

1. Inspect the current implementation before editing:
   - Relevant Astro component folder: `src/components/blocks`, `src/components/cruises`, `src/components/layout`, `src/components/ui`.
   - Relevant Sanity files: `schemas`, `schemas/index.ts`, and any page document using the block.
   - Relevant data flow: page GROQ query, `PageBuilder.astro`, component props, and helper libs under `src/lib`.

2. Keep the implementation aligned with local architecture:
   - Use `Section` and `Container` for page sections unless the existing section deliberately uses a custom layout.
   - Use `buttonVariants` for links/buttons that should match the design system.
   - Use `urlForImage` for Sanity images and request explicit dimensions/quality/format.
   - Use Portable Text only where editors need rich emphasis; use string fields for plain labels, URLs, and operational values.

3. For Sanity-connected blocks:
   - Add or update the object schema.
   - Register new schemas in `schemas/index.ts`.
   - Add the block type to the relevant builder array, usually `schemas/homePage.ts`.
   - Add GROQ fields in the page query.
   - Add a `PageBuilder.astro` dispatch case.
   - Deploy the online Studio with `npx sanity deploy` when the user uses hosted Sanity Studio.

4. For rendering:
   - Build mobile-first and verify desktop widths with existing container tokens.
   - Use design tokens from `src/styles/global.css`; do not invent radius, color, spacing, or font values when a token exists.
   - Do not add instructional helper text to the UI unless the user explicitly asks.
   - Do not add visual wrappers, shadows, borders, backgrounds, or placeholders around uploaded icons unless requested.
   - Preserve accessibility: semantic headings, useful alt text, keyboard-accessible media controls, and real links.

5. Validate before finishing:
   - Run `npm run check`.
   - Run `npm run build` when the change touches routing, queries, schema, or shared rendering.
   - If Sanity schema changed and the user works in hosted Studio, run `npx sanity deploy`.
   - Report the exact commands that passed and any deployment URL or manual refresh needed.

## Reference

Read `references/project-patterns.md` for concrete local conventions, examples, and common pitfalls from previous component work.
