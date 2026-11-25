# Umami : demandes confirmées et couverture du test

**Mise à jour : la collecte elle-même a été corrigée à 20:31 Tahiti le 24 novembre ; voir la section finale « Collecte native v2 ». Les constats de couverture partielle ci-dessous décrivent désormais l’historique v1.**

Intervention du 24 novembre 2026, Pacific/Tahiti. Suivi : [TGB-68](https://linear.app/tahitiguestboat/issue/TGB-68/comparatif-test-sur-umami-fonctionne-pas).

## Demandes confirmées

Site publié : déploiement `6b0677e16d462b2ec3c45515`.

`/merci/` (formulaire `nPrj8V`) et `/en/thank-you/` (`eqOGYl`) envoient `lead_submitted` après consommation d’une preuve Tally de moins de cinq minutes et accord de mesure. Un accès direct, une preuve périmée/incompatible et un rechargement ne produisent pas de nouveau lead. Une attente de cinq secondes couvre le chargement tardif du tracker. Les hôtes de prévisualisation ne peuvent pas envoyer cet événement.

Propriétés : `form_id`, `locale`, `form_page_path`. Le payload explicite conserve l’identifiant du site Umami, le domaine, l’écran et la langue ; il remplace l’URL par son chemin, fixe le titre et réduit le référent à son origine. Aucun identifiant de soumission, prénom, réponse, query ou GCLID n’est transmis.

Le build est sélectif : HEAD `2c942fe8cc1f7f9b3a4c4e831d0b286fc43e68cf`, composition et routage du test TGB-64 existant, puis uniquement l’ajout des leads et le durcissement de la preuve Tally. Le chantier d’attribution, les nouvelles notifications et les brouillons Sanity restent hors de cette livraison. Les conversions Ads publiées sont conservées. Le webhook Tally commité est conservé, pas sa version locale en cours de modification.

Reproduction :

```sh
node scripts/prepare-lead-measurement.mjs --production --build
# DIR est le buildDir annoncé par la commande précédente.
node --experimental-vm-modules scripts/verify-lead-build.mjs "$DIR"
```

Build validé : `/var/folders/fc/8pr58_dn6j10tpvrf259zmrw0000gn/T/tgb64-ab-9xqT0z` ; manifeste `.lead-measurement-build.json`. Cette livraison manuelle peut être remplacée par un prochain déploiement Git sans ces fichiers. Préserver aussi les fichiers et le calendrier de TGB-64.

## Diagnostic du rapport A/B

Le lancement est le **22 novembre 2026 à 07:34 Tahiti**, la fin le **6 décembre à 07:34**. Les statistiques générales et le test n’ont pas le même périmètre : l’ancien suivi Umami collecte les pages automatiquement ; l’exposition A/B requiert l’accord de mesure et une page au premier plan.

Au contrôle du 24 novembre : accueil FR `/`, domaines publics, intervalle depuis le lancement :

| Mesure | Valeur |
| --- | ---: |
| Pages vues de l’accueil | 18 |
| Visites Umami distinctes de l’accueil (`visit_id`) | 17 |
| Visites A/B retenues | 4 |
| Visites de l’accueil exclues | 0 |
| Visites sans exposition A/B mesurée | 13 |
| Couverture retenue | 23,5 % |

Une visite QA est exclue du test global mais n’a pas de page vue de l’accueil correspondante : elle ne doit pas être soustraite des 17 visites de l’accueil. La jointure exacte a corrigé l’estimation préliminaire de 12 visites non couvertes en 13.

A : deux expositions, un engagement ; B : deux expositions, deux engagements. L’API du rapport correspond au SELECT direct. L’absence de propriétés A/B dans les pages vues non couvertes empêche toute attribution rétroactive. Ces taux ne représentent pas tous les visiteurs. Le 50/50 est une probabilité d’affectation, pas un quota imposant deux effectifs égaux.

Le correctif du rapport se trouve dans `/Users/leo/Projects/tgb-umami`, branche `codex/umami-netlify-migration` : `src/lib/home-experiment-report.ts`, route API et `HomeExperimentPage.tsx`. Il ajoute la réconciliation avec les visites réelles de l’accueil dans la même fenêtre, via jointure des identifiants de visite. Il distingue pages vues, visites, exclusions et couverture. Il ne change ni le consentement, ni la définition d’engagement, ni les dates du protocole.

## Vérifications

- 29 tests ciblés : preuve Tally, consentement, données filtrées, tracker tardif, prévisualisations et engagement de l’accueil.
- Astro check : checkout, 268 fichiers sans diagnostic ; build sélectif, 242 fichiers sans diagnostic.
- Build sélectif : 36 pages ; vérifications SEO sur 30 URL réussies.
- Modules compilés exécutés en DOM isolé, sans navigateur ni réseau : FR/EN, preuve valide/absente/périmée/incompatible, refus et hôte de preview.
- Collecteur HTTPS : deux événements synthétiques FR/EN reçus et relus dans Neon, dans un site QA temporaire ensuite supprimé avec ses données. Aucun événement synthétique dans les statistiques de Tahiti Guest Boat ; aucune soumission Tally ni aucun e-mail envoyé. Le parcours réel complet avec soumission Tally n’a pas été exécuté.
- Production : deux pages de confirmation HTTP 200 et noindex ; code de lead présent ; variantes A et B de l’accueil et arrêt du 6 décembre conservés ; même module d’engagement ; webhook existant GET 405.
- Rapport : six tests Jest et fixtures SQL en lecture seule, incluant doublons de pages vues, exclusions, visites mesurées sans page vue correspondante et trafic non couvert.

Les états et liens finaux des déploiements du rapport sont consignés dans Linear. Ne pas déduire d’une compilation réussie que sa prévisualisation ou sa publication est terminée.


## Publication du rapport vérifiée

Rapport en production : `6b0679a496bb7660390fd22c`, prévisualisation validée `6b067701098bddb52407064e`. Le contrôle authentifié de production confirme exactement 18 pages vues, 17 visites, 4 retenues, 0 exclue parmi ces visites et 13 non mesurées. La visite QA exclue globalement n’a pas de page vue correspondante. Le module client publié correspond au build validé et le SHA-256 du tracker est inchangé. Authentification, cache privé/no-store, statistiques historiques, heartbeat et login vérifiés.

TGB-68 est en **In Review** : correctif d’affichage et réconciliation livrés, collecte A/B toujours partielle. Prochaine action : revoir le rapport ; un objectif futur couvrant toutes les visites nécessite une décision de protocole distincte, sans reconstituer ni modifier les résultats passés.


## Collecte native v2

Demande utilisateur explicite après le premier correctif d’affichage : compter toutes les prochaines visites de l’accueil dans A/B. Site `6b0680a53a1a45974695fb4e`, publié `2026-11-25T06:31:07.153Z` (24 novembre à 20:31 Tahiti).

L’Edge Function annote le tracker natif avec `home-intro-v2:A|B` avant qu’il ne s’exécute. La page vue elle-même porte donc la variante, sans attendre focus, consentement ou stockage du suivi spécifique. Aucun nouvel événement d’exposition, cookie, identifiant ou contournement de l’opt-out/blocage du tracker. Les expositions correspondent aux visites natives reçues par Umami, pas à toutes les requêtes HTTP/robots. Chaque `visit_id` est compté une fois, dans sa première variante ; les visites mixtes sont signalées et conservées. QA explicite exclue.

La navigation est calculée avec les pages vues suivantes de la même visite. Le signal temporel existant reste consenti et le rapport parle d’engagement observé. Le rapport et ses API séparent les cohortes avant/après le published_at exact ; fin du 6 décembre conservée. Les leads du déploiement précédent sont préservés.

Validation : 36 tests ciblés côté site et sept tests du rapport ; fixtures SQL en lecture seule ; vrai HTML de production, vrai tracker en DOM isolé, collecteur HTTPS réel et relecture Neon. Six visites de QA (A/B × aucun choix/refus/accord), six expositions, 100 % de couverture ; rechargement et passage A→B dans une même visite dédupliqués, navigation reconnue. Site temporaire et données supprimés, aucun événement synthétique conservé dans le site principal.

Bilan actuel via le rapport Umami et `ops/verify-home-experiment.ts`. Impression des deux SELECT natifs, sans exécution ni écriture : `./node_modules/.bin/tsx ops/print-home-pageview-report.ts` depuis `/Users/leo/Projects/tgb-umami`. L’ancien `scripts/report-home-experiment.mjs` est explicitement limité à la cohorte historique avant le cutover.

## Audit de l’événement selon la documentation officielle Umami

Vérification du 24 novembre 2026, vers 21:08 Tahiti, à la demande de l’utilisateur. Périmètre : audit, sans modification du code de collecte ou déploiement.

**Conclusion : `lead_submitted` utilise correctement l’API Umami 3.0.3 ; le nettoyage des pages vues automatiques de confirmation reste à traiter séparément.**

- Le callback `umami.track(defaults => payload)` est une méthode officielle. Le nom est dans la limite de 50 caractères ; les trois propriétés `form_id`, `locale`, `form_page_path` respectent les types et limites documentés. Aucune déclaration préalable de l’événement dans l’administration n’est nécessaire pour sa collecte. Un objectif « Triggered event = lead_submitted » est une configuration d’analyse distincte, dont l’existence n’a pas été vérifiée ici.
- Les modules réellement publiés sur `/merci/` et `/en/thank-you/` valident puis consomment la preuve Tally, vérifient l’accord de mesure et l’hôte, et attendent au plus cinq secondes le tracker. L’événement conserve le site Umami et les informations techniques utiles, avec chemin sans query/hash, titre fixe et référent réduit à l’origine. Il ne transmet pas l’identifiant Tally ni le prénom. L’opt-out natif `umami.disabled` reste respecté par le vrai tracker.
- La garantie est celle d’une tentative unique après consommation de la preuve. Une panne réseau peut perdre un événement ; l’accord doit déjà être présent au déclenchement. Un accord donné seulement ensuite sur la confirmation ne relance pas cette preuve consommée.

**Constat sur les pages vues :** le HTML de production charge encore le snippet natif sans `data-exclude-search`, `data-exclude-hash` ni `data-before-send`. Avec le vrai tracker publié, une URL synthétique de confirmation contenant `firstName`, `tallySubmissionId`, `gclid` et un fragment les conserve dans le payload de page vue automatique ; un référent externe conserve également ses paramètres. Cette page vue est émise même sans choix ou après refus, conformément au fonctionnement natif déjà décrit plus haut. Le consentement et le nettoyage de `lead_submitted` ne s’appliquent pas à cet envoi indépendant. Ce contrôle démontre le comportement d’envoi ; il ne constitue pas un inventaire des données historiquement conservées en base.

Validation : 19 tests existants réussis sur cinq fichiers (`confirmed-lead-client`, `tally-submission`, `measurement-client`, `tally-embed-client`, `tracking-scripts`). HTML et modules de production FR/EN exécutés avec le vrai tracker dans un DOM isolé : 16 scénarios (preuve valide/absente/périmée/incompatible, refus, absence de choix, preview, opt-out), avec seconde exécution pour contrôler la consommation unique. Tous les POST du collecteur ont été interceptés localement : aucun événement, formulaire ou e-mail de test envoyé. SHA-256 du tracker public : `a1471487eb3e8eb93b1a9e056386019ff5eedadea29bbb725b5494fb2e9ad90a`.

Suite recommandée : filtrer avant envoi les pages vues des deux routes de confirmation, y compris URL et référent, avec les options et le hook supportés en 3.0.3. Préserver le marquage natif du test A/B et éviter une suppression globale des paramètres de campagne sans analyse de ses effets. Ce correctif n’a pas été implémenté dans le cadre de l’audit.

Sources : [Tracker functions](https://docs.umami.is/docs/tracker-functions), [Track events](https://docs.umami.is/docs/track-events), [Tracker configuration](https://docs.umami.is/docs/tracker-configuration), [Goals](https://docs.umami.is/docs/goals), [source officielle du tracker v3.0.3](https://github.com/umami-software/umami/blob/v3.0.3/src/tracker/index.js). La documentation courante décrit aussi des fonctionnalités postérieures à 3.0.3 ; leur présence n’a pas été supposée sur cette instance.


Collecte et rapport v2 publiés et contrôlés : site `6b0680a53a1a45974695fb4e`, Umami `6b06823c4dbf8e87e63d75fb`. API de production et asset client identiques au build validé ; deux cohortes comparées aux SELECT directs et sommes réconciliées. Au contrôle final, aucune visite réelle encore enregistrée après le cutover ; les six visites de validation étaient synthétiques et ont été nettoyées. TGB-68 **Done** ; TGB-64 reste le suivi du test jusqu’au bilan. Ne pas confondre cette absence initiale de nouveau trafic avec une absence de collecte : le parcours réel vers le collecteur et Neon a été validé dans le site QA.


## Simplification et prolongation — 25 novembre 2026

Les captures utilisateur ont permis de réconcilier l’écart exact : Overview, Path is `/`, Last 24 hours = 9 visiteurs / 9 visites / 9 pages vues. Parmi ces neuf vues, trois précèdent le cutover du 24 novembre à 20:31:07 Tahiti, une provient de `tahiti-guest-boat.netlify.app` (07:21:29Z, sans variante), et cinq du domaine public dans la nouvelle phase (A=3, B=2). Pas de visite du domaine public perdue après correction ; aucun engagement observé sur ces cinq visites au contrôle. La différence était celle de la fenêtre et des hôtes retenus, pas celle des autres pages du site.

Demande utilisateur appliquée : seulement graphique et bloc de comparaison, filtre commun 24 h / 7 jours / 30 jours / toute la période, suppression de l’actualisation manuelle et des panneaux d’historique/couverture. Relecture automatique au montage, au retour sur l’onglet, à la reconnexion et toutes les 15 secondes pendant la consultation. Le graphique compte les premières expositions de la même requête SQL que le tableau et la ventilation par appareil filtre les deux blocs. Les ancres `/#…` restent l’accueil, y compris pour éviter un faux engagement de navigation.

L’utilisateur a confirmé le report de la fin du 6 au **13 décembre 2026 à 07:34 Tahiti**. Début du 22 novembre inchangé, durée totale 21 jours. Cette modification du protocole en cours est consignée, sans effacer les résultats passés. Les cookies et visites consenties émis avec l’ancienne échéance sont reconnus et prolongés pour conserver les variantes et la déduplication.

Le patch de l’application Umami est sauvegardé dans `ops/umami/umami-v3.0.3-netlify.patch`. Les résultats de publication et de validation sont consignés dans TGB-68.
