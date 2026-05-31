# Design Rules

## Canonical Goal

A coherent component is primarily an Astro/Sanity editorial block. shadcn/ui components are internal primitives used when they serve the block, not the product being built.

## Identity

Translate "epure, premium, editorial" into observable constraints.

### Epure

- Use few decorative surfaces.
- Prefer breathing room over density.
- Avoid unnecessary borders, shadows, icon grids, wrappers, badges, and gradients.
- Make the hierarchy immediately readable.

### Premium

- Use large, intentional photography.
- Use precise alignment and calm grids.
- Keep CTA count low and visible.
- Let typography and spacing carry the design.
- Avoid generic marketing templates, noisy cards, and artificial effects.

### Editorial

- Build a rhythm of title, intro, image, body, and CTA.
- Make long text comfortable to read.
- Use semantic headings and real content hierarchy.
- Treat sections like magazine layouts, not widgets.

## Design System Rules

- Use tokens from `src/styles/global.css`.
- Use semantic Tailwind tokens: `bg-background`, `text-foreground`, `text-muted-foreground`, `text-primary`, `border-border`, `bg-muted`.
- Use project radius tokens such as `var(--radius-control)`, `var(--radius-surface)`, and `var(--radius-panel)`.
- Use `Section` and `Container` for page sections unless a full-bleed section is required.
- Use `buttonVariants` for CTAs.
- Do not add a new token unless a repeated design need cannot be expressed by existing tokens.

## Tailwind 4 and shadcn Rules

- Keep all CSS imports in `src/styles/global.css`.
- `@import` statements must stay before `:root`, `@theme`, `@layer`, or any CSS rules.
- Treat `shadcn/tailwind.css` as Tailwind-processed CSS, not vanilla CSS.
- Use shadcn variants before class overrides.
- Use `className` for layout, not component color or typography overrides.
- Use `gap-*`, not `space-x-*` or `space-y-*`.
- Use `size-*` when width and height are equal.
- Avoid `dark:` utilities. This project is light-only.

## Refusal Triggers

Push back before coding when a request would:

- Add free-form color, spacing, typography, or CSS controls in Sanity.
- Duplicate an existing block without a clear reason.
- Copy Elementor or screenshot CSS instead of rebuilding the structure.
- Add decorative runtime JS or animation without product value.
- Add visible implementation notes such as "lazy loaded for performance".
