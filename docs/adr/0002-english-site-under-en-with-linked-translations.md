---
status: accepted
---

# English site under `/en` with linked translations

We are adding English as a full public-language version of the site under `/en/...` while keeping French on the existing URLs. Each page will have a linked French/English document pair in Sanity, with the English document generated once from French and then maintained separately. The site will emit `hreflang` and language-aware canonicals for each pair so search engines can index both versions cleanly.

This approach keeps the implementation simple enough to ship quickly, avoids changing the existing French URLs, and limits translation automation to a one-time draft instead of continuous resynchronization.
