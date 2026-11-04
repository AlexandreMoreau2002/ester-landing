# Actualisation du site ESTER

## Le principe

Notion est le carnet des réalisations. Le serveur le lit pour le navigateur : le visiteur reçoit les cartes publiques, jamais le token Notion. Modifier une réalisation ne demande plus de reconstruire le site.

```text
Éditeur → base Notion
                ^
                | lecture privée, uniquement côté serveur
Navigateur → GET /api/realisations → cache mémoire du serveur (15 s)
     ^                                    |
     +---------- { realisations: [...] } --+
     |
     +→ cartes → pagination reconstruite
```

Le serveur conserve une liste valide pendant 15 secondes. La première requête après expiration déclenche une nouvelle lecture ; les requêtes simultanées partagent cette lecture. Il parcourt toutes les pages Notion avant de remplacer la liste. Le rafraîchissement est limité à 10 secondes. En cas d'échec, il renvoie la dernière liste valide, même ancienne. Sans liste précédente, il répond `503` avec une erreur générique. Un redémarrage vide ce cache.

Le navigateur lit au chargement, puis toutes les 30 secondes tant que l'onglet est visible. Masquer l'onglet suspend le minuteur ; le rendre visible le relance. Une requête en cours ne se double pas. Une panne conserve les cartes déjà affichées ; au premier chargement, une liste vide ou une panne affiche le message d'attente traduit FR/EN. Le cache de 15 secondes et le minuteur de 30 secondes donnent un délai maximal normal cumulé d'environ 45 secondes, hors latence et panne, pour un onglet visible.

## Le formulaire

```text
Visiteur → POST /api/contact { data } → serveur → Resend → destinataire runtime
                                               |
                                               +→ expéditeur sur domaine vérifié
```

Le formulaire affiche le succès seulement après une réponse HTTP réussie. Cela signifie que Resend a accepté la demande, pas que le message est arrivé en boîte principale. La réception se vérifie séparément. L'adresse du visiteur sert de `reply_to` ; elle ne choisit pas le destinataire.

## Où vivent les réglages ?

- Build Dokploy : `ESTER_MODE`, `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID`, `VITE_APP_VERSION`. Les avis Google restent générés au build.
- Environment runtime Dokploy : `NOTION_TOKEN`, `NOTION_DATABASE_ID`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `RESEND_FROM`. Aucune valeur secrète dans les fichiers suivis.
- En production, le JSON de réalisations généré au build reste vide ; le site utilise uniquement l'API runtime.

## En développement local

Avec `ESTER_MODE=dev`, le générateur écrit une réalisation fictive déterministe dans `public/data/realisations.json`, sans token Notion. Ce JSON local permet de vérifier les cartes sans accéder à Notion. En mode production, la liste générée reste vide. Le navigateur essaie d’abord `/api/realisations`. Si la requête échoue ou si sa réponse est invalide, le serveur Vite de développement (`import.meta.env.DEV`) autorise un repli vers `/data/realisations.json`. Une réponse API valide mais vide reste vide : elle ne déclenche pas le repli. En production, aucun repli JSON n’est autorisé ; une panne conserve les cartes déjà affichées ou montre le message d’attente au premier chargement.

## Fichiers concernés

| Fichier | Rôle simple |
|---|---|
| `server/notion-realisations.mjs` | Lit Notion et garde la dernière bonne liste |
| `server.mjs` | Sert le site et les deux API |
| `js/notion.js` | Affiche les cartes et les rafraîchit |
| `js/pagination.js` | Répartit les cartes après chaque mise à jour |
| `server/contact-mail.mjs`, `js/contact.js` | Envoi Resend et résultat du formulaire |
| `scripts/generate-data.mjs`, `Dockerfile`, `.env.example` | Séparent génération au build et secrets runtime |
| `index.html`, `mentions-legales.html`, `js/i18n.js`, `style.css` | Textes FR/EN, contact et présentation |
| `vite.config.js`, `public/assets/favicon-32.png`, `public/sitemap.xml` | Pages construites, favicon et référencement |

Procédure d'exploitation : [guide de test](guide-test.md), [hébergement](../HEBERGEMENT.md), [CMS](../NOTION-CMS.md). La recette Resend du 4 novembre 2026 est terminée : succès du formulaire et réception du message confirmés, destinataire final rétabli et production redéployée. La migration Notion au runtime et son actualisation restent à tester en production. Cette mise à jour documentaire n'effectue aucune action externe.
