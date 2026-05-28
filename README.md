# ESTER SAS — Landing page

Site vitrine du bureau d'études en ingénierie structurelle Ester sas a Gap, Hautes-Alpes.

## Stack

- HTML / CSS / JS vanilla
- Vite pour le serveur local et le build Netlify
- Aucune fonction serverless : les données publiques sont générées au build

## Lancer en local

```bash
cp .env.example .env
# Mets ESTER_MODE=dev pour voir les avis mockés sans clés API.
npm install
npm run dev
# → http://localhost:5173
```

En local, `ESTER_MODE=dev` génère `public/data/avis.json` avec des avis mockés et laisse les réalisations vides si Notion n'est pas configuré.

## Structure

```
ester-landing/
├── index.html
├── style.css
├── main.js
├── js/
│   ├── avis.js
│   ├── contact.js
│   ├── i18n.js
│   ├── mountains.js
│   ├── nav.js
│   ├── notion.js
│   ├── pagination.js
│   ├── reveal.js
│   └── smooth-scroll.js
├── scripts/
│   └── generate-data.mjs
├── public/
│   └── data/
├── assets/
└── README.md
```

## Données dynamiques

`scripts/generate-data.mjs` lit les variables d'environnement au moment du build, appelle Google Places et Notion côté Node, puis écrit :

- `public/data/avis.json`
- `public/data/realisations.json`

Le navigateur ne reçoit que ces JSON publics, jamais les clés API.

La section Avis reste masquée si le JSON ne contient aucun avis 4 ou 5 étoiles. La section Réalisations affiche l'empty state si Notion ne renvoie aucun projet publié.

## Déploiement Netlify

Dans l'interface Netlify :

- Build command : `npm run build`
- Publish directory : `dist`

Variables à créer dans Netlify :

- `ESTER_MODE=prod`
- `GOOGLE_PLACES_API_KEY`
- `GOOGLE_PLACE_ID`
- `NOTION_TOKEN`
- `NOTION_DATABASE_ID`

## Gitflow

`main` → production, `develop` → intégration, `feature/xxx` → branches de travail.

Tags : `vMAJEUR.MINEUR.PATCH`.

## Licence

Code propriétaire — tous droits réservés.
