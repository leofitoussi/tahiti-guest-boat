# Audit des partenaires et traceurs du parcours de demande

> Statut : éléments de preuve et brouillon éditorial pour la validation humaine de l’issue #70.  
> Date d’observation : 20 septembre 2026.  
> Ce document ne remplace pas une validation juridique ni les décisions de conservation de Tahiti Guest Boat.

## Périmètre et méthode

L’audit couvre la production `https://tahitiguestboat.com`, les réglages publics Sanity et le code qui traite une demande après l’envoi. Les réponses HTTP et le stockage du navigateur ont été contrôlés pour les formulaires Tally ; aucune soumission de test n’a été envoyée, afin de ne pas créer une fausse demande ni de déclencher les notifications réelles.

Les éléments non publiés présents dans le répertoire de travail ne font pas partie de l’inventaire de production ci-dessous.

## Inventaire constaté

| Partenaire ou composant | Moment de chargement | Finalité et données concernées | Choix de consentement |
| --- | --- | --- | --- |
| GoatCounter (`gc.zgo.at/count.js`) | Sur toutes les pages publiques, dans le `<head>`. | Mesure d’audience : URL consultée, référent, navigateur et système agrégés, langue, largeur d’écran et localisation approximative dérivée de l’IP. La [documentation GoatCounter](https://www.goatcounter.com/help/privacy) indique qu’il n’écrit ni cookie ni `localStorage` dans le navigateur. | Pas de choix de cookie requis par l’implémentation actuelle ; à réexaminer si le réglage GoatCounter change, notamment l’option de pages vues individuelles. |
| Tally (`tally.so`) — formulaire FR `nPrj8V` | Le script d’intégration et l’iframe sont chargés dans le bloc Réservation d’une Page croisière, actuellement lorsque ce bloc entre dans la zone de chargement différé. | Demande de croisière : dates, nombre de personnes, destination, prénom, coordonnées et toute autre réponse saisie. Tally reçoit aussi les données techniques inhérentes à la consultation de son formulaire. Selon la [documentation Tally GDPR](https://tally.so/help/gdpr), Tahiti Guest Boat est responsable de traitement des réponses et Tally agit comme sous-traitant. | Le formulaire reste accessible directement ; il n’est pas conditionné par le choix de mesure ou de publicité. |
| Tally (`tally.so`) — formulaire EN `eqOGYl` | Même comportement que le formulaire FR. | Même finalité et mêmes catégories de données, en anglais. | Même décision : formulaire affiché directement. |
| Netlify Function `/.netlify/functions/tally-webhook` | Chemin de traitement prévu après une réponse Tally, via `/api/tally-webhook`. | Le code accepte les deux formulaires et prépare la notification à partir des réponses. La configuration effective du webhook dans Tally reste à confirmer par le test de soumission. | Traitement serveur lié à la demande ; pas un cookie déposé sur le terminal du visiteur. |
| Resend | Chemin de notification prévu après le webhook Tally. | Le code envoie l’événement et les données de la demande aux adresses configurées. La réception effective reste à confirmer par le test de soumission. | Traitement serveur lié à la demande ; à citer dans la Politique de confidentialité, avec la durée de conservation retenue par Tahiti Guest Boat. |
| Sanity CDN (`cdn.sanity.io`) | Images, logo et autres actifs éditoriaux publics. | Diffusion des actifs du site ; requêtes HTTP usuelles. | Nécessaire à l’affichage des pages ; aucun traceur applicatif identifié dans ce contrôle. |
| Google Ads / Google tag | **Non chargé en production au 20 septembre 2026.** Aucun Google tag, Google Tag Manager ou Google Ads n’a été trouvé dans les pages observées ni dans le champ de scripts de suivi publié. | Futur projet de mesure de conversion et, seulement si choisi, de publicité personnalisée. | Ne pas activer le tag avant un mécanisme de consentement testé. Google exige le recueil et la transmission du choix pour les usages de mesure et de publicité des visiteurs EEE, Royaume-Uni et Suisse : voir [Consent mode](https://support.google.com/google-ads/answer/10000067?hl=en). |

Les liens vers Facebook, Instagram et Google Reviews sont de simples liens sortants lors de l’observation ; ils ne chargent pas leurs widgets. La vidéo YouTube est déclenchée par le visiteur, hors du parcours de demande.

## Preuves du parcours de confirmation

Les réglages publiés des formulaires exposent les redirections de fin de parcours suivantes :

| Formulaire | Configuration de redirection publiée | Page de confirmation attendue |
| --- | --- | --- |
| Français `nPrj8V` | `https://tahitiguestboat.com/merci/?prenom=@Prénom` | `/merci/` ; page française, `noindex`, qui rend le prénom avec le paramètre `prenom`. |
| Anglais `eqOGYl` | `https://tahitiguestboat.com/en/thank-you/?firstName=@First name` | `/en/thank-you/` ; page anglaise, `noindex`, qui rend le prénom avec le paramètre `firstName`. |

Le code génère ces deux routes et le test `test/contact-conversion.test.ts` contrôle la version anglaise, son lien vers `/en/` et l’exclusion des confirmations des sitemaps.

Le 20 septembre 2026, la personne habilitée de Tahiti Guest Boat a confirmé avoir testé les redirections Tally et qu’elles fonctionnent. La vérification de la notification et le nettoyage des données de test restent à tracer séparément si une soumission a déclenché le webhook.

## Décision Tally

**Le formulaire Tally reste accessible directement dans le bloc Réservation. Il ne sera pas chargé après un clic préalable.**

Cette décision produit préserve le parcours de demande. Elle doit être décrite clairement dans la politique, sans faire dépendre le formulaire du choix de mesure ou de publicité :

- le navigateur se connecte à `tally.so` lorsque le bloc Réservation est chargé ;
- les réponses HTTP observées pour les deux URL de formulaire et le script d’intégration ne déposaient pas de `Set-Cookie`, et un contrôle direct du formulaire n’a trouvé aucun cookie `tally.so` à cet instant ;
- ce contrôle ne suffit pas à éliminer les données techniques transmises au chargement, ni à garantir le comportement futur de Tally. Sa [Politique de confidentialité et cookies](https://tally.so/help/cookie-policy) indique que son site emploie des cookies ;
- le formulaire est utilisé pour recueillir les demandes de croisière ; les technologies de mesure et de publicité restent, elles, soumises aux choix du visiteur lorsqu’elles sont activées.

## Brouillon pour Sanity — français

> Le formulaire Tally est chargé directement lorsque le bloc Réservation est affiché. Le texte ne doit pas indiquer qu’un clic préalable est requis.

### Politique de cookies

Dernière mise à jour : [date de publication]

#### Vos choix

Tahiti Guest Boat vous permet de choisir les technologies de mesure et de publicité que vous acceptez. Vous pouvez accepter, refuser ou personnaliser ces choix depuis la bannière. Vous pouvez les retirer ou les modifier à tout moment en cliquant sur « Gérer mes cookies » dans le pied de page. Vos choix sont conservés pendant six mois dans le stockage local de votre navigateur, puis la bannière vous les demande à nouveau.

#### Mesure d’audience

Nous utilisons GoatCounter pour comprendre, de manière agrégée, la fréquentation du site et les pages consultées. GoatCounter ne dépose pas de cookie ni de stockage local dans votre navigateur dans notre configuration actuelle. Il peut traiter des informations techniques agrégées telles que la page consultée, le référent, le navigateur, le système, la langue, la largeur d’écran et une localisation approximative. Consultez la [politique de confidentialité de GoatCounter](https://www.goatcounter.com/help/privacy).

#### Formulaire de demande de croisière

Le formulaire de demande de croisière affiché dans la section Réservation est fourni par Tally. Lorsque cette section est chargée, votre navigateur se connecte à Tally pour afficher le formulaire. Tally traite les réponses que vous saisissez, telles que vos dates, le nombre de voyageurs, vos coordonnées et les informations utiles à la préparation de votre croisière. Tahiti Guest Boat utilise ces données pour répondre à votre demande et préparer votre projet de croisière. Tally agit comme sous-traitant de Tahiti Guest Boat pour les réponses au formulaire. Consultez la [documentation Tally relative à la protection des données](https://tally.so/help/gdpr).

Le formulaire Tally n’est pas conditionné par vos choix de mesure et de publicité. La durée de conservation des demandes est de **24 mois**. Pour exercer vos droits sur une demande, contactez-nous à [tahitiguestboat@gmail.com](mailto:tahitiguestboat@gmail.com).

#### Google Ads

Google Ads n’est pas activé sur le site à la date de publication de cette politique. Avant toute activation, le tag Google Ads ne sera chargé qu’après votre accord explicite à la mesure et/ou à la publicité. Selon votre choix, les signaux `analytics_storage`, `ad_storage`, `ad_user_data` et `ad_personalization` seront refusés ou accordés. Un refus empêche le chargement des technologies Google Ads ; le retrait de votre choix produit le même effet. Cette politique sera mise à jour avant l’activation effective de Google Ads.

#### En savoir plus

Pour connaître les traitements de données personnelles, vos droits et les moyens de nous contacter, consultez notre [Politique de confidentialité](/politique-de-confidentialite/).

## Sanity draft — English

> The Tally form loads directly when the Booking section is displayed. The text must not state that a prior click is required.

### Cookie policy

Last updated: [publication date]

#### Your choices

Tahiti Guest Boat lets you choose which measurement and advertising technologies you allow. You can accept, reject or customise these choices from the banner. You can withdraw or change them at any time by selecting “Manage cookies” in the footer. Your choices are retained in your browser’s local storage for six months, after which the banner asks again.

#### Audience measurement

We use GoatCounter to understand site traffic and pages viewed in aggregate. In our current configuration, GoatCounter does not write cookies or local storage in your browser. It may process aggregated technical information such as the page viewed, referrer, browser, operating system, language, screen width and approximate location. See the [GoatCounter privacy policy](https://www.goatcounter.com/help/privacy).

#### Cruise enquiry form

The cruise enquiry form displayed in the Booking section is provided by Tally. When that section loads, your browser connects to Tally to display the form. Tally processes the answers you submit, such as dates, number of travellers, contact details and information useful for planning your cruise. Tahiti Guest Boat uses this information to answer your enquiry and prepare your cruise project. Tally acts as Tahiti Guest Boat’s processor for form responses. See [Tally’s GDPR documentation](https://tally.so/help/gdpr).

The Tally form is not conditional on your measurement and advertising choices. Enquiry data is retained for **24 months**. To exercise your rights concerning an enquiry, contact [tahitiguestboat@gmail.com](mailto:tahitiguestboat@gmail.com).

#### Google Ads

Google Ads is not active on the website on the publication date of this policy. Before it is enabled, the Google Ads tag will load only after your explicit choice for measurement and/or advertising. Depending on your choice, the `analytics_storage`, `ad_storage`, `ad_user_data` and `ad_personalization` signals will be denied or granted. Refusing prevents Google Ads technologies from loading; withdrawing your choice has the same effect. This policy will be updated before Google Ads is activated.

#### Learn more

For information about personal-data processing, your rights and how to contact us, see our [Privacy policy](/en/privacy-policy/).

## Validation checklist

- [x] The Tahiti Guest Boat representative validates the inventory, Tally DPA and the 24-month retention period, and approves the French and English texts.
- [x] The representative publishes both `legalPage` documents in Sanity.
- [ ] The technical team deploys the consent interface together with the policy; the production version must not claim that Google Ads is active before its tag is actually installed.
- [ ] Browser network inspection confirms that loading the Booking section requests `tally.so`, as stated in the policy.
- [x] The Tahiti Guest Boat representative confirms the Tally redirects work for the French and English forms.
- [ ] The test notification is received and the test entries are deleted from Tally and any downstream inbox/tool according to Tahiti Guest Boat’s procedure.
