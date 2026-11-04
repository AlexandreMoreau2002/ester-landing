# Hébergement & domaine

## Architecture

```text
Dépôt Git → branche configurée dans Dokploy → build Docker/Vite
                                                   |
                                                   v
VPS OVHcloud (Gravelines) ← conteneur Node port 3000 ← dist/ + server/
          ^                         |
          |                         +→ GET /api/realisations → Notion (cache 15 s)
Traefik HTTPS                       +→ POST /api/contact → Resend
          ^
          |
Domaine de l'application configuré dans Dokploy
```

Le VPS est partagé : éviter plusieurs builds simultanés. Vérifier la branche et le domaine effectivement configurés avant une intervention. Le dépôt utilise `develop` pour l'intégration et `main` pour la production ; un push sur une branche reliée au webhook peut déclencher un déploiement.

Le `Dockerfile` construit les ressources avec `npm ci` et `npm run build`, puis copie `dist/`, `server.mjs` et tout `server/` dans l'image finale. `node server.mjs` sert les ressources et les deux API. En production, les réalisations Notion sont lues au runtime ; seuls les avis Google restent figés au build. Le cache serveur dure 15 secondes et le navigateur visible interroge toutes les 30 secondes : le délai maximal normal cumulé est d’environ 45 secondes, hors latence et panne.

En local, `ESTER_MODE=dev` génère une réalisation fictive déterministe dans le JSON public, sans token. En mode production, le générateur écrit une liste de réalisations vide. Seulement sous Vite en développement (`import.meta.env.DEV`), le navigateur se replie sur `/data/realisations.json` après un échec ou une réponse invalide de l’API. Une liste API valide vide ne déclenche pas ce repli. Le build de production reste runtime-only, même si des mocks ont été générés.

## Répartition des variables Dokploy

| Emplacement | Variable | Usage |
|---|---|---|
| Build Args | `ESTER_MODE` | `prod` pour les données Google réelles |
| Build Args | `GOOGLE_PLACES_API_KEY` | Clé Google privée de génération des avis |
| Build Args | `GOOGLE_PLACE_ID` | Établissement Google ciblé |
| Build Args | `VITE_APP_VERSION` | Version publique dans la console |
| Environment runtime | `NOTION_TOKEN` | Secret d'intégration Notion |
| Environment runtime | `NOTION_DATABASE_ID` | Base partagée avec l'intégration |
| Environment runtime | `RESEND_API_KEY` | Clé privée autorisant l'envoi |
| Environment runtime | `CONTACT_TO_EMAIL` | Boîte de test, puis destinataire final |
| Environment runtime | `RESEND_FROM` | `ESTER Site Web <contact@ester-sas.fr>` |

Les variables `NOTION_*` quittent les Build Args et doivent être présentes dans l'environnement du conteneur actif. Préserver toutes les autres variables lors de la sauvegarde. Ne jamais les préfixer `VITE_`, ni ajouter leurs valeurs au dépôt. Une modification runtime exige un redéploiement pour que le processus la lise. Une simple édition du contenu Notion n'en exige aucun.

Sans Notion fonctionnel et sans cache, l'API CMS répond `503`. Avec un cache déjà rempli, elle conserve la dernière bonne liste. Sans `RESEND_API_KEY` ou `CONTACT_TO_EMAIL`, le contact répond `500`. Un refus Resend produit `502`. Définir explicitement `RESEND_FROM` en production : le repli sandbox du code ne remplace pas un domaine vérifié.

## Domaine et Resend

Le domaine `ester-sas.fr` est géré chez OVH. Les enregistrements A/AAAA doivent correspondre au VPS choisi ; les domaines de l'application Dokploy doivent correspondre au routage HTTPS attendu. Traefik gère le certificat selon sa configuration.

Pour Resend, reprendre exactement les enregistrements et noms affichés dans sa console pour le domaine expéditeur, sans supposer un nombre fixe de lignes DNS et sans supprimer les entrées de messagerie existantes. Attendre le statut **Verified** avant tout déploiement de test. Ne pas confondre propagation DNS, acceptation de l'envoi et livraison réelle.

## Intervention contrôlée

Suivre [le guide de recette production](site-refresh/guide-test.md) : revue des documents et confirmation à l'instant des actions externes, vérification Resend, migration des variables, déploiement avec boîte de test, confirmation juste avant un envoi unique, vérification réception/indésirables/activité/logs, puis bascule confirmée vers le destinataire final et redéploiement.

Conserver un relevé privé de la configuration précédente pour la restauration. Les preuves versionnées contiennent uniquement version, date et statuts. Le renouvellement du domaine reste à surveiller auprès du registrar.

Statut de recette au 4 novembre 2026, confirmé par le responsable : le formulaire de production a retourné le succès et le message a été reçu dans la boîte de test. `CONTACT_TO_EMAIL` a ensuite été rétabli vers `estersarl.ing@gmail.com` et la production a été redéployée avec succès. La migration Notion au runtime et son actualisation restent à tester en production. Cette mise à jour documentaire ne réalise aucune nouvelle intervention externe et ne consigne ni secret ni adresse de test.
