---
status: accepted
---

# Interactive map stays on the main domain

The interactive map will live at `tahitiguestboat.com/carte/` and its `/en/map/` equivalent, rather than on `map.tahitiguestboat.com`. Its indexable Pages de lieu will use `/carte/lieux/[identifiant]/` in French and `/en/map/places/[identifiant]/` in English. The map and Pages de lieu are statically generated during the existing Netlify build; Astro loads the map as a browser-only interactive island, with no SSR or persistent runtime. This preserves the existing SEO and localization model without adding the cost and duplication risk of a separate public application.
