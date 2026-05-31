# Tahiti Guest Boat Component Patterns

## Local Stack

- Astro 5 with `@sanity/astro`, React only where needed for interactive UI primitives.
- Sanity Studio is configured by `sanity.config.ts` and deployed to `https://tahiti-guest-boat.sanity.studio/`.
- Tailwind v4 tokens live in `src/styles/global.css`.
- Design fonts are `EB Garamond` for headings and `Nunito Sans` for body/UI.
- Core layout primitives are `src/components/layout/Section.astro` and `src/components/layout/Container.astro`.

## Design-System Rules

- Prefer tokens over raw visual values:
  - Colors: `text-foreground`, `text-muted-foreground`, `text-primary`, `bg-background`, `bg-muted`, `border-border`.
  - Radius: `--radius`, `--radius-lg`, `--radius-xl`, etc. are defined. Use `var(--radius-lg)` for standard media corners when a token is required.
  - Spacing: use Tailwind spacing backed by project tokens where possible.
- Use `buttonVariants` from `src/components/ui/button.tsx` for CTA styling.
- Avoid adding decorative frames around icon uploads. Render uploaded icon images directly with `object-contain`, controlled width/height, and no border/background/shadow unless requested.
- Avoid visible explanatory UI copy such as "loaded on click for performance". Implementation details belong in code, not on the page.

## Sanity Block Checklist

When adding a reusable page-builder block:

1. Create `schemas/<blockName>.ts` with `defineType`.
2. Register it in `schemas/index.ts`.
3. Add `defineArrayMember({ type: '<blockName>' })` to the relevant builder field, currently `homePage.pageBuilder`.
4. Add a typed projection in the relevant GROQ query, currently `src/pages/index.astro`.
5. Add a dispatch case in `src/components/blocks/PageBuilder.astro`.
6. Create the Astro renderer in `src/components/blocks`.
7. Run `npm run check`.
8. Run `npm run build` when the page query or routing is touched.
9. Run `npx sanity deploy` when the online Studio must expose the schema.

## Schema Field Guidance

- Use `type: 'string'` for short labels and titles when no inline styling is needed.
- Use a constrained Portable Text array for H2 titles when editors need bold/italic emphasis inside the heading.
- Use existing `richText` from `schemas/portableText.ts` for body copy.
- Use URL validation with `allowRelative: true` for internal CTAs and `scheme: ['http', 'https', 'mailto', 'tel']`.
- Use URL validation without relative URLs for third-party embeds like YouTube.
- Add `preview.select` and `preview.prepare` so page-builder entries are readable in Studio.

## Media Guidance

- Sanity images:
  - Query `asset`, `alt`, and metadata needed by the renderer.
  - Generate URLs through `urlForImage`.
  - Use `.auto('format')`, explicit width/height when cropping, and reasonable quality.
- Icons:
  - Render only when an image exists.
  - Do not show placeholder boxes in production content.
- Video:
  - Use lazy click-to-load embeds for YouTube.
  - Keep the preview link keyboard accessible.
  - Use `youtube-nocookie.com` for embeds.
  - Keep a real YouTube watch URL as the fallback link.
  - Preserve the aspect ratio with `aspect-video`.

## Component Rendering Guidance

- Use semantic headings: if a field is a title for a section, render as `h2`.
- Keep sections mobile-first with single-column layout by default and constrained `max-w-*` containers.
- Do not put sections inside card-like wrappers. Use full-width sections with constrained inner content.
- Use `loading="lazy"` and `decoding="async"` for non-critical images.
- Use `fetchpriority="high"` only for true first-viewport hero imagery.
- Keep scripts scoped and typed in Astro when adding client-side behavior.

## Verification Guidance

- Minimum for code-only or styling changes: `npm run check`.
- Add `npm run build` for Sanity query changes, new routes, schema-aware rendering, or shared block dispatch changes.
- If the local dev server is already running, rely on HMR; otherwise start it with `npm run dev -- --host 0.0.0.0`.
- For hosted Sanity Studio changes, run `npx sanity deploy` and tell the user to hard refresh the Studio.
