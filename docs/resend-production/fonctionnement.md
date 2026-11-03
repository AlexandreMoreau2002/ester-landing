# Formulaire de contact en production

Le formulaire est la boîte aux lettres du site : un visiteur écrit, le site transmet le message à Resend, puis Resend le dépose dans la boîte ESTER.

```text
Visiteur
   |
   v
https://ester-sas.fr/#contact
   |
   | POST /api/contact
   v
server.mjs -> server/contact-mail.mjs
   |
   | clé Resend (variable Dokploy, jamais Git)
   v
api.resend.com
   |
   v
contact@ester-bet.fr
```

## Environnements

| Environnement | Domaine | Branche | Destinataire |
| --- | --- | --- | --- |
| Dev | `dev.ester-sas.fr` | `develop` | `pricedelu@gmail.com` |
| Production | `ester-sas.fr`, `www.ester-sas.fr` | `main` | `contact@ester-bet.fr` |

Chaque application Dokploy possède une clé Resend distincte et les variables runtime suivantes :

```text
PORT=3000
RESEND_API_KEY=<secret>
RESEND_FROM=ESTER Site Web <contact@ester-sas.fr>
CONTACT_TO_EMAIL=<destinataire de l'environnement>
```

Le domaine Resend `ester-sas.fr` est vérifié par DKIM et deux CNAME (`rsend`, `send`) dans la zone OVH. Les enregistrements MX existants ne sont pas modifiés.

## Déploiement

Dokploy sert les deux domaines de production avec HTTPS Let's Encrypt. Les A records `@` et `www` pointent vers le VPS `51.178.37.35`. Le déploiement production suit `main`; le dev suit `develop`.

Ne jamais placer une clé Resend dans le dépôt, un fichier `.env` commité, la documentation ou un ticket.
