# Homepage test 2 — poids et performance

État du 9 novembre 2026, suivi dans Linear TGB-64.

Comparaison des routes `/` et `/home-beta/2/` du même build
`HOME_BETA=1 CONTEXT=deploy-preview npm run build`. Cette comparaison isole la
présentation dans le checkout actuel ; ce n’est pas un audit de la production.

## Poids mesuré

| Ressource | Mesure |
| --- | ---: |
| Script d’animation intégré au HTML | 3 356 octets bruts ; 1 551 octets en gzip |
| Feuille CSS spécifique à la bêta, y compris déclarations de polices | 5 276 octets bruts ; 1 532 octets en gzip |
| HTML accueil actuel | 25 066 octets en gzip |
| HTML test 2 | 26 748 octets en gzip |
| Police EB Garamond italique, latin | 42 400 octets en WOFF2 |

L’écart HTML + CSS spécifique + police latine italique représente environ
45,6 Ko au premier chargement, hors images. Les tailles gzip sont calculées
localement ; elles ne représentent pas une capture réseau dans un navigateur.
Les fichiers JavaScript externes directement référencés sont identiques.
Aucune bibliothèque d’animation ajoutée.

## Photo principale selon l’écran

Ressources sélectionnées selon les `srcset` du build, puis requêtes HTTP HEAD
sur le CDN Sanity avec `Accept: image/avif,image/webp,*/*`. Réponses AVIF.
Le choix est calculé pour les dimensions indiquées ; ce n’est pas une capture
du choix effectif d’un navigateur.

| Écran et densité | Accueil actuel | Test 2 | Écart |
| --- | ---: | ---: | ---: |
| Mobile 375 px, DPR 2 | 47 870 octets | 71 013 octets | +23 143 octets |
| Mobile 390 px, DPR 2 | 47 870 octets | 129 559 octets | +81 689 octets |
| Bureau 1440 px, DPR 1 | 160 593 octets | 160 593 octets | 0 |
| Bureau 1440 px, DPR 2 | 160 593 octets | 314 945 octets | +154 352 octets |

Le cadrage vertical mobile et la source 2400 px sur écran dense sont des
différences de la maquette bêta ; elles ne proviennent pas de l’animation.

## Lighthouse : pas de score mesuré

L’appel PageSpeed Insights mobile a renvoyé HTTP 429 : quota journalier dépassé.
Il n’existe donc pas de comparaison Lighthouse réussie pour cette livraison.
Ne pas convertir les kilo-octets ci-dessus en une perte de points inventée.

Le [score Lighthouse](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)
repose sur les métriques de chargement et varie avec les conditions du test.
L’animation ajoute peu de code ; la police et les variantes de photo peuvent
peser davantage sur un premier chargement mobile. Les masques et le lissage
au scroll ont aussi un coût de rendu qui n’est pas quantifié ici. Il faut un
audit mobile et une observation du scroll sur appareil pour conclure sur la
fluidité et le score.

Le refus d’automatisation navigateur sans consentement explicite dans AGENTS.md
reste applicable. Aucun navigateur de l’utilisateur n’a été piloté.

## Validation du build

Build réussi : 37 pages ; contrôle SEO réussi sur 30 URL. Le test 2 est noindex
et hors sitemaps. Déploiement demandé en prévisualisation Netlify uniquement.
