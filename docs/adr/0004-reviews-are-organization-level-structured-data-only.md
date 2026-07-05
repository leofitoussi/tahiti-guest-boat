---
status: accepted
---

# Reviews feed Organization-level structured data only, never a specific TouristTrip

`getReviews()` returns a single global list of testimonials (Google or manual) with no field linking a review to a specific cruise, and the same list is reused as-is on every cruise page via `ReviewsBlock`. We will surface these as an `aggregateRating`/`review` on the sitewide `Organization` JSON-LD in `BaseLayout`, and explicitly will not attach an `aggregateRating` to any per-cruise `TouristTrip` schema.

Attaching generic, non-cruise-specific reviews to a specific `TouristTrip` would misrepresent them as reviews of that product, which violates Google's structured data guidelines on misleading/self-serving markup and risks a manual action against rich results. If reviews ever get a real per-cruise relationship in the content model, this decision should be revisited.
