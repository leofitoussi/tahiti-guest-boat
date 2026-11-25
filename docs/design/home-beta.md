# Homepage bêta

Version temporaire demandée le 8 novembre 2026, suivie dans [TGB-64](https://linear.app/tahitiguestboat/issue/TGB-64/mettre-en-scene-les-envies-du-bloc-dintroduction-de-laccueil).

Un [test A/B de l’engagement à 20 secondes](home-engagement-experiment.md) est
désormais livré en production. Il compare l’accueil actuel à cette composition,
à probabilités 50/50 du 22 novembre 2026 à 07 h 34 au 6 décembre à 07 h 34 (Tahiti),
avec arrêt automatique et retour à l’accueil actuel. Voir le protocole pour les validations.

[Voir la homepage bêta avec CTA harmonisés sur Netlify](https://6af15258223f70267585db7e--tahiti-guest-boat.netlify.app/home-beta/).

[Voir le test 2 actualisé en prévisualisation le 21 novembre 2026](https://6b02443cce080a4feef5628f--tahiti-guest-boat.netlify.app/home-beta/2/).
Déploiement `6b02443cce080a4feef5628f`, état ready, contexte deploy-preview,
published_at null. Le déploiement public reste `6af158d7c94c03fcb2100d86`
(vérifié avant et après cette publication). Les ajustements sont validés par
l’utilisateur ; TGB-64 reste en revue, en attente des retours utilisateurs.
[Ancien test 2 du 9 novembre, pour comparaison](https://6af2bc2e114cc73eb8073b98--tahiti-guest-boat.netlify.app/home-beta/2/).
Voir les [mesures de poids et les limites de l’évaluation Lighthouse](home-beta-performance-2026-11-09.md).

La structure validée reprend la grande photo du bateau, la signature
« Partage · Polynésie · Plaisance », le titre et l’introduction centrés, des emojis
en ligne et les deux CTA de la maquette. Après correction, le titre et
l’introduction suivent le texte exact fourni avec la maquette, avec un paragraphe
par proposition commençant par « qui ». La photo, les destinations des CTA et
toutes les sections suivantes viennent de la homepage française publiée dans
Sanity. Aucun document Sanity n’est modifié.

La première correction appliquait les dimensions Figma exactes. À la demande de
l’utilisateur, une passe Impeccable `quieter` affine ensuite les proportions sans
changer le concept, la photo, le texte, les emojis ou les liens :

- Bloc centré de 900 px ; titre de 800 px en 64 px / 98 %, graisse 550, tracking
  −.03em, toujours en trois lignes avec la dernière en italique et en `#002B4B`.
- Signature de 26 px, dernière expression ramenée de 700 à 600.
- Texte de 18/29 px sur 860 px, graisse 400 ; emphases 600 et 8 px entre phrases.
  Emojis à 90 % de la taille du texte.
- Espacements par relation : 32 px de la signature au titre, 40 px avant le texte,
  32 px avant les CTA, au lieu d’un espacement uniforme de 47 px.
- CTA harmonisés avec les autres blocs du site : bouton principal partagé
  `buttonVariants({ variant: 'primary', size: 'lg' })` de 48 px, majuscules et
  espacement typographique standards ; lien secondaire bleu souligné avec
  chevron. Les deux cibles font au moins 48 px de haut, espacées de 20 px.
  Les styles de boutons spécifiques à cette bêta ont été supprimés.

Les tailles sont fluides sous 1024 px et 640 px, sans saut de taille aux seuils.
La photo garde la hauteur de l’accueil actuel : 60vh puis 70vh au bureau. Les
couleurs de la référence restent locales à cette composition temporaire.

## Prévisualiser

### Retouches validées et publiées en prévisualisation — 21 novembre 2026

La direction du test 2 est conservée. Sous 768 px, l’introduction est statique :
les quatre paragraphes (18 px) et les deux CTA sont visibles dans le flux, sans sticky,
masque ni relais au scroll. Le passage du seuil réinitialise les styles animés.

À partir de 768 px, l’espace total entre les CTA et la première rangée de photos
est réduit de 30 %. La mesure inclut le vide résiduel de la scène et le retrait
de la galerie ; elle est recalculée hors scroll après chargement des polices ou
redimensionnement. L’écart de 60 px entre la dernière phrase et les CTA reste
conservé. La réduction s’applique aussi au repli statique desktop.

La première tentative de réduction n’avait aucun effet : `nextElementSibling`
visait le script injecté par Astro au lieu du conteneur de galerie. La simulation
DOM initiale n’incluait pas ce script et avait donc donné une fausse validation.
La recherche cible désormais `#home-beta-suite .marquee-gallery` depuis le parent
de la section, indépendamment des scripts intercalés.

Validation finale : Astro check (255 fichiers, zéro erreur/warning/hint).
Contrôle navigateur et captures avant/après explicitement demandés par
l’utilisateur : 1440 × 900 px, scrollY = 2500, dernière phrase et CTA stabilisés.
Sur Netlify : bas des CTA = 455,273 px, début des photos = 667,273 px,
écart = 212 px. En local : mêmes CTA, photos = 603,680 px,
écart = 148,406 px, soit −29,997 % (arrondi du navigateur).
À 390 × 844 px : texte calculé à 18 px, animation désactivée, CTA accessibles.
Captures conservées dans
`/Users/leo/.codex/visualizations/2026/11/22/01a200bc-7826-7fe0-88c5-8cb7666c13ff/`
(`desktop-before.jpg`, `desktop-after.jpg`, `mobile-18px.jpg`).
Pas de score de fluidité ou de performance mesuré.

Prévisualisation actualisée à la demande de l’utilisateur après validation des
captures. Build isolé depuis HEAD avec seulement les quatre fichiers applicatifs
de cette bêta : 37 pages construites, contrôle SEO réussi sur 30 URL. Envoi via
API Netlify avec draft=true : 39 fichiers nécessaires envoyés sur 82, aucune
fonction. Page distante HTTP 200, X-Robots-Tag noindex, main HTML et trois feuilles
CSS identiques au build vérifié. Aucun commit/push ni changement Sanity.
Prochaine action : recueillir les retours utilisateurs sur cet aperçu, puis
décider des ajustements ou de l’intégration à l’accueil public.

### Deuxième test local — relais des phrases

À la demande du 9 novembre 2026, `/home-beta/2/` reprend la composition centrée
et remplace les paragraphes simultanés par un relais au défilement. La première
bêta reste accessible sous `/home-beta/`. **Le test 2 est disponible en local
et sur l’URL provisoire Netlify ci-dessus ; il n’est pas publié en production.**

Après le dernier retour utilisateur, l’ouverture et la lecture sont séparées.
La signature et le titre restent dans le flux avec la photo et quittent l’écran
avant la lecture. Le titre monte jusqu’à 88 px. L’espace entre la photo et la
signature varie de 64 à 120 px. La signature est séparée du titre par 48 px
sur bureau et 40 px sur mobile. Le retrait sous le titre est de 32 px, au lieu
des 160–420 px initiaux, après le retour sur l’espace excessif.
Seule la section « Pour celles et ceux… » est
maintenue pendant le relais des phrases.

La première phrase commence masquée, puis se révèle pendant l’approche de la
scène : opacité, agrandissement léger et masque dégradé. Elle est entièrement
lisible lorsque le bord inférieur du grand titre quitte le haut de l’écran.
Ce repère est mesuré sur le titre réel après le chargement des polices.
Cette entrée occupe 0,65 intervalle de scroll et fonctionne aussi en sens inverse.
La deuxième phrase reste masquée pendant toute l’entrée ; elle ne commence à
apparaître qu’au relais suivant. La suivante, plus petite et en retrait,
remonte avant de prendre sa place. Les deux phrases gardent 32 px de séparation.
La scène possède un fondu de 48 px en haut et en bas. La révélation de chaque
phrase utilise aussi un masque dégradé mobile, remplaçant le clip-path qui
produisait une coupe blanche au milieu des lignes.
Le déplacement suit continuellement le scroll : plus de plage immobile au début
de chaque relais, ni de courbe qui concentre le mouvement sur quelques crans.
Un lissage de 60 ms amortit les crans de molette et cesse dès que la position
est atteinte. La course est ramenée à trois relais de 300 à 460 px selon la fenêtre.
La dernière phrase reste visible à la sortie. Les pictogrammes sont retirés
dans cette variante pour suivre la capture fournie ; les mots et liens restent
conservés.

Le mouvement utilise un sticky natif, opacity, transform et des masques CSS, sans
bibliothèque ni interception du défilement. La hauteur de la scène est calculée
sur le paragraphe le plus long. Le script ne mesure pas la mise en page pendant
le scroll et ne demande des frames que sur événement, lorsque la section est
visible ou pendant le bref lissage d’un mouvement de scroll.

À la demande de l’utilisateur, « Continuer vers les images » est supprimé.
Les deux CTA apparaissent ensemble sous la dernière phrase, sur les derniers
12% du relais. Ils suivent sa position pendant son arrivée, puis restent à 60 px
de son bord inférieur avant de quitter la scène avec le texte. Ils ne sont pas
accessibles au clavier tant qu’ils ne sont pas révélés. La galerie arrive après.
Le titre ne revient pas à la fin.

Le corps passe à une taille fluide de 24 à 42 px, sur une largeur maximale de
1100 px (conteneur de 1164 px avec ses marges intérieures). La première variante
conserve ses dimensions et ses CTA d’origine.

Sans JavaScript, avec `prefers-reduced-motion`, ou quand la composition ne tient
pas dans la hauteur disponible, les quatre paragraphes restent simplement
affichés et le défilement est normal. Tous les textes restent accessibles aux
lecteurs d’écran dans leur ordre de lecture.

Fichiers : `src/components/preview/HomeIntroSequence.astro` et
`src/lib/home-intro-sequence.ts` ; activation uniquement dans la route bêta.

```sh
HOME_BETA=1 CONTEXT=deploy-preview npm run dev -- --host 127.0.0.1 --port 4325
```

Ouvrir [le deuxième test local](http://127.0.0.1:4325/home-beta/2/) et faire
défiler depuis la photo. La préférence de réduction des mouvements et la hauteur
de fenêtre peuvent désactiver volontairement la scène animée.

### Construire les deux variantes

```sh
HOME_BETA=1 CONTEXT=deploy-preview npm run build
npm run preview
```

Ouvrir `/home-beta/`. La route est exclue du build sans `HOME_BETA=1` et toujours
exclue si `CONTEXT=production`, même avec l’option activée. Elle est `noindex`,
absente des sitemaps et de la navigation. Déployer uniquement en brouillon Netlify.

La disposition `centered` est une option de `HeroHeader.astro` ; la disposition
actuelle reste celle par défaut. Le cadrage utilise le même asset Sanity avec son
hotspot et des sources adaptées au mobile et au bureau. La première variante
reste statique ; le relais est activé uniquement dans la deuxième.

Les décorations et emphases sont appliquées uniquement à cette route temporaire.
Les emojis sont masqués aux lecteurs d’écran. Leurs emplacements dans le texte
réservent une évolution vers des icônes illustrées SVG en ligne, après choix de
la direction visuelle. La vraie variante italique d’EB Garamond est chargée pour
cette page. Les styles locaux non encapsulés dans une couche CSS évitent que
les règles globales `:where(h1, …)` écrasent les dimensions de la maquette.

## Supprimer

Supprimer `src/pages/home-beta/` et ce document. La variante `centered` du composant
peut être conservée pour réutilisation ou retirée si aucune autre page ne l’emploie.
