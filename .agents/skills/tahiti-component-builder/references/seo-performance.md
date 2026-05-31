# SEO and Performance Rules

## Media

Use a reusable Sanity image abstraction when it exists. If it does not exist and the task adds or refactors image-heavy blocks, create it before spreading custom image logic.

Recommended abstraction:

- `src/components/media/SanityImage.astro` or equivalent.
- Inputs: `image`, `width`, `height`, `sizes`, `priority`, `class`.
- Uses `urlForImage`.
- Uses `.width(...)`, `.height(...)` when cropping, `.fit('crop')`, `.quality(...)`, `.auto('format')`.
- Respects Sanity hotspot and crop.
- Never introduces a second mobile image.

## Responsive Crop Policy

Use one Sanity image asset and Sanity hotspot/crop data. Do not add `mobileImage`.

If a subject such as the boat falls near the rule-of-thirds edge and disappears on mobile:

- Use Sanity hotspot/crop as the source of truth.
- Render the same asset at dimensions appropriate to the breakpoint.
- Do not create duplicate assets.
- Do not use CSS-only crop hacks as the primary fix.

## Missing Images

If an image is optional and absent:

- Hide the image area.
- Adapt the layout to the remaining content.
- Do not show a production placeholder.

If the image is required for meaning, make it required in Sanity.

## Loading

- Use `loading="lazy"` and `decoding="async"` by default.
- Use `fetchpriority="high"` only for true first-viewport hero imagery.
- Use explicit `width` and `height`.
- Keep `sizes` accurate.
- Do not download oversized source images for thumbnails.

## SEO

- Preserve public URLs unless explicitly asked.
- Use semantic headings.
- Keep one clear H1 per page context.
- Use real links for CTAs.
- Ensure images have meaningful alt text unless decorative.
- For `/composants`, use `noindex` and do not add it to global navigation.

## JavaScript

- Default to static Astro.
- Add client-side JS only for real interactions.
- Keep embed/video components lazy and user-triggered.
- Do not add sliders, carousels, or animation libraries unless explicitly justified.

## Accessibility

- Use semantic sectioning where useful.
- Keep button vs link semantics correct.
- Ensure overlay components have accessible titles.
- Preserve keyboard access for media and navigation.
- Do not rely on color alone for meaning.
