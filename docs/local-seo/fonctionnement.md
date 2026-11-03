# Référencement local — fonctionnement

## But

Ce document décrit les signaux techniques locaux du site ESTER et les vérifications à effectuer après déploiement. Le domaine canonique est `https://ester-sas.fr/` (apex). `https://www.ester-sas.fr` redirige de façon permanente vers l’apex avec le statut HTTP 308, en conservant le chemin et la query string.

## Flux

```text
Navigateur ou robot
        |
        +-- ester-sas.fr --------------------> site (URL canonique)
        |
        +-- www.ester-sas.fr/chemin?x=1
                    |
                    +-- 308 Location: https://ester-sas.fr/chemin?x=1

robots.txt -- annonce --> https://ester-sas.fr/sitemap.xml
                                  |
                                  +-- URLs publiques de l’apex
```

La page d’accueil porte une URL canonical et les alternates `hreflang` sur l’apex. Le sitemap publie les URL de la page d’accueil et des mentions légales sur l’apex. `robots.txt` autorise l’exploration et annonce ce sitemap. Les données structurées JSON-LD décrivent ESTER comme entreprise de services locale, avec ses coordonnées, son adresse et ses zones desservies.

## Limites sans accès Google

Le code et les contrôles HTTP permettent de valider les signaux publiés par le site. Ils ne permettent pas de vérifier l’indexation effective, les erreurs vues par Google, les performances de recherche, ni la fiche Google Business Profile. Aucun compte Google, propriété Search Console ou fiche Business Profile n’est créé ni modifié dans le cadre de ce travail.

Pour poursuivre avec le propriétaire du compte, récupérer ce soir :

1. **Google Search Console** : l’adresse du compte Google propriétaire ou administrateur de la propriété `ester-sas.fr`, et l’invitation d’un utilisateur à l’adresse Google qui réalisera le suivi. Confirmer le type de propriété existant (Domaine ou Préfixe d’URL) et les méthodes de validation déjà en place. Ne pas demander ni partager de mot de passe ou de code de récupération.
2. **Google Business Profile** : l’adresse du compte propriétaire/gestionnaire de la fiche ESTER, l’URL publique ou le lien Maps de la fiche, et l’invitation de l’adresse Google de suivi avec le rôle nécessaire. Confirmer le nom, l’adresse affichée et le statut de vérification de la fiche.
3. Si aucun accès ou actif n’existe, demander au représentant autorisé d’ESTER qui doit en être propriétaire et d’organiser sa création/validation dans Google. Cette documentation ne crée aucun compte ni actif Google.

## Fichiers concernés

- `index.html` : canonical, hreflang, balises sociales et JSON-LD LocalBusiness/ProfessionalService.
- `public/robots.txt` : autorisation d’exploration et URL du sitemap.
- `public/sitemap.xml` : liste des URL publiques canoniques.
- `server.mjs` : redirection permanente de l’hôte `www` vers l’apex.
- `docs/local-seo/guide-test.md` et `http/local-seo.http` : contrôles manuels reproductibles.
