# Guide de test manuel — SEO local

## Prérequis

- Le site est déployé et accessible sur `https://ester-sas.fr` et `https://www.ester-sas.fr`.
- VS Code avec l’extension REST Client, ou `curl` dans un terminal.
- Pour contrôler les fichiers de production localement : lancer `npm run build`, puis démarrer le serveur statique du projet avec `node server.mjs` (il sert `dist` par défaut). Le preview Vite peut servir à contrôler le contenu, mais ne reproduit pas la redirection d’hôte du serveur de production.

## Scénarios

### 1. Vérifier la redirection de `www`

1. Envoyer une requête GET vers `https://www.ester-sas.fr/mentions-legales.html?source=manual` sans suivre les redirections.
2. Vérifier le statut `308`.
3. Vérifier l’en-tête `Location: https://ester-sas.fr/mentions-legales.html?source=manual`.
4. Répéter avec une requête HEAD sur `https://www.ester-sas.fr/`.

Résultat attendu : les deux variantes arrivent sur l’apex, et le chemin ainsi que la query string sont conservés.

### 2. Vérifier robots.txt et le sitemap

1. Ouvrir `https://ester-sas.fr/robots.txt`.
2. Confirmer `User-agent: *`, `Allow: /` et `Sitemap: https://ester-sas.fr/sitemap.xml`.
3. Ouvrir `https://ester-sas.fr/sitemap.xml`.
4. Vérifier que les URL `<loc>` et les alternates éventuels utilisent `https://ester-sas.fr` et qu’aucune URL `www` n’est publiée.
5. Vérifier que le sitemap répond en XML et que toutes ses URL sont accessibles.

### 3. Vérifier les signaux de la page

1. Ouvrir `https://ester-sas.fr/` et afficher le code source HTML (pas seulement le DOM modifié par JavaScript).
2. Confirmer qu’il existe un seul lien `rel="canonical"` vers `https://ester-sas.fr/`.
3. Vérifier les liens `hreflang` attendus et les métadonnées `og:url` sur l’apex.
4. Vérifier que le script JSON-LD est du JSON valide et décrit ESTER avec une adresse à Gap, une URL canonique et des coordonnées cohérentes avec les informations officielles.
5. Vérifier que chaque URL d’image/ressource annoncée dans les métadonnées répond correctement.

### 4. Vérifier les accès Google avec le propriétaire

1. Demander quelle adresse Google administre déjà Search Console pour `ester-sas.fr` et quelle adresse doit recevoir l’invitation.
2. Demander au propriétaire de confirmer la propriété existante et d’inviter l’adresse de suivi; ne jamais collecter de mot de passe ou code de récupération.
3. Demander le lien de la fiche Google Business Profile et l’adresse qui en est propriétaire/gestionnaire.
4. Demander au propriétaire d’inviter l’adresse de suivi avec le rôle adapté, puis confirmer que l’invitation est reçue.
5. Si aucun actif n’existe, transmettre le besoin au représentant autorisé pour décision et création par ses soins. Ne pas créer de compte Google, propriété Search Console ou fiche depuis cette procédure.

## Cas limites

- `www` avec un chemin imbriqué, encodé ou une query string doit conserver l’URL après redirection.
- Les variantes HTTP, les domaines de préproduction et les hôtes inconnus ne sont pas couverts par la règle `www` documentée ici. Vérifier séparément leur configuration d’infrastructure avant de les déclarer canoniques.
- Un sitemap accessible ne prouve pas que Google l’a récupéré ou a indexé ses pages.
- Le balisage JSON-LD valide ne garantit ni affichage enrichi ni classement local.
- Le lien Google Maps présent sur le site ne prouve pas que l’entreprise contrôle la fiche correspondante.
- Une fiche non vérifiée, une adresse incorrecte ou un accès absent nécessite une action du propriétaire autorisé.

## Checklist finale

- [ ] `www` renvoie un 308 vers l’apex avec chemin et query string préservés.
- [ ] `robots.txt` répond et annonce le sitemap apex.
- [ ] Le sitemap répond, contient les URL attendues et n’expose aucune URL `www`.
- [ ] La page d’accueil annonce une canonical unique sur l’apex.
- [ ] Les alternates et métadonnées sociales utilisent l’apex.
- [ ] Le JSON-LD est valide et les données d’entreprise sont exactes.
- [ ] Les contacts Google à récupérer sont identifiés pour Search Console et Business Profile.
- [ ] Aucun compte Google ni actif Google n’a été créé par ce travail.
