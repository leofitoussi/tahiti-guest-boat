---
status: accepted
---

# Technical SEO scope for the French-only launch

We are shipping a batch of technical SEO work (canonical URL normalization, sitewide `Organization`/`WebSite` JSON-LD, `BlogPosting` JSON-LD) ahead of publishing the migrated site, while English is a separate workstream landing about a week later (see [ADR-0002](./0002-english-site-under-en-with-linked-translations.md)). Two items were deliberately left out of this pass:

- **Cross-locale hreflang/canonical alternates**: not added yet because no `/en` routes exist to point to. Adding `alternatePaths`/hreflang now would either self-reference only or link to pages that don't exist. Revisit once ADR-0002's `/en` routes ship.
- **`BreadcrumbList` structured data**: deferred to a separate chantier, because there is no visible breadcrumb UI anywhere on the site today, and shipping the JSON-LD without a matching visible trail falls short of Google's guidance. It needs an actual UI component, not a quick markup addition.

`theme-color` and `apple-touch-icon` were also cut from this batch — not for the same structural reasons, just to avoid spending launch time on a color pick and a missing PNG asset (current favicon is SVG, unsuitable for `apple-touch-icon` on iOS).
