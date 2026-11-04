# Intégration Notion CMS — ESTER SAS

## Le principe

L'éditeur ajoute et modifie les réalisations dans une base Notion. Le site les récupère auprès de son propre serveur, sans reconstruire les pages ni donner le secret Notion au navigateur.

```text
Éditeur → base Notion ← intégration privée du serveur ESTER
                                    ^
                                    | cache mémoire de 60 s
Navigateur → GET /api/realisations --+
     ^                              |
     +----- { realisations: [...] }-+
```

Le navigateur interroge au chargement puis toutes les minutes lorsque l'onglet est visible. Le serveur relit Notion à la première requête suivant l'expiration du cache ; plusieurs lecteurs partagent le même rafraîchissement. Les deux cycles peuvent donner un délai d'environ deux minutes plus la latence, sans garantie en cas de panne. Aucun déploiement n'est nécessaire pour les modifications de contenu.

## Préparer la base

Ces opérations externes sont à effectuer par le responsable après revue et confirmation explicite au moment de l'action. Utiliser le compte entreprise existant ou créer celui convenu avec le propriétaire, sans transmettre de mot de passe dans le dépôt.

Créer la base **Site web — Réalisations** avec les propriétés suivantes :

| Propriété | Type | Usage |
|---|---|---|
| Titre | Titre | Nom du projet |
| Type | Sélection | Typologie, par exemple Bâtiment public |
| Catégorie | Texte ou sélection | Précision facultative |
| Lieu | Texte | Ville ou département |
| Description | Texte | Résumé public |
| Publié | Case à cocher | Coché : visible ; décoché : masqué |
| Image | Fichiers et médias | Première image facultative |

Conserver le champ `Publié` : en son absence, le code considère la ligne publiée. Ne jamais mettre d'informations privées dans les propriétés publiées. L'ordre actuel est la date de création décroissante ; un éventuel champ `Ordre` n'est pas utilisé. Le service parcourt toutes les pages de résultats, pas seulement les 100 premières lignes. Sans image, le navigateur affiche une illustration de remplacement.

## Connecter le serveur

1. Créer ou sélectionner l'intégration interne Notion de l'entreprise.
2. Partager explicitement la base avec cette intégration et vérifier son accès en lecture.
3. Récupérer le token et l'identifiant de la base dans un canal privé.
4. Dans Dokploy, définir `NOTION_TOKEN` et `NOTION_DATABASE_ID` dans **Environment runtime**, puis supprimer leurs anciennes entrées **Build Args**, en préservant les autres variables.
5. Après confirmation explicite du déploiement, redéployer pour charger cette configuration.

Le token reste côté serveur. `server/notion-realisations.mjs` appelle Notion ; `server.mjs` expose uniquement les données normalisées via `GET /api/realisations`. `js/notion.js` affiche les cartes et relance la pagination. Le fichier `public/data/realisations.json` produit au build contient une liste vide et n'est plus la source des cartes. Les avis Google restent générés au build par `scripts/generate-data.mjs`.

## Modifier une réalisation

1. Ouvrir la base et ajouter ou modifier une ligne.
2. Cocher `Publié` pour l'afficher, décocher pour la masquer sans la supprimer.
3. Garder le site ouvert dans un onglet visible ou le recharger. Attendre les cycles de cache et de lecture.
4. Vérifier la carte et la pagination. Pour une recette, restaurer ensuite la donnée originale.

## Panne et diagnostic

Une liste valide est conservée en mémoire pendant la vie du processus. Si la lecture suivante échoue ou dépasse 10 secondes, le serveur renvoie la dernière bonne liste, même ancienne. Sans cache, il renvoie `503` et une erreur générique ; aucun token n'est inclus. Un redémarrage efface le cache. Une panne au premier chargement affiche le message d'attente FR/EN ; une panne après affichage conserve les cartes du navigateur.

Une liste vide publiée est un résultat valide. En cas d'absence inattendue de cartes, vérifier en privé le partage de la base, la configuration runtime et les cases `Publié`. Ne pas changer de secrets ou simuler une panne sur la production pour tester : utiliser des doubles de test.

Voir [hébergement](HEBERGEMENT.md) et [guide de test](site-refresh/guide-test.md). Statut : architecture documentée ; accès Notion, migration Dokploy et recette publique non exécutés dans cette tâche.
