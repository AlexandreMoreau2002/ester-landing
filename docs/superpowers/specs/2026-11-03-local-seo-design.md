# Local SEO — design

## Intention

Faire de `ester-sas.fr` la source unique comprise par les moteurs et préparer la visibilité locale à Gap sans attendre l'accès au compte Google de Philippe.

## Décisions

- Le domaine canonique est `https://ester-sas.fr` (sans `www`), car il est affiché comme adresse publique de production.
- `www.ester-sas.fr` redirige en 308 vers le domaine canonique en conservant chemin, requête et méthode HTTP.
- Les balises canonical, Open Graph, sitemap, robots et JSON-LD emploient le même hôte canonique.
- Le JSON-LD LocalBusiness doit être du JSON valide et rester factuel : identité, adresse, téléphone, services et zone desservie.
- Aucun outil Google, tag Analytics, profil Business ou contenu de fiche externe n'est créé sans le compte/accord du représentant de l'entreprise.

## Hors périmètre

- Revendiquer ou modifier une fiche Google Business Profile.
- Créer Analytics/Search Console avec un compte personnel à la place du compte métier.
- Inventer des avis, horaires, photos, services ou zones d'intervention.
