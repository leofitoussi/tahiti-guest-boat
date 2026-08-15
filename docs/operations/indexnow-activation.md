# Activation IndexNow et suivi de l’indexation

Cette procédure active la notification IndexNow de Tahiti Guest Boat et vérifie les outils de suivi. Elle doit être exécutée par une personne disposant des accès administrateur à Netlify, au DNS du domaine, à Google Search Console et à Bing Webmaster Tools.

## Préconditions

- La version qui contient le plugin IndexNow est déployée en production.
- Le domaine canonique répond sur `https://tahitiguestboat.com`.
- `https://tahitiguestboat.com/sitemap_index.xml` et les sitemaps enfants répondent en HTTP 200.
- Aucun secret ou clé ne doit être ajouté à `netlify.toml`, au dépôt Git ou à un ticket GitHub.

## 1. Configurer IndexNow dans Netlify

1. Générer une clé IndexNow aléatoire de 8 à 128 caractères, composée uniquement de lettres, chiffres et tirets. Conserver sa valeur dans le gestionnaire de mots de passe de l’équipe.
2. Dans le projet Netlify, ouvrir la configuration des variables d’environnement et créer `INDEXNOW_KEY` avec cette valeur. Restreindre la variable aux builds de production.
3. Déclencher un déploiement de production après avoir enregistré la variable. Les previews et déploiements de branche ne doivent pas recevoir cette variable ni produire le fichier de vérification.
4. Après le succès du déploiement, vérifier en navigation privée que `https://tahitiguestboat.com/<INDEXNOW_KEY>.txt` répond en HTTP 200 et contient exactement la clé. Ne jamais copier la clé dans les journaux, tickets ou captures d’écran partagées.
5. Lors du prochain déploiement qui modifie le sitemap, contrôler dans les journaux Netlify qu’une soumission IndexNow est effectuée ou qu’une erreur actionnable est signalée. Une réponse `200` ou `202` confirme la réception de la notification, pas l’indexation.

## 2. Vérifier Google Search Console

1. Ajouter la propriété de domaine `tahitiguestboat.com` — sans protocole, sous-domaine ni chemin — afin de couvrir le domaine canonique et ses variantes.
2. Publier l’enregistrement DNS TXT demandé par Google, puis terminer la vérification dans Search Console. Ne pas supprimer cet enregistrement : Google contrôle périodiquement la propriété.
3. Dans le rapport **Sitemaps**, soumettre une seule fois `https://tahitiguestboat.com/sitemap_index.xml`.
4. Confirmer que le rapport peut lire le sitemap, puis utiliser l’inspection d’URL uniquement pour une Page croisière ou un Article majeur nécessitant une vérification ponctuelle.

Google continue de découvrir les pages par les sitemaps et son crawl. Ne pas configurer l’API Google Indexing ni un ping de sitemap Google.

## 3. Vérifier Bing Webmaster Tools

1. Ajouter le site canonique `https://tahitiguestboat.com/` dans Bing Webmaster Tools.
2. Réaliser la méthode de vérification proposée par Bing pour ce domaine, de préférence la vérification DNS quand elle est disponible. Une importation Search Console ne remplace pas la vérification si Bing demande une preuve distincte.
3. Soumettre une seule fois `https://tahitiguestboat.com/sitemap_index.xml` dans la section Sitemaps.
4. Consulter ensuite les rapports Sitemaps et IndexNow de Bing Webmaster Tools pour vérifier la réception des prochains changements publiés.

## 4. Consigner la validation

Dans le ticket d’activation, consigner uniquement :

- la date du déploiement de production ;
- la confirmation HTTP 200 du fichier de vérification, sans sa valeur ;
- les propriétés Google et Bing vérifiées ;
- l’état de lecture du sitemap dans chaque outil ;
- l’identifiant ou l’horodatage d’une première soumission IndexNow observée, sans la clé.

IndexNow est un signal de découverte pour les moteurs participants. Ni IndexNow ni la soumission d’un sitemap ne garantissent l’indexation ou le classement d’une URL.

## Sources officielles

- [IndexNow — documentation du protocole](https://www.indexnow.org/documentation)
- [Google Search Console — ajouter une propriété](https://support.google.com/webmasters/answer/34592)
- [Google Search Console — soumettre et suivre un sitemap](https://support.google.com/webmasters/answer/10351509)
- [Bing Webmaster Tools — documentation](https://learn.microsoft.com/en-us/bingwebmaster/)
