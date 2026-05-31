# Sanity and Astro Rules

## Component Classification

Classify before coding:

- Page-builder block for a page unique.
- Fixed template section for a template de page.
- Shared block from a source de verite.
- Archive/listing component.
- Article support component.
- UI primitive or layout helper.

If multiple classifications are plausible, ask the user to choose.

## Reuse-First Decision

Inspect existing implementation before creating a block:

- `src/components/blocks`
- `src/components/cruises`
- `src/components/layout`
- `src/components/ui`
- `schemas`
- `src/components/blocks/PageBuilder.astro`
- relevant query helpers in `src/lib`
- relevant pages in `src/pages`

When reuse, extension, variant, and new block are all plausible, stop and present:

```md
Decision composant a valider

Option recommandee: etendre `ExistingBlock`
Pourquoi: ...
Impact Sanity: ...
Impact design system: ...
Risques: ...

Options:
1. Reutiliser tel quel
2. Etendre le bloc existant
3. Creer une variante controlee
4. Creer un nouveau bloc
```

Do not code until the user chooses, unless only one option is clearly correct.

## Schema Modeling

Model content and intent, not style.

Good fields:

- `title`
- `intro`
- `body`
- `image`
- `items`
- `primaryCta`
- `secondaryCta`
- `desktopLayout`
- `mobileLayout`

Avoid:

- `blueBackground`
- `bigTitle`
- `leftColumnWidth`
- `fontSize`
- `customPadding`
- `mobileImage`

Allowed editor controls:

- Text content.
- Titles.
- Images.
- Links.
- CTA labels.
- Constrained responsive behavior.
- Constrained layout intent such as `text-image` or `image-text`.

Disallowed editor controls:

- Free colors.
- Free spacing.
- Free typography.
- Free CSS.
- Arbitrary animation.

## Responsive Options

Responsive options must be constrained and meaningful. Example for a text/image block:

- `desktopLayout: "image-text" | "text-image"`
- `mobileLayout: "image-text" | "text-image"`

These fields control reading order, not visual styling.

## Object vs Reference

Use nested objects when content belongs to one page or block. Use references when content is a shared source of truth reused across pages.

Examples:

- Page-specific hero content: object.
- Google reviews: shared document/query.
- Why-us arguments reused across templates: shared source of truth.
- CTA inside one section: object.

## Query Rules

- Keep Sanity queries in shared helpers when possible.
- Include `_type` and `_key` for page-builder arrays.
- Add new schema fields to GROQ projections immediately.
- Query only fields the renderer needs.
- Expand references only for blocks that need them.
- Query image metadata needed for rendering: dimensions, lqip, palette only when used.
- Avoid duplicating page-builder projections across pages.

## Astro Rendering Rules

- Use `.astro` for static renderers.
- Use React only for real interactivity.
- Use `Section` and `Container` by default.
- Use `buttonVariants` for CTAs.
- Use semantic HTML and correct heading levels.
- Use `localizeHref` or `localizePath` for internal links when locale-aware.
- Do not wrap every section in cards.

## Existing Schema Changes

Changing an existing schema requires validation when it affects published content.

- Non-breaking optional field with fallback: explain and proceed when clear.
- Rename/removal/type change: ask for validation and propose migration/fallback.
- Any change to a business page document: ask before patching real content.
