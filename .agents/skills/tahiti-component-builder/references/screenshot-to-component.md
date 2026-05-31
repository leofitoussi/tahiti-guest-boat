# Screenshot to Component Workflow

Use this when the user provides a screenshot, mockup, or visual reference.

## Mandatory Pause

Never code directly from a screenshot. First produce a structure reading and ask the user to validate it.

## Structure Reading

Report:

- Intended component/page family.
- Sections and sub-zones.
- Content hierarchy.
- Heading levels.
- Media roles.
- CTA roles.
- Repeated items.
- Responsive behavior assumptions.
- Existing components that may be reused.
- Sanity fields needed.
- Ambiguities.

## Validation Prompt

Use this format:

```md
Lecture de structure a valider

Type recommande: page-builder block
Composant existant proche: `EditorialBlock`
Structure:
- Eyebrow
- H2 title
- Intro paragraph
- Image
- CTA

Sanity fields:
- title
- intro
- image
- primaryCtaLabel
- primaryCtaLink
- desktopLayout
- mobileLayout

Responsive:
- Desktop: image/text two columns
- Mobile: editor chooses image/text order

Ambiguities:
- Is the image required or optional?
- Should the CTA be primary or secondary?

Recommendation:
Extend `EditorialBlock` with a constrained variant.
```

Wait for user validation before editing code.

## Comparison After Live Render

If the block comes from a screenshot, compare the live result on `/composants` against the screenshot by intention, not pixel-perfect output.

Compare:

- Structure.
- Hierarchy.
- Rhythm.
- Proportions.
- Responsive behavior.
- Content order.
- Readability.
- Premium editorial identity.

Explain intentional differences caused by the design system, accessibility, SEO, or performance.
