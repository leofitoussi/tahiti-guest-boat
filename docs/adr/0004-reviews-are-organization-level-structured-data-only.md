---
status: accepted
---

# Reviews remain visible, but are excluded from Organization structured data

`getReviews()` returns one global list of testimonials, including Google reviews, with no relationship to an individual Page croisière. The same list remains visible to visitors through `ReviewsBlock`; it is not deleted from Sanity and it does not affect the Google Business Profile.

The sitewide `Organization` JSON-LD in `BaseLayout` must not include `aggregateRating` or `review`. Google treats reviews of an organization shown on that organization's own website as self-serving, including when they originate from a third-party review platform. Such markup is not eligible for review stars in organic Search, so retaining it adds no intended SEO benefit.

Do not attach the global reviews to a per-cruise `TouristTrip`, either: that would incorrectly state that the reviews concern that specific product. Revisit this decision only if the content model gains genuine reviews linked to individual cruises and their use satisfies Google's structured-data guidance.

Decision revised during the SEO-audit review on 15 August 2026.
