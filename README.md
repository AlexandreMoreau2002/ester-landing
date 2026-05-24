# ESTER SAS — Landing page

Site vitrine d'un bureau d'études en ingénierie structurelle, Hautes-Alpes.

## Stack

- HTML / CSS / JS vanilla — aucun framework, aucune dépendance NPM côté front
- [Netlify](https://netlify.com) pour l'hébergement et les fonctions serverless
- [Notion](https://notion.so) comme CMS headless pour les réalisations (à venir)
- [Formspree](https://formspree.io) pour le formulaire de contact (à configurer)

## Lancer en local

```bash
# Serveur statique simple
python3 -m http.server 8080
# → http://localhost:8080

# Ou avec la CLI Netlify (recommandé pour tester les Functions)
npm install -g netlify-cli
netlify dev
# → http://localhost:8888
```

Copier `.env.example` en `.env` et remplir les valeurs avant de lancer `netlify dev`.

## Structure

```
ester-landing/
├── index.html          # Page unique
├── style.css           # Tout le CSS (design tokens + composants)
├── main.js             # JS vanilla (nav, scroll, i18n, pagination…)
├── i18n.js             # Traductions FR / EN
├── assets/             # Images (logo.png, favicon…)
├── netlify/
│   └── functions/      # Serverless functions (Notion API)
├── .env.example        # Variables d'environnement à copier en .env
└── README.md
```

## Gitflow

Ce projet suit [Gitflow](https://nvie.com/posts/a-successful-git-branching-model/).

| Branche | Rôle |
|---|---|
| `main` | Production — chaque commit correspond à un tag de version |
| `develop` | Intégration — branche de base pour le développement |
| `feature/xxx` | Nouvelles fonctionnalités (`feature/notion-cms`, `feature/formspree`…) |
| `release/x.x.x` | Préparation d'une mise en production |
| `hotfix/xxx` | Correctif urgent directement sur `main` |

### Workflow type

```bash
# Nouvelle feature
git checkout develop
git checkout -b feature/notion-cms

# ... travail ...

git checkout develop
git merge --no-ff feature/notion-cms
git branch -d feature/notion-cms

# Préparer une release
git checkout -b release/1.1.0
# (ajustements, bump version si besoin)
git checkout main
git merge --no-ff release/1.1.0
git tag v1.1.0
git checkout develop
git merge --no-ff release/1.1.0
git branch -d release/1.1.0
```

### Système de tags (versioning)

Format : `vMAJEUR.MINEUR.PATCH`

| Incrément | Quand |
|---|---|
| MAJEUR | Refonte visuelle complète |
| MINEUR | Nouvelle section ou fonctionnalité (Notion, form…) |
| PATCH | Correction de bug, ajustement texte, fix CSS |

```bash
# Créer et pousser un tag
git tag v1.0.0 -m "Premier déploiement en production"
git push origin v1.0.0

# Voir tous les tags
git tag -l
```

Les tags sont posés sur `main`, après merge d'une `release/`.

## Déploiement

Le site est déployé automatiquement sur Netlify à chaque push sur `main`.

Variables d'environnement à configurer dans l'UI Netlify (Site settings → Environment variables) :

- `NOTION_TOKEN`
- `NOTION_DATABASE_ID`
- `FORMSPREE_ENDPOINT`

## Licence

Code propriétaire — tous droits réservés.
