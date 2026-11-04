# Actualisation du site ESTER

## Le principe

Notion est le carnet des réalisations. Le serveur le lit pour le navigateur : le visiteur reçoit les cartes publiques, jamais le token Notion. Modifier une réalisation ne demande plus de reconstruire le site.

```text
Éditeur → base Notion
                ^
                | lecture privée, uniquement côté serveur
Navigateur → GET /api/realisations → cache mémoire du serveur (60 s)
     ^                                    |
     +---------- { realisations: [...] } --+
     |
     +→ cartes → pagination reconstruite
```

Le serveur conserve une liste valide pendant 60 secondes. La première requête après expiration déclenche une nouvelle lecture ; les requêtes simultanées partagent cette lecture. Il parcourt toutes les pages Notion avant de remplacer la liste. Le rafraîchissement est limité à 10 secondes. En cas d'échec, il renvoie la dernière liste valide, même ancienne. Sans liste précédente, il répond `503` avec une erreur générique. Un redémarrage vide ce cache.

Le navigateur lit au chargement, puis toutes les 60 secondes tant que l'onglet est visible. Masquer l'onglet suspend le minuteur ; le rendre visible le relance. Une requête en cours ne se double pas. Une panne conserve les cartes déjà affichées ; au premier chargement, une liste vide ou une panne affiche le message d'attente traduit FR/EN. Le cycle cache + minuteur peut retarder une modification jusqu'à environ deux minutes, hors latence et panne : une minute n'est pas une garantie de bout en bout.

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
- Le JSON de réalisations généré au build reste vide ; le site utilise l'API runtime.

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

Procédure d'exploitation : [guide de test](guide-test.md), [hébergement](../HEBERGEMENT.md), [CMS](../NOTION-CMS.md). Aucun service externe n'a été inspecté ou modifié pour rédiger ces documents ; déploiement et réception restent à vérifier.
