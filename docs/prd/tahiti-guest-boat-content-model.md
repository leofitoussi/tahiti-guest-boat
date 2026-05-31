# PRD: Clarify and refactor the Sanity-driven content model for the site

## Problem Statement

The current site structure has drifted into overlapping content models: some pages behave like one-off landing pages, some behave like shared templates, and the blog is meant to support the commercial pages without becoming the main acquisition surface. The result is a confusing editing model in Sanity, duplicated behavior in the frontend, and unclear ownership of shared blocks versus page-specific content.

## Solution

Refactor the content architecture so the site has a clear and stable model:

- Unique pages such as the homepage, the boat page, contact, and legal pages remain editable from Sanity.
- Homepage, boat page, and contact use a free page builder so sections can be added, removed, and reordered from Sanity.
- Legal pages use a simple Portable Text body only.
- Cruise pages under `/nos-croisieres/*` use a fixed-order template, with each cruise editing only its own content.
- Shared blocks such as Google reviews and the "Why choose Tahiti Guest Boat" section are managed once in Sanity and reused by reference across pages and templates.
- `/nos-croisieres/` becomes a collection archive page.
- The blog remains a secondary SEO channel with a uniform article template and explicit links to one primary cruise plus optional secondary cruises.
- Site-wide navigation, CTA, logo, and contact details are centralized in a single `site settings` document in Sanity.
- All current public URLs are preserved.

## User Stories

1. As a site editor, I want to edit the homepage in Sanity as a flexible stack of sections, so that I can add, remove, and reorder content without changing code.
2. As a site editor, I want to edit the boat page in Sanity as a flexible stack of sections, so that I can keep the page current without rebuilding the template.
3. As a site editor, I want to edit the contact page in Sanity as a flexible stack of sections, so that I can adjust its content without touching the frontend.
4. As a site editor, I want legal pages to be stored as plain rich text, so that I can manage policy content without unnecessary page-builder complexity.
5. As a site editor, I want to update privacy and cookies pages from Sanity, so that legal content stays centralized and maintainable.
6. As a site editor, I want cruise pages to use a shared template, so that all cruise pages keep a consistent structure.
7. As a site editor, I want each cruise page to edit only its own content, so that page-specific details do not affect other cruises.
8. As a site editor, I want the cruise template to keep a fixed section order, so that the experience stays predictable and consistent.
9. As a site editor, I want shared blocks like Google reviews to be edited once in Sanity, so that changes propagate everywhere they are used.
10. As a site editor, I want shared trust sections like "Why choose Tahiti Guest Boat" to be edited once in Sanity, so that I do not duplicate the same content across pages.
11. As a site editor, I want the related cruises block to update dynamically, so that the page always shows current alternatives and excludes the current cruise.
12. As a site visitor, I want `/nos-croisieres/` to act as an archive of available cruises, so that I can browse the current offerings in one place.
13. As a site visitor, I want blog articles to follow a consistent structure, so that I can scan them easily and find supporting information quickly.
14. As a site visitor, I want blog articles to link to one primary cruise when relevant, so that I can move from informational content to a booking page naturally.
15. As a site visitor, I want blog articles to optionally link to secondary cruises, so that I can discover related options without losing context.
16. As a site editor, I want the blog to remain a secondary channel, so that it supports SEO without becoming the primary surface of the site.
17. As a site editor, I want navigation, CTAs, logo, and contact details to live in a global Sanity document, so that shared site data has a single source of truth.
18. As a site editor, I want all public URLs to remain unchanged, so that existing SEO equity and external links are preserved.
19. As a site visitor, I want the site’s navigation to stay consistent across pages, so that I can move between the main sections without confusion.
20. As a site visitor, I want the same shared trust blocks to appear wherever they are intended, so that the content feels consistent and credible.
21. As a site editor, I want to manage page-level and shared content separately, so that I can understand what changes are local and what changes affect every page.
22. As a content strategist, I want blog articles to support specific cruises through structured relationships, so that SEO pages and commercial pages reinforce each other.
23. As a maintainer, I want the content model to map cleanly to page families, so that future changes are easier to reason about and less risky.
24. As a maintainer, I want shared blocks to be reference-driven instead of copied, so that I can avoid hidden divergence between pages.
25. As a maintainer, I want page families to be explicit in the schema, so that editors only see the fields and blocks appropriate to each page type.

## Implementation Decisions

- Preserve the current public URL set and treat routes as stable.
- Define a single global `site settings` document in Sanity for shared navigation, CTA, logo, and contact data.
- Model unique pages as a page family with a free page builder for homepage, boat page, and contact page.
- Model legal pages as unique pages with a single Portable Text body and no page builder.
- Keep cruise pages under `/nos-croisieres/*` as a shared template with fixed section order.
- Keep the `/nos-croisieres/` index as a collection archive that reflects available cruise entries.
- Centralize repeated template content such as Google reviews and the "Why choose Tahiti Guest Boat" section in Sanity documents that are referenced by pages rather than duplicated.
- Keep the related cruises section dynamic so it lists current cruises and excludes the current page.
- Keep the blog as a secondary SEO channel with a uniform article template.
- Support structured article relationships with one primary cruise and zero or more secondary cruises.
- Use reusable blocks across page families, with page-family-level constraints determining which blocks are allowed where.
- Maintain the existing split between page-level content and shared site-level content instead of mixing them in one generic document.
- Keep implementation details focused on schema shape, page-family behavior, and content ownership rather than per-page code duplication.

## Testing Decisions

- Good tests should verify external behavior: route output, data shape, content ownership, and rendered page behavior, not internal implementation details.
- Test the shared Sanity content loaders and query helpers to ensure page families receive the correct fields and relationships.
- Test the cruise template behavior to confirm the section order remains fixed and the dynamic related cruises block excludes the current cruise.
- Test the blog content model to confirm articles render with the uniform structure and preserve the primary/secondary cruise relationships.
- Test the global site settings integration so navigation, CTA, logo, and contact data flow into the layout consistently.
- Test the page-family routing behavior so existing URLs continue to resolve and preserve public content.
- Prior art for this repo is the existing Astro page and data-fetching structure in `src/lib/*` and `src/pages/*`, which already separates page fetching from rendering.

## Out of Scope

- Rebranding the site or changing the visual design system beyond what is required to support the content model.
- Changing public URLs or introducing broad redirect strategy unless a specific route issue is found during implementation.
- Turning the blog into the primary acquisition surface.
- Replacing Sanity with another CMS.
- Introducing dark mode or multiple theme variants.
- Redesigning the booking flow beyond what is necessary to integrate the shared site settings and existing CTA surfaces.

## Further Notes

- The current repo already hints at the target structure through existing pages, Sanity schemas, and shared blocks; this PRD formalizes that structure into a durable content model.
- The key architectural goal is to separate page-level editing, shared template content, and site-wide configuration while preserving all current SEO-relevant URLs.
