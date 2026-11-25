# Test de l’accueil — engagement

**Correction de collecte active depuis le 24 novembre à 20:31 Tahiti.** La section « Collecte v2 » ci-dessous remplace le périmètre consenti v1 pour les nouvelles expositions. Les sections historiques restent conservées pour le protocole initial.

Suivi : [TGB-64](https://linear.app/tahitiguestboat/issue/TGB-64).
Préparation demandée le 21 novembre 2026 ; lancement autorisé le 22 novembre, durée confirmée à 14 jours.

Production : `6b0326f49c8c3c65e889e239`. Départ le **22 novembre 2026 à 07 h 34 à Tahiti**
(`2026-11-22T17:34:00Z`), arrêt le **6 décembre à 07 h 34 à Tahiti**
(`2026-12-06T17:34:00Z`). Après expiration : accueil actuel A pour les nouvelles requêtes et arrêt de la mesure.

Prévisualisation finale `6b02504c701c5e4c6aafa1ee` (ready, deploy-preview,
published_at null, une Edge Function livrée) :

- [Version A](https://6b02504c701c5e4c6aafa1ee--tahiti-guest-boat.netlify.app/?home_test=1&variant=A).
- [Version B](https://6b02504c701c5e4c6aafa1ee--tahiti-guest-boat.netlify.app/?home_test=1&variant=B).

Sans paramètre, cette prévisualisation sert A sans activer le test.

## Protocole fixé

- Accueil français `/` : A = présentation actuelle ; B = composition du test 2,
  mobile statique à 18 px et espace CTA → galerie réduit de 30 % sur desktop.
- Répartition aléatoire 50/50 à la périphérie Netlify, avant envoi du HTML.
  Ce sont des probabilités égales, pas une garantie de nombres parfaitement égaux.
- Durée confirmée le 22 novembre : 14 jours = 336 heures, intervalle `[début, début + 14 jours[`. Le début est
  un horodatage ISO explicite livré dans le module serveur du déploiement.
  À expiration, chaque nouvelle requête reçoit A, sans redéploiement ni promotion
  automatique de B. Une page B déjà ouverte reste lisible ; la mesure cesse.
- Objectif principal : visites engagées / visites exposées mesurées, par version.
  Afficher aussi les effectifs et la ventilation mobile (<768 px)/desktop.
- Engagement : **autre page réellement ouverte après l’accueil OU 20 secondes
  cumulées sur l’accueil au premier plan ET une section après l’introduction vue**.
  Onglet visible et fenêtre ayant le focus ; le temps caché ou sans focus ne compte
  pas. Une section vue = au moins 120 px de sa hauteur visibles (ou toute la section
  si elle est plus petite). Le premier bloc après l’introduction sert de repère dans
  les deux présentations. Pas d’engagement déclenché par un simple événement
  d’exposition, un changement d’ancre, un rechargement ou le temps seul.
- Définition propre au test, différente des sessions engagées GA4. Déduplication
  par visite applicative (30 minutes sans activité) et par `visit_id` Umami au bilan.
  La visite applicative n’est pas un identifiant personnel transmis.
- Durée et variantes figées avant lancement. Pas d’arrêt précoce pour un résultat
  favorable. Arrêt technique possible si le rendu ou le formulaire casse. Un test à ce volume peut aboutir à « données insuffisantes » ; ne pas prolonger
  jusqu’à obtenir un résultat positif. Les résultats par appareil sont exploratoires.

## Collecte et consentement

Événements `home_intro_exposed` et `home_intro_engaged`. Données autorisées :
`experiment=home-intro-v1`, `variant=A|B`, `viewport=mobile|desktop`, et pour
l’engagement `reason=next_page|20s_and_section`. Le contrôle de production peut ajouter
`qa=true` ; toute sa visite est exclue du bilan. Aucun identifiant de personne,
champ de formulaire ou paramètre de campagne ajouté aux événements.

Le rendu aléatoire est possible avant consentement sans stockage d’affectation
ni événement. **Après accord de mesure seulement**, le navigateur conserve un
cookie de variante jusqu’à la fin du test et un état de visite dans
localStorage. L’affectation devient stable pour les visites mesurées ; les
visiteurs non consentants restent hors du rapport et peuvent recevoir une autre
version lors d’un retour. Retrait : suppression de cet état/cookie et arrêt des
envois. Pas de mesure rétroactive du temps antérieur à l’accord.

Le navigateur attend Umami avant l’exposition ; l’engagement n’est tenté qu’après
l’envoi d’une exposition et le bilan exige une exposition reçue antérieure.
Les envois sont tentés une seule fois par visite et sérialisés
entre onglets par Web Locks lorsque disponible. Le bilan déduplique encore par
`visit_id` et exclut les visites où les deux variantes ont été observées ou marquées QA.
Un bloqueur ou une panne réseau peut empêcher la réception : les compteurs ne
sont pas un recensement de tous les visiteurs.

Le module fonctionne avec le tracker Umami actuel et avec le futur chargeur
consenti du chantier d’attribution. Sa liste de propriétés autorisées a été étendue
uniquement à ces deux événements. Les autres changements locaux de ce chantier
ne font pas partie de la livraison du test.

## Construction, contrôles et lancement

```sh
HOME_INTRO_EXPERIMENT_BUILD=1 CONTEXT=deploy-preview npm run build
```

Dans ce checkout qui contient d’autres travaux non livrés, préférer la préparation
sélective reproductible :

```sh
node scripts/prepare-home-experiment.mjs --build
```

Le script construit une copie temporaire de HEAD et y ajoute uniquement les
fichiers du test et le petit patch BaseLayout. Il conserve un manifeste du commit
de base et du périmètre. Il ne déploie rien. `--production --build` prépare un
build de production, incluant la date explicite du module serveur sans le publier ; les fonctions
commitées du site sont alors conservées. Si BaseLayout a changé, revoir le patch.

Le build ajoute `/home-experiment/b/`, contenu interne avec canonical `/` et mêmes
alternates linguistiques que A. L’Edge Function y impose `X-Robots-Tag: noindex,
nofollow` en accès direct. Cette route est absente des sitemaps. Le visiteur du
test reste sur `/` ; seul le HTML diffère. Le public français garde ses URL et
la version anglaise conserve son fonctionnement. Les robots reconnus reçoivent A.

Sur une prévisualisation Netlify avec l’Edge Function livrée :

- `/?home_test=1&variant=A` : contrôle forcé.
- `/?home_test=1&variant=B` : nouvelle version forcée.
- `/?home_test=1` : tirage 50/50.
- Sans paramètre : fonctionnement normal, test inactif.

En production, `?home_test_qa=1` ajoute le marqueur QA aux événements sans forcer
la version ; les visites ainsi marquées sont exclues du bilan.

La QA de prévisualisation ne transmet rien à Umami : elle émet des événements locaux
`tgb:home-experiment-preview` inspectables dans les tests. Le forçage est ignoré en
production. Un aperçu statique Astro seul ne reproduit pas le routage Edge.

Procédure de livraison :

1. Déployer sélectivement le code du test avec `HOME_INTRO_EXPERIMENT_BUILD=1` au
   build. Préserver les autres modifications locales hors périmètre.
2. Fixer la date ISO dans `netlify/lib/home-experiment-schedule.mjs`, puis déployer
   en production. Une variable `HOME_INTRO_TEST_START` en scope Functions peut
   surcharger cette date ; vide ou absente, la date du module est utilisée.
   Date future : A seul jusqu’au début ; invalide ou expirée : A sans mesure.
   Consigner le début et sa fin à +336 h en UTC/Tahiti et l’ID dans Linear.
   Le 22 novembre, ni le connecteur (403) ni la CLI (succès sans persistance)
   n’ont enregistré la variable : la livraison utilise donc le module serveur.
3. Vérifier la présence de l’Edge Function, les en-têtes `X-TGB-Home-Variant`,
   l’absence de cache partagé, le HTML réel de A/B, les événements reçus (en
   excluant les visites de QA) et l’accès au formulaire. L’Edge Function utilise
   `onError=bypass` : incident ou B absent → accueil actuel, sans fausse exposition.
4. Ne pas modifier l’introduction, les campagnes ou la définition pendant les
   quatorze jours sans consigner la rupture du protocole. Le dernier jour, laisser la
   collecte fermer à l’heure prévue ; pas de prolongation tacite.

Les scripts de suivi et les pages de confidentialité applicables doivent décrire
ce stockage temporaire de mesure avant activation. Aucun changement de page Sanity
ni lancement en production n’est effectué par la préparation.

## Consulter le suivi dans Umami

Publié le 22 novembre 2026 à 07 h 50 (Tahiti), déploiement Umami
`6b032b21f1d6f4d986227d3e`, ready. Données authentifiées contrôlées contre la base,
six tests du rapport et fixtures SQL en lecture seule réussis.

Accès connecté au site Tahiti Guest Boat, menu **Test accueil A/B** :
https://analytics.tahitiguestboat.com/websites/388d24a4-9679-4b9c-992d-5ac0427b099c/home-experiment

Le rapport présente A/B, sessions exposées, sessions engagées, taux et écart en
points de pourcentage, avec vues global/mobile/ordinateur. La période est fixée
au protocole ci-dessus ; les résultats en cours sont provisoires. Actualisation
chaque minute lorsque l’onglet est visible, arrêt du rafraîchissement périodique
après la fin du test ; bouton Actualiser disponible. QA et visites mixtes exclues.

Le code se trouve dans `/Users/leo/Projects/tgb-umami`, onglet du site et API
`/api/websites/:websiteId/home-experiment`, protégés par l’authentification et les
permissions Umami. Le calcul reprend exactement le SELECT du bilan ci-dessous.
Documentation et contrôles reproductibles : `ops/home-experiment-report.md` dans
ce checkout Umami. Aucune nouvelle table ou modification du tracking du test.

## Bilan prêt à exécuter

```sh
node scripts/report-home-experiment.mjs 'HORODATAGE_ISO_DU_DEBUT'
```

Cette commande produit une requête SELECT pour la base Umami (`umami`, projet
Neon `spring-thunder-47983230`). L’exécuter via le connecteur en lecture seule.
Elle compte uniquement le domaine public, la période fixée et les événements du
test, avec exposition antérieure à l’engagement. Les visites mixtes A/B ou de QA sont
exclues et leur nombre est affiché. Six lignes : A/B, global/mobile/desktop.

Le verdict porte sur le taux et ses effectifs, accompagné de l’incertitude ; une
différence de quelques visites ne suffit pas à affirmer une supériorité. Contrôler
aussi l’équilibre des groupes, les erreurs et les performances mobiles. Les nouveaux
événements peuvent changer le rebond natif d’Umami : il n’est pas le critère du test.

## Validation de la livraison

- Production activée à l’heure prévue le 22 novembre à 07 h 34 (Tahiti),
  déploiement `6b0326f49c8c3c65e889e239` publié à 17:31:34.557Z, ready.
- Contrôle réel : A et B HTTP 200 avec cookie correspondant et runtime de mesure ;
  12 tirages sans cookie donnent 7 A et 5 B. Root sans paramètre également actif.
  Cache privé sans stockage partagé, H1 unique, canonical public, anglais hors test,
  accès direct B noindex. Formulaire contact accessible et webhook GET refusé (405).
- Deux événements synthétiques explicitement marqués QA reçus dans Umami/Neon :
  une exposition et un engagement. Le bilan exclut leur visite ; aucune soumission
  Tally ou émission d’email. La QA HTTP valide la réception, les comportements du
  navigateur étant couverts par les contrôles de prévisualisation et les tests.

- Astro check : 265 fichiers, zéro erreur/warning/hint ; `git diff --check` réussi.
- 20 tests ciblés du protocole, du routage et de la collecte réussis ; contrôles
  complémentaires du rendu et de la localisation de l’accueil réussis.
- Build final de production isolé : 36 pages ; contrôle SEO réussi sur 30 URL.
- A/B réels HTTP 200 sur `/`, en-tête de version correct, un H1, canonical `/`,
  script de collecte final servi identique au build, `private, no-store` en test.
  Route B directe noindex ; accueil normal et anglais sans runtime de test.
- Contrôle navigateur sur la prévisualisation précédente du même code (avant la
  dernière correction de conservation du cookie entre visites) : exposition B,
  pas d’engagement avec le temps seul ; engagement après affichage de la section ;
  aucun doublon au rechargement ; exposition A puis engagement sur ouverture de
  Notre bateau. Aucun événement de QA transmis à Umami (compteur réel vérifié à 0).
- La dernière correction de conservation d’affectation sur quatorze jours a un test
  de régression dédié et est incluse dans le déploiement final ci-dessus.
- Capture du contrôle :
  `/Users/leo/.codex/visualizations/2026/11/22/01a200bc-7826-7fe0-88c5-8cb7666c13ff/home-ab-engagement-qa.jpg`.
- Requête du bilan validée contre le vrai schéma Umami en lecture seule (six lignes,
  visite synthétique de QA exclue). Ce rapport est descriptif ; les visites répétées d’un
  navigateur ne sont pas des observations indépendantes pour un test statistique.

Build de production conservé dans
`/var/folders/fc/8pr58_dn6j10tpvrf259zmrw0000gn/T/tgb64-ab-ju2BqO`, avec manifeste
`.home-experiment-build.json`. Recréation par le script de préparation sélective.
Une Edge Function et la fonction Tally committée sont conservées. Aucun commit/push
ni changement Sanity. Les autres travaux locaux ne font pas partie de la livraison.

Attention : un déploiement Git de production depuis une branche sans ces fichiers
remplacerait le test manuel. Préserver ce déploiement pendant la période prévue.

Prochaine action : au terme des 14 jours, exécuter le bilan avec la date ci-dessus,
comparer les effectifs et taux A/B, puis recueillir les retours utilisateurs.
Aucun gagnant automatique ni prolongation tacite.


## Collecte v2 — correction TGB-68 du 24 novembre

Demande explicite de l’utilisateur : compter toutes les prochaines visites de l’accueil dans A/B, plutôt que seulement les visites ayant accepté le suivi spécifique. Site publié `6b0680a53a1a45974695fb4e`, `published_at=2026-11-25T06:31:07.153Z`, soit le 24 novembre à 20:31 Tahiti. Arrêt du 6 décembre à 07:34 inchangé.

L’Edge Function joint `data-tag="home-intro-v2:A|B"` au tracker Umami existant avant son exécution différée. La variante correspond au HTML effectivement servi. Le comptage utilise **la page vue native**, pas l’ancien événement d’exposition conditionné au focus/consentement/stockage. Aucune requête de mesure supplémentaire, aucun nouvel identifiant ou stockage avant consentement. Les blocages et l’opt-out natifs du tracker restent appliqués. Le futur chargeur consenti reste soumis à son propre consentement ; il transporte également ce tag quand il envoie une page vue.

Le nouveau rapport part du published_at exact, déduplique par `visit_id`, affecte chaque visite à sa première variante et conserve les visites mixtes en les signalant. Un rechargement ou un changement de version ne supprime plus une visite du dénominateur. Le trafic et le total A+B doivent se réconcilier, hors QA explicite (`:qa`). La ventilation utilise la taille d’écran déjà enregistrée dans la session Umami ; elle est distincte de l’ancienne mesure de viewport.

La navigation vers une autre page est calculée avec les pages vues suivantes de la même visite Umami. Le signal existant « 20 secondes + section » reste consenti ; le rapport nomme donc le taux **engagement observé**, et ne prétend pas mesurer ce signal temporel pour tous les visiteurs. Aucune modification de consentement Ads, de stockage nominatif ou du suivi des leads.

L’ancien historique v1 reste affiché séparément et se termine au cutover. Le script `scripts/report-home-experiment.mjs` est désormais explicitement historique et borné au cutover. Pour le bilan de la nouvelle phase, utiliser les SELECT paramétrés de `/Users/leo/Projects/tgb-umami/src/lib/home-pageview-report.ts` et les contrôles `ops/verify-home-pageview-query.ts` / `ops/verify-home-experiment.ts`. Ne pas additionner les taux de cohortes différentes.

Vérification : vrai HTML de production A/B, vrai tracker 3.0.3 en DOM isolé, envoi réel au collecteur HTTPS sur un site QA temporaire puis relecture Neon. Six visites (A/B × aucun choix/refus/accord), six expositions, couverture 100 %, pas de double comptage au rechargement ; une visite mixte gardée dans sa première version et une navigation mesurée sans stockage du test. Site QA et données ensuite supprimés. Aucun navigateur automatisé, aucune réponse Tally ou notification de test.
