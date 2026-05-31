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

**Croisière principale**:
The primary cruise linked to an article or page for SEO and navigation purposes.
_Avoid_: main topic, canonical page

**Croisières secondaires**:
Additional cruise links attached to an article or page as supporting references.
_Avoid_: related links, tags

**Bloc réutilisable**:
A shared block definition that can be enabled across multiple page families while still being constrained by page type.
_Avoid_: duplicated component, page-specific component

**Page builder**:
A page-level block stack whose blocks can be added, removed, and reordered within the rules of that page family.
_Avoid_: static layout, fixed section list

**Article SEO**:
A blog article designed to support a related commercial page through search visibility and contextual links.
_Avoid_: category page, campaign landing page
_Structure_: uniform template
