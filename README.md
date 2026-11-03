# ESTER SAS — Landing page

Site vitrine du bureau d'études en ingénierie structurelle Ester sas a Gap, Hautes-Alpes.

## Stack

- HTML / CSS / JS vanilla
- Vite pour le serveur local et le build
- Serveur Node (`server.mjs`) qui sert `dist/` et expose `POST /api/contact` (envoi d'email via Resend)
- Les données publiques (Notion, avis Google) sont générées au build

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

## Déploiement (VPS OVH + Dokploy)

Le site tourne sur un VPS OVHcloud (Gravelines, France) piloté par Dokploy. Le `Dockerfile` construit le site (`npm run build`) puis `server.mjs` sert `dist/` et le formulaire de contact sur le port `3000`. Domaine : `dev.ester-sas.fr`. Un push sur `develop` redéploie automatiquement.

Build args (utilisés au `docker build`) :

- `ESTER_MODE=prod`
- `NOTION_TOKEN`
- `NOTION_DATABASE_ID`
- `GOOGLE_PLACES_API_KEY`
- `GOOGLE_PLACE_ID`
- `VITE_APP_VERSION`

Variables d'environnement runtime (formulaire de contact, `POST /api/contact`) :

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `RESEND_FROM` (optionnel, expéditeur sur un domaine vérifié chez Resend)

## Gitflow

`main` → production, `develop` → intégration, `feature/xxx` → branches de travail.

Tags : `vMAJEUR.MINEUR.PATCH`.

## Licence

Code propriétaire — tous droits réservés.

## Hébergement

- **Dev** : VPS OVH via Dokploy, `https://dev.ester-sas.fr` (branche `develop`, build par `Dockerfile`, `server.mjs` sert `dist/` et le formulaire de contact). Un push sur `develop` redéploie automatiquement.
- **Prod** : à mettre en place (domaine `ester-sas.fr`, actuellement chez OVH).
