# Guide de test manuel — contact ESTER

## Prérequis

- Le domaine visé répond en HTTPS.
- L'application Dokploy est au statut `done`.
- Les quatre variables runtime de contact sont présentes dans Dokploy.
- Le domaine `ester-sas.fr` est vérifié dans Resend.

## Scénario principal

1. Ouvrir `https://ester-sas.fr/#contact`.
2. Renseigner nom, prénom, email, sujet et message.
3. Envoyer le formulaire.
4. Vérifier le message de succès affiché par le site.
5. Vérifier la réception dans `contact@ester-bet.fr` et la présence du bon `reply-to`.
6. Vérifier dans Resend que l'email est marqué délivré.

## Pièce jointe

1. Refaire le scénario avec un PDF de moins de 10 Mo.
2. Vérifier que la pièce jointe est présente dans l'email reçu.
3. Essayer un fichier vide puis un fichier supérieur à 10 Mo : le navigateur doit empêcher l'envoi ou le serveur doit répondre sans succès.

## Cas limites

- Omettre un champ obligatoire : le formulaire doit garder le visiteur sur le champ à corriger.
- Utiliser une adresse de réponse externe : le message doit partir de `contact@ester-sas.fr`, avec l'adresse du visiteur en réponse.
- Tester `https://www.ester-sas.fr/` : la page doit répondre en HTTPS.

## Checklist

- [ ] HTTP 200 sur `https://ester-sas.fr/`
- [ ] HTTP 200 sur `https://www.ester-sas.fr/`
- [ ] Formulaire sans pièce jointe reçu
- [ ] Formulaire avec pièce jointe reçu
- [ ] Email visible dans les logs Resend
- [ ] Aucun secret dans Git
