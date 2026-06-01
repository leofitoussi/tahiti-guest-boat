# Tahiti Guest Boat

Vocabulary for the shared UI and brand system used across the site. This file defines the project language so design and implementation stay aligned.

## Language

**Design system**:
The shared set of tokens, components, and naming conventions used to keep the site visually and structurally consistent.
_Avoid_: UI kit, style guide, component library

**Theme**:
The single brand presentation for the site, expressed through the design system.
_Avoid_: skin, mode, variant

**Token**:
A named design value such as color, spacing, radius, typography, or shadow used consistently across the UI.
_Avoid_: magic value, hardcoded value

**Primitive token**:
A low-level base value that defines the system’s raw palette, scale, or geometry.
_Avoid_: base token, raw token

**Semantic token**:
A token named by intent or usage, such as surface, foreground, primary, or muted.
_Avoid_: color alias, presentation token

**Component token**:
A token reserved for repeated component-specific values that are awkward to express purely with semantic tokens.
_Avoid_: one-off value, local tweak

**Typography**:
The approved pairing of body and display fonts, plus the scale used for headings, body text, and small UI labels.
_Avoid_: font choice, text style

**Radius**:
The approved corner-rounding scale used on cards, buttons, inputs, and overlays.
_Avoid_: border radius, rounding

**Palette**:
The limited brand color set used as the source for semantic tokens and visual hierarchy.
_Avoid_: color theme, brand colors

**Spacing**:
The approved spacing scale used across layout, component padding, and vertical rhythm.
_Avoid_: margin values, ad hoc spacing

**Interaction**:
The approved behavior and visual emphasis for hover, focus, active, and disabled states.
_Avoid_: animation style, effects

**Blog**:
The secondary editorial channel used to support SEO and provide contextual content, without becoming the project's primary surface.
_Avoid_: content hub, main acquisition channel

**URL**:
The public route of a page, treated as stable and preserved when the site is refactored.
_Avoid_: slug change, path rename

## Localization

**French version**:
The default language version of a page, kept on the existing site URLs.
_Avoid_: main locale, source page

**English version**:
The translated language version of a page, published under the `/en/` path prefix.
_Avoid_: alternate page, mirror page

**Translation group**:
The linked pair or set of documents that represent the same content across languages.
_Avoid_: duplicate page, copy set

**Source version**:
The canonical language version used to create the first translated draft.
_Avoid_: master copy, origin document

**Page unique**:
A one-off page with its own editable block stack and no shared template siblings.
_Avoid_: singleton page, custom page

**Template de page**:
A shared page structure reused by multiple entries of the same type, where structural changes apply to every page in that family.
_Avoid_: one-off layout, per-page special case
_Order_: fixed for the page family

**Article**:
A blog entry managed as editorial content within the blog section.
_Avoid_: post, news item

**Bloc partagé**:
A reusable content block owned by a single source of truth and included by multiple page templates or page uniques.
_Avoid_: duplicated block, per-page copy

**Source de vérité**:
The canonical place where a piece of content is edited, from which all consuming pages derive their data.
_Avoid_: duplicate source, shadow copy

**Avis Google**:
A shared social-proof block sourced from a single Sanity document and reused across pages and templates.
_Avoid_: reviews widget, testimonial list

**Pourquoi choisir Tahiti Guest Boat**:
A shared trust-building block sourced from a single Sanity document and reused across pages and templates.
_Avoid_: features list, benefits block

**Croisières similaires**:
A dynamic related-cruises block that shows a subset of available cruises and excludes the current page.
_Avoid_: manual cross-links, static related list

**Autres croisières**:
A dynamic section on a Page croisière that lists every other Page croisière, excludes the current page, and uses editorial priority for ordering.
_Avoid_: croisières similaires, manual selection, related cruises

**Archive de page**:
A listing page that primarily reflects a collection of entries and may include limited page-specific content.
_Avoid_: landing page, editorial page

**Page légale**:
A policy or compliance page such as privacy or cookies, treated as a unique editable page.
_Avoid_: legal notice, static boilerplate
_Structure_: titles and body text only

**Page éditoriale**:
A unique page with reusable sections assembled from a block stack in Sanity.
_Avoid_: legal page, template page

**Portable Text**:
A rich-text field used for linear editorial content such as legal pages and article bodies.
_Avoid_: page builder, component stack

**Navigation globale**:
The shared header and footer navigation data managed from a single Sanity source of truth.
_Avoid_: hardcoded menu, page-local nav

**Site settings**:
The single global Sanity document that stores shared site data such as navigation, CTA, logo, and contact details.
_Avoid_: settings page, config file

**Sanity Studio**:
The hosted Sanity editing surface for this project, used online only.
_Avoid_: local studio, self-hosted studio

**Croisière principale**:
The primary cruise linked to an article or page for SEO and navigation purposes.
_Avoid_: main topic, canonical page

**Page croisière**:
A commercial cruise page managed as a fixed editorial template, with rich fields filled in Sanity and no page-level block stack for editors.
_Avoid_: article, landing page, page éditoriale
_Structure_: template de page
_Publication_: may be public before every template section is complete

**Libellé destination**:
A short destination name stored on a Page croisière for context-aware shared sections and grammar-sensitive copy.
_Avoid_: page title, H1, slug

**Mot-clé principal croisière**:
The primary search phrase for a Page croisière, derived from "croisière" plus the page's Libellé destination.
_Avoid_: editable keyword, SEO tag, manual query

**Accroche croisière**:
The opening section of a Page croisière that states the cruise promise, presents short practical markers, and establishes the destination visually.
_Avoid_: résumé de croisière, pitch, intro block

**Introduction destination**:
A section of a Page croisière that presents the destination or archipelago, explains why it suits private cruising, and supports search intent with rich editorial text and destination imagery.
_Avoid_: intro croisière, carousel block, destination summary

**Expérience croisière**:
A section of a Page croisière that explains why private cruising is the right way to discover the destination.
_Avoid_: editorial block, destination argument, cruise text

**Bateau recommandé**:
A section of a Page croisière that explains why Tahiti Guest Boat's boat suits the destination and leads toward booking.
_Avoid_: boat block, boat pitch, vessel section

**Itinéraire indicatif**:
An inspirational example route within a Page croisière that shows how the cruise could unfold without defining a contractual program.
_Avoid_: programme, circuit, planning
_Disclaimer_: shared across all Page croisière entries

**Bloc réservation**:
A shared booking section that combines reusable booking copy and the shared reservation form, with the destination name injected from the current page context when needed.
_Avoid_: appel à la réservation, page-specific booking copy, form block

**Croisières secondaires**:
Additional cruise links attached to an article or page as supporting references.
_Avoid_: related links, tags

**Bloc réutilisable**:
A shared block definition that can be enabled across multiple page families while still being constrained by page type.
_Avoid_: duplicated component, page-specific component

**Composant cohérent**:
A reusable Astro/Sanity section or block that respects the design system, page family, content ownership, SEO, performance, and the project's premium editorial identity.
_Avoid_: UI component, styled section, one-off component

**Option responsive**:
A constrained editor choice that changes layout behavior across breakpoints, such as independent text/image ordering on desktop and mobile, without exposing free-form styling controls.
_Avoid_: custom CSS field, free layout setting, style override

**Cadrage responsive**:
The breakpoint-aware rendering of one Sanity image asset using its hotspot and crop data so the subject remains visible on mobile and desktop without uploading a second image.
_Avoid_: mobile image, duplicate asset, CSS-only crop hack

**Page de test composants**:
A dedicated `/composants` page managed from Sanity where new page-builder blocks are deployed with dummy content and rendered full width for real-site validation before being used on public business pages.
_Avoid_: UI kit sandbox, local-only preview, component mock page

**Page builder**:
A page-level block stack whose blocks can be added, removed, and reordered within the rules of that page family.
_Avoid_: static layout, fixed section list

**Version linguistique**:
A document variant for one language within the same content family.
_Avoid_: translation, locale copy

**Groupe de traduction**:
The linked set of version linguistiques that represent the same content across languages.
_Avoid_: translation set, locale group

**Langue source**:
The canonical language version that other languages are generated from.
_Avoid_: source language, master copy

**Synchronisation de traduction**:
Automatic regeneration of a target language version from the langue source after the source changes.
_Avoid_: auto-translate, translation sync

**Article SEO**:
A blog article designed to support a related commercial page through search visibility and contextual links.
_Avoid_: category page, campaign landing page
_Structure_: uniform template

## Editing workflow

- Sanity is edited online only for this repo; there is no local Studio workflow to rely on.
