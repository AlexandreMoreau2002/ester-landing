# Guide de test manuel — actualisation ESTER

## Prérequis et périmètre

Ce guide décrit une recette sur la production uniquement. Aucun envoi de courriel depuis un serveur local ou l'environnement de développement. Les accès, modifications externes et déploiements sont réservés au responsable d'exploitation après revue des documents et confirmation explicite au moment de l'action. Ce document ne vaut pas autorisation d'exécuter ces opérations.

Préparer la version validée, l'accès autorisé à Dokploy/Resend/Notion, une boîte de test contrôlée et le destinataire final. Garder les valeurs de variables dans le gestionnaire de secrets ou les consoles privées ; ne pas les recopier dans Git, captures ou rapports. Relever la configuration existante dans cet espace privé pour pouvoir la restaurer.

## 1. Vérifier Resend avant tout déploiement

1. Après confirmation explicite, ouvrir le domaine expéditeur dans Resend.
2. Vérifier que `ester-sas.fr` est déclaré et que le statut du domaine est **Verified**. En cas d'attente ou d'erreur, arrêter la procédure.
3. Si nécessaire, faire appliquer par le responsable DNS les enregistrements exacts affichés par Resend, sans remplacer les enregistrements de messagerie existants. Attendre puis relancer la vérification Resend.
4. Vérifier que la clé d'envoi est autorisée pour ce domaine et que `RESEND_FROM` correspond à `ESTER Site Web <contact@ester-sas.fr>`.

## 2. Préparer Dokploy sans perdre les variables

1. Après confirmation de cette modification et du déploiement, sélectionner l'application de production et vérifier sa branche/version. Préserver toutes les variables étrangères à ce changement.
2. Copier `NOTION_TOKEN` et `NOTION_DATABASE_ID` dans **Environment** runtime, puis retirer uniquement ces deux entrées des **Build Args**. Vérifier le partage de la base avec l'intégration.
3. Conserver au build `ESTER_MODE=prod`, les deux variables Google et `VITE_APP_VERSION`.
4. Définir les trois variables runtime `RESEND_API_KEY`, `RESEND_FROM` et `CONTACT_TO_EMAIL`. Pour cette première phase, le destinataire est la boîte de test convenue ; son adresse reste hors du dépôt.
5. Vérifier une dernière fois **Verified** dans Resend. Sauvegarder sans écraser les autres réglages, puis redéployer. Attendre un déploiement sain ; ne pas lancer plusieurs builds simultanément sur le VPS.

## 3. Vérifier la production sans envoyer de message

1. Ouvrir le domaine de production configuré dans Dokploy ; vérifier HTTPS et la version attendue.
2. En FR puis EN, vérifier les textes, l'adresse publique `estersarl.ing@gmail.com`, les liens de contact et le titre contenant « ingénierie structurelle » en FR.
3. Ouvrir les mentions légales ; dans Réseau, vérifier l'absence de 404 sur CSS, JS, images et `assets/favicon-32.png`. Vérifier le favicon de l'onglet.
4. Lire `GET /api/realisations` : attendre `200`, `Cache-Control: no-store` et `{ "realisations": [...] }`, sans token ni identifiant de base. Vérifier cartes et pagination.
5. Après autorisation d'édition Notion, modifier temporairement un titre publié. Garder l'onglet visible et attendre jusqu'à environ deux minutes plus la latence. Vérifier la mise à jour sans déploiement, puis restaurer le titre et constater sa restauration.

## 4. Envoyer un seul test contrôlé

1. Confirmer que le conteneur actif utilise la boîte de test et le domaine vérifié. Préparer un message identifiable, sans donnée sensible et sans pièce jointe.
2. Obtenir une confirmation explicite **juste avant l'envoi public**. Ne pas appeler préalablement `POST /api/contact` pour vérifier qu'il répond : cet appel enverrait déjà un courriel.
3. Soumettre une seule fois le formulaire de production. L'alternative REST Client remplace cet envoi ; elle ne s'y ajoute pas.
4. Vérifier une réponse `200` avec `{ "ok": true }`, puis le message de succès affiché. En cas d'erreur, ne pas multiplier les tentatives.
5. Vérifier boîte principale et indésirables de la boîte de test, activité de livraison Resend et logs applicatifs Dokploy. Distinguer acceptation API et réception effective ; noter heure et statuts seulement, sans contenu privé ni secrets.
6. Si la réception n'est pas confirmée, garder la phase de test ouverte et diagnostiquer avant toute nouvelle soumission.

## 5. Basculer vers le destinataire final

1. Après réception confirmée et confirmation explicite de la bascule, remplacer uniquement `CONTACT_TO_EMAIL` par `estersarl.ing@gmail.com`.
2. Préserver les autres variables et redéployer. Vérifier le déploiement sain et le destinataire configuré dans l'environnement actif, sans le publier dans des logs.
3. Aucun second envoi automatique : tout nouveau test demande une nouvelle confirmation à l'instant de l'action.
4. En cas de déploiement défaillant, restaurer la configuration/version privée relevée avant intervention, après accord du responsable, puis vérifier l'état du service.

## Cas limites à vérifier avec des doubles de test, sans modifier la production

- Configuration Notion absente et cache vide : `503` générique, message d'attente FR/EN.
- Liste publiée vide : état d'attente, aucune carte ou pagination fantôme.
- Panne Notion après une bonne lecture : dernière liste conservée ; reprise après expiration du cache.
- Plus de 100 lignes : toutes les pages traitées, aucune liste partielle si une page échoue.
- Onglet masqué puis visible, initialisation répétée ou réponse lente : pas de minuteur ou requête dupliqué.
- Erreur contact, variables manquantes ou refus Resend : aucun faux succès. Ne pas provoquer ces pannes sur le service public.

## Checklist et relevé de statut

- [ ] Domaine expéditeur Verified avant déploiement.
- [ ] Variables Notion déplacées au runtime, autres variables préservées.
- [ ] Version, HTTPS, contenus FR/EN, mentions légales, favicon et ressources vérifiés.
- [ ] API CMS et actualisation sans redéploiement vérifiées ; donnée de test restaurée.
- [x] Test du formulaire de production réussi et message reçu dans la boîte de test.
- [ ] Activité Resend et logs vérifiés sans recopier de données sensibles.
- [x] Destinataire final rétabli et production redéployée avec succès.

Statut de recette au 4 novembre 2026, confirmé par le responsable : le formulaire de production a affiché le succès et le message a été reçu dans la boîte de test. `CONTACT_TO_EMAIL` a ensuite été rétabli vers `estersarl.ing@gmail.com` et la production a été redéployée avec succès. Les autres cases restent à renseigner selon leurs preuves respectives. Conserver uniquement date, version et résultats dans le relevé, jamais les secrets ni l'adresse de test.
