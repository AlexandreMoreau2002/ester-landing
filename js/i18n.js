'use strict';

/* ═══════════════════════════════════════════════════════════
   ESTER SAS — Traductions FR / EN
   Usage : data-i18n="clé"       → textContent
           data-i18n-html="clé"  → innerHTML
           data-i18n-attr="clé"  → attribut ciblé via data-i18n-target
═══════════════════════════════════════════════════════════ */

const TRANSLATIONS = {

  fr: {
    /* ── Navigation ───────────────────────────────────── */
    'nav.services':          'Services',
    'nav.realisations':      'Réalisations',
    'nav.entreprise':        'L\'entreprise',
    'nav.rejoindre':         'Rejoindre',
    'nav.contact':           'Nous contacter',
    'nav.logo.aria':         'ESTER SAS — Accueil',
    'nav.desktop.aria':      'Navigation principale',
    'nav.lang.aria':         'Langue / Language',
    'nav.burger.open':       'Ouvrir le menu',
    'nav.burger.close':      'Fermer le menu',
    'nav.overlay.aria':      'Menu de navigation',
    'nav.logo.sub':          'Études Techniques<br/>&amp; TP Structures BA',
    /* Sous-titres overlay mobile */
    'nav.sub.services':      'Études béton armé, expertises',
    'nav.sub.realisations':  '50+ projets dans les Hautes‑Alpes',
    'nav.sub.entreprise':    'Une équipe à Gap depuis 1977',
    'nav.sub.rejoindre':     'Postes ouverts · alternance',

    /* ── Hero ─────────────────────────────────────────── */
    'hero.kicker':       'Hautes-Alpes · Fondé en 1977 · OPQIBI 1202',
    'hero.kicker.short': 'Gap · Depuis 1977',
    'hero.heading':      'L\'ingénierie structure<br />à Gap, <em>depuis 49&nbsp;ans.</em>',
    'hero.sub':          'ESTER SAS accompagne architectes, maîtres d\'ouvrage et collectivités des Hautes-Alpes dans leurs projets structurels. Dimensionnement béton, expertise et suivi de chantier.',
    'hero.sub.short':    'ESTER SAS — études structures béton, expertise et suivi de chantier dans les Hautes-Alpes.',
    'hero.cta.write':    'Nous écrire',
    'hero.address':      '3 bis avenue Maréchal Foch · 05000 Gap',

    /* ── Certifications ───────────────────────────────── */
    'certif.opqibi.title': 'Qualification OPQIBI 1202',
    'certif.opqibi.desc':  'Structures béton courantes · Valide jusqu\'en 2029',
    'certif.decennale.title': 'Assurance décennale',
    'certif.decennale.desc':  'MMA — Responsabilité couverte sur 10 ans',
    'certif.founded.title': 'Fondée en 1977',
    'certif.founded.desc':  'Près de 50 ans de présence locale continue',
    'certif.location.title': 'Gap, Hautes-Alpes',
    'certif.location.desc':  'Ancrage local, connaissance du territoire alpin',

    /* ── Services ─────────────────────────────────────── */
    'services.kicker':  'Nos domaines d\'intervention',
    'services.heading': 'Une expertise technique complète,<br />du dimensionnement au suivi de chantier.',
    'services.s1.title': 'Études de structures béton',
    'services.s1.desc':  'Calcul de structure et vérification des éléments porteurs en béton armé pour constructions neuves, extensions et réhabilitations. Notes de calcul conformes aux Eurocodes (Eurocode 2 béton, Eurocode 8 sismique).',
    'services.s2.title': 'Évaluation des risques',
    'services.s2.desc':  'Diagnostic structurel de bâtiments existants, expertise des pathologies et évaluation des risques. Rapports techniques circonstanciés incluant les préconisations de renforcement structurel, pour maîtres d\'ouvrage et assureurs.',
    'services.s3.title': 'Études de faisabilité',
    'services.s3.desc':  'Analyse structurelle en phase de conception pour valider la faisabilité technique d\'un projet avant dépôt de permis, en tenant compte des contraintes sismiques et alpines propres aux Hautes-Alpes (zone 3, Gap). Aide à la décision pour les maîtres d\'ouvrage.',
    'services.s4.title': 'Suivi de chantier',
    'services.s4.desc':  'Visites de contrôle, levée de réserves structurelles et assistance technique en phase d\'exécution. Interlocuteur technique disponible tout au long du chantier, sur Gap et dans les Hautes-Alpes.',
    'services.quote':    'Demander un devis →',
    'services.s1.quote.aria': 'Nous contacter pour les études de structures béton',
    'services.s2.quote.aria': 'Nous contacter pour l\'évaluation des risques',
    'services.s3.quote.aria': 'Nous contacter pour une étude de faisabilité',
    'services.s4.quote.aria': 'Nous contacter pour un suivi de chantier',

    /* ── Réalisations ─────────────────────────────────── */
    'real.kicker':  'Projets récents',
    'real.heading': 'Des réalisations ancrées dans le territoire alpin.',
    'real.intro':   'Établissements scolaires, logements collectifs, bâtiments publics, ouvrages en montagne — ESTER intervient sur des projets variés dans les Hautes-Alpes et la région PACA.',
    'real.p1.loc':   'Gap — 05',
    'real.p2.loc':   'Briançon — 05',
    'real.p3.loc':   'Embrun — 05',
    'real.p4.loc':   'Hautes-Alpes — 05',
    'real.p5.loc':   'Gap — 05',
    'real.p6.loc':   'PACA',
    'real.p1.type':  'Bâtiment public · Réhabilitation',
    'real.p1.title': 'Restructuration d\'une école primaire',
    'real.p1.desc':  'Diagnostic structurel, étude de renforcement et suivi d\'exécution pour la mise aux normes sismiques.',
    'real.p2.type':  'Logement collectif · Construction neuve',
    'real.p2.title': 'Structure béton d\'un immeuble R+4',
    'real.p2.desc':  'Dimensionnement complet de la structure béton armé, des fondations aux planchers en zone sismique.',
    'real.p3.type':  'Collectivité · Expertise',
    'real.p3.title': 'Expertise d\'une salle polyvalente',
    'real.p3.desc':  'Évaluation des désordres structurels, rapport technique et préconisations de réparation pour la commune.',
    'real.p4.type':  'Tourisme · Faisabilité',
    'real.p4.title': 'Résidence en altitude — étude de faisabilité',
    'real.p4.desc':  'Étude de faisabilité structurelle pour un projet de résidence touristique sur site contraint en zone de montagne.',
    'real.p5.type':  'Enseignement · Extension',
    'real.p5.title': 'Extension d\'un lycée professionnel',
    'real.p5.desc':  'Études structure pour l\'extension d\'un établissement scolaire public, coordination avec l\'architecte mandataire.',
    'real.p6.type':  'Industriel · Rénovation',
    'real.p6.title': 'Reconversion d\'un bâtiment industriel',
    'real.p6.desc':  'Diagnostic, calcul de renforcement et accompagnement technique pour la reconversion en locaux tertiaires.',

    /* ── Pourquoi ESTER ───────────────────────────────── */
    'why.kicker':  'L\'entreprise',
    'why.heading': 'Un bureau d\'études à taille humaine, ancré dans les Alpes.',
    'why.lead':    'Depuis près de 50 ans, ESTER accompagne les projets structurels des Hautes-Alpes avec une expertise technique reconnue et une relation directe avec ses clients.',
    'why.quote':   'Chaque projet mérite une attention technique rigoureuse et un interlocuteur disponible, du premier calcul à la réception des travaux.',
    'why.quote.author': '— Philippe Duez, dirigeant ESTER SAS',
    'why.p1.title': 'Ancienneté et continuité',
    'why.p1.desc':  'Fondée en 1977, ESTER a accompagné des décennies de constructions dans les Hautes-Alpes. Une mémoire technique locale difficile à égaler.',
    'why.p2.title': 'Qualification OPQIBI certifiée',
    'why.p2.desc':  'Qualification 1202 — structures béton courantes, valide jusqu\'en 2029. Un gage objectif de compétence technique reconnu par la profession.',
    'why.p3.title': 'Connaissance du territoire alpin',
    'why.p3.desc':  'Sismicité, neige, contraintes de montagne — ESTER maîtrise les spécificités techniques des projets alpins que les bureaux d\'études éloignés ignorent souvent.',
    'why.p4.title': 'Relation directe, sans intermédiaire',
    'why.p4.desc':  'Structure à taille humaine : vous échangez directement avec les ingénieurs qui travaillent sur votre dossier. Pas de transfert entre commerciaux et techniciens.',
    'why.p5.title': 'Réactivité et disponibilité',
    'why.p5.desc':  'Délais de réponse courts, interlocuteur joignable, suivi régulier — une réactivité que les structures de grande taille peuvent difficilement garantir.',
    'why.p6.title': 'Accompagnement de bout en bout',
    'why.p6.desc':  'De la faisabilité au suivi de chantier, ESTER peut intervenir à chaque étape du projet, assurant une cohérence technique et une continuité du suivi.',

    /* ── Avis ─────────────────────────────────────────── */
    'avis.kicker':  'Témoignages',
    'avis.heading': 'Ce que disent nos clients.',
    'avis.link':    'Voir les avis sur Google Maps →',
    'avis.stars.aria': '{note} étoile(s) sur 5',
    'avis.google.reviews': '{note}/5 · {total} avis Google',
    'avis.a1.text':   '"Cabinet sérieux, disponible et rigoureux. Philippe Duez a suivi notre chantier de réhabilitation avec une implication réelle. Les délais ont été tenus et la communication a été claire du début à la fin."',
    'avis.a1.name':   'Arnaud M.',
    'avis.a1.role':   'Architecte DPLG · Gap',
    'avis.a2.text':   '"Nous faisons appel à ESTER pour les projets de notre collectivité depuis plusieurs années. Leur connaissance du territoire et leur réactivité sont des atouts réels pour nos marchés publics."',
    'avis.a2.name':   'Service technique',
    'avis.a2.role':   'Collectivité locale · Hautes-Alpes',
    'avis.a3.text':   '"L\'étude de structure a été menée avec précision et dans les délais convenus, malgré la complexité du site en altitude. Un accompagnement technique de qualité, sans jargon inutile."',
    'avis.a3.name':   'C. Fontaine',
    'avis.a3.role':   'Maître d\'ouvrage privé · Briançon',

    /* ── Recrutement ──────────────────────────────────── */
    'recru.kicker':    'Rejoindre l\'équipe',
    'recru.heading':   'Exercer votre métier dans les Alpes.',
    'recru.desc':      'ESTER est une structure à taille humaine où les ingénieurs travaillent sur des projets variés, avec une autonomie réelle et une proximité directe avec la direction. Le cadre de vie dans les Hautes-Alpes — montagne, ski, escalade, qualité de l\'air — est un avantage que peu de postes d\'ingénieur structure peuvent offrir.',
    'recru.li1': 'Projets variés : logement, ERP, bâtiments industriels, réhabilitations',
    'recru.li2': 'Environnement technique rigoureux, taille humaine',
    'recru.li3': 'Gap, préfecture des Hautes-Alpes — qualité de vie exceptionnelle',
    'recru.li4': 'Interlocuteur direct avec la direction',
    'recru.cta.label': 'Ingénieur·e structure expérimenté·e',
    'recru.cta.sub':   'Envoyez votre candidature spontanée',
    'recru.cta.btn':   'Candidature spontanée',

    /* ── Contact ──────────────────────────────────────── */
    'contact.kicker':  'Contact',
    'contact.heading': 'Parlons de votre projet.',
    'contact.intro':   'Devis, questions techniques, demande d\'information — nous répondons dans les meilleurs délais.',
    'contact.nom.label':      'Nom',
    'contact.nom.placeholder':'Votre nom',
    'contact.soc.label':      'Société / Cabinet',
    'contact.soc.placeholder':'Nom de votre structure',
    'contact.email.label':    'Email',
    'contact.email.placeholder':'votre@email.fr',
    'contact.tel.label':      'Téléphone',
    'contact.tel.placeholder':'06 XX XX XX XX',
    'contact.sujet.label':    'Nature de la demande',
    'contact.sujet.default':  'Sélectionnez',
    'contact.sujet.o1': 'Étude de structure béton',
    'contact.sujet.o2': 'Évaluation des risques',
    'contact.sujet.o3': 'Étude de faisabilité',
    'contact.sujet.o4': 'Suivi de chantier',
    'contact.sujet.o5': 'Autre demande',
    'contact.msg.label':      'Message',
    'contact.msg.placeholder':'Décrivez brièvement votre projet ou votre demande…',
    'contact.mention': 'Les champs marqués * sont obligatoires. Vos données ne sont utilisées qu\'aux fins de réponse à votre demande.',
    'contact.submit':  'Envoyer le message',
    'contact.success': 'Message envoyé. Nous vous répondrons dans les meilleurs délais.',
    'contact.map.directions': 'Itinéraire Google Maps →',

    /* ── Pagination ──────────────────────────────────── */
    'pagination.prev': '← Précédent',
    'pagination.next': 'Suivant →',
    'pagination.nav.aria': 'Navigation des réalisations',
    'pagination.prev.aria': 'Page précédente',
    'pagination.next.aria': 'Page suivante',
    'pagination.dot.aria': 'Page {page} sur {total}',

    /* ── Réalisations empty state ─────────────────────── */
    'realisations.empty.label': 'Zone réservée · projets à venir',
    'realisations.empty': 'Pas encore de projets à vous présenter,<br/><em>mais ça ne saurait tarder.</em>',

    /* ── Footer ───────────────────────────────────────── */
    'footer.baseline': 'Bureau d\'études en ingénierie structurelle<br/>depuis 1977 · Gap, Hautes-Alpes',
    'footer.nav.aria': 'Navigation pied de page',
    'footer.hosting': 'Hébergement : Netlify Inc., 512 2nd Street, San Francisco, CA 94107',
    'footer.copy': 'ESTER SAS. Tous droits réservés.',
    'footer.ml': 'Mentions légales & confidentialité',

    /* ── Métadonnées ──────────────────────────────────── */
    'meta.home.title': 'ESTER SAS — Bureau d\'études structure · Gap, Hautes-Alpes',
    'meta.home.description': 'Bureau d\'études structure à Gap (Hautes-Alpes) depuis 1977. Calcul de structure béton, expertise et suivi de chantier. Qualification OPQIBI 1202.',
    'meta.home.og.title': 'ESTER SAS — Bureau d\'études structure · Gap',
    'meta.home.og.description': 'Études structurelles, faisabilité et suivi de chantier pour les projets publics et privés des Hautes-Alpes. Implanté à Gap depuis 1977.',

    /* ── Attributs contact ────────────────────────────── */
    'contact.loading': 'Envoi…',
    'contact.map.aria': 'Localisation ESTER SAS — 3 bis avenue Maréchal Foch, 05000 Gap',
    'contact.map.title': 'Carte Google Maps — ESTER SAS, 3 bis avenue Maréchal Foch, 05000 Gap',

    /* ── Mentions légales ─────────────────────────────── */
    'legal.meta.title': 'ESTER SAS — Mentions légales',
    'legal.logo.sub': 'Études Techniques<br/>&amp; TP Structures BA',
    'legal.back': '← Retour à l\'accueil',
    'legal.eyebrow': 'Informations légales',
    'legal.heading': 'Mentions <em>légales</em>',
    'legal.intro': 'Conformément aux articles 6‑III et 19 de la Loi n° 2004‑575 du 21 juin 2004 pour la Confiance dans l\'économie numérique (LCEN).',
    'legal.publisher.title': 'Éditeur du site',
    'legal.publisher.company.label': 'Raison sociale',
    'legal.publisher.legal.label': 'Forme juridique',
    'legal.publisher.legal.value': 'Société par actions simplifiée',
    'legal.publisher.address.label': 'Siège social',
    'legal.publisher.phone.label': 'Téléphone',
    'legal.publisher.capital.label': 'Capital social',
    'legal.publisher.rcs.label': 'RCS',
    'legal.publisher.director.label': 'Directeur de la publication',
    'legal.host.title': 'Hébergeur',
    'legal.host.value': '<strong style="color:white">Netlify, Inc.</strong><br/>512 2nd Street, Suite 200<br/>San Francisco, CA 94107, États‑Unis<br/><span style="color:rgba(255,255,255,.55)">netlify.com</span>',
    'legal.host.note': 'Les données de visite sont susceptibles d\'être transférées hors de l\'Union européenne (États‑Unis). Netlify adhère au cadre <em>EU‑US Data Privacy Framework</em> certifié par le Département du Commerce américain, garantissant un niveau de protection adéquat conformément à la décision d\'adéquation de la Commission européenne du 10 juillet 2023.',
    'legal.insurance.title': 'Assurance professionnelle',
    'legal.insurance.insurer.label': 'Assureur',
    'legal.insurance.cover.label': 'Garantie',
    'legal.insurance.cover.value': 'Responsabilité civile professionnelle et décennale',
    'legal.insurance.zone.label': 'Zone de couverture',
    'legal.insurance.zone.value': 'France métropolitaine',
    'legal.privacy.title': 'Données personnelles &amp; RGPD',
    'legal.privacy.intro': 'Conformément au Règlement (UE) 2016/679 (RGPD) et à la Loi Informatique et Libertés modifiée, vous disposez d\'un droit d\'accès, de rectification, d\'effacement, de portabilité, de limitation et d\'opposition au traitement de vos données.',
    'legal.privacy.controller.label': 'Responsable du traitement',
    'legal.privacy.legalbasis.label': 'Base légale',
    'legal.privacy.legalbasis.value': 'Consentement (formulaire de contact) — art. 6.1.a du RGPD<br/>Intérêt légitime (mesure d\'audience anonyme) — art. 6.1.f',
    'legal.privacy.data.label': 'Données collectées',
    'legal.privacy.data.value': 'Via le formulaire de contact : nom, e‑mail, message, et toute donnée que vous choisissez de communiquer. Aucun cookie publicitaire n\'est déposé.',
    'legal.privacy.retention.label': 'Durée de conservation',
    'legal.privacy.retention.value': '3 ans à compter du dernier contact pour les prospects ; durée de la relation contractuelle pour les clients, puis archivage conforme aux obligations légales.',
    'legal.privacy.processor.label': 'Sous‑traitant — formulaire',
    'legal.privacy.processor.value': '<span class="placeholder">{{ form_provider }}</span> traite les soumissions du formulaire pour notre compte. Aucun partage de données à des fins commerciales.',
    'legal.privacy.rights.label': 'Exercer vos droits',
    'legal.privacy.rights.value': 'Par courrier à l\'adresse du siège, ou par e‑mail à <a href="mailto:contact@ester-bet.fr" style="color:white">contact@ester-bet.fr</a>.<br/>Réclamation possible auprès de la <strong>CNIL</strong> (<a href="https://www.cnil.fr">cnil.fr</a>).',
    'legal.third.title': 'Services tiers intégrés',
    'legal.third.maps.label': 'Google Maps',
    'legal.third.maps.value': 'La page Contact intègre une carte Google Maps afin d\'afficher la localisation d\'ESTER SAS au 3 bis avenue Maréchal Foch, 05000 Gap. Lors du chargement de cette carte, votre navigateur établit une connexion avec les serveurs de Google. Des données techniques, telles que votre adresse IP, les informations de votre navigateur et la page consultée, peuvent alors être transmises à Google.',
    'legal.third.purpose.label': 'Finalité',
    'legal.third.purpose.value': 'Ce service est utilisé uniquement pour faciliter l\'accès aux locaux d\'ESTER SAS et proposer un lien d\'itinéraire vers Google Maps. ESTER SAS ne reçoit pas les données collectées par Google dans ce cadre.',
    'legal.third.google.label': 'Politique de confidentialité Google',
    'legal.third.google.value': 'Pour plus d\'informations sur le traitement réalisé par Google, vous pouvez consulter la politique de confidentialité de Google : <a href="https://policies.google.com/privacy" target="_blank" rel="noopener" style="color:white">policies.google.com/privacy</a>.',
    'legal.ip.title': 'Propriété intellectuelle',
    'legal.ip.text': 'L\'ensemble du contenu de ce site (textes, images, photographies, logos, structure) est la propriété exclusive d\'ESTER SAS, sauf mention contraire, et protégé par le Code de la propriété intellectuelle. Toute reproduction, même partielle, est soumise à autorisation préalable écrite.',
    'legal.foot.updated': 'Dernière mise à jour · {{ date_maj }}',
    'legal.foot.company': 'ESTER SAS · Gap, Hautes‑Alpes',
  },

  /* ════════════════════════════════════════════════════
     ENGLISH
  ════════════════════════════════════════════════════ */
  en: {
    /* ── Navigation ───────────────────────────────────── */
    'nav.services':          'Services',
    'nav.realisations':      'Projects',
    'nav.entreprise':        'About',
    'nav.rejoindre':         'Join us',
    'nav.contact':           'Contact us',
    'nav.logo.aria':         'ESTER SAS — Home',
    'nav.desktop.aria':      'Main navigation',
    'nav.lang.aria':         'Language',
    'nav.burger.open':       'Open menu',
    'nav.burger.close':      'Close menu',
    'nav.overlay.aria':      'Navigation menu',
    'nav.logo.sub':          'Technical Studies<br/>&amp; Reinforced Concrete Structures',
    /* Overlay mobile subtitles */
    'nav.sub.services':      'Structural design, assessments',
    'nav.sub.realisations':  '50+ projects in the Hautes‑Alpes',
    'nav.sub.entreprise':    'A team in Gap since 1977',
    'nav.sub.rejoindre':     'Open positions · apprenticeships',

    /* ── Hero ─────────────────────────────────────────── */
    'hero.kicker':       'Hautes-Alpes · Founded in 1977 · OPQIBI 1202',
    'hero.kicker.short': 'Gap · Since 1977',
    'hero.heading':      'Structural engineering<br />in Gap, <em>since 1977.</em>',
    'hero.sub':          'ESTER SAS supports architects, project owners and local authorities in the Hautes-Alpes with their structural projects. Concrete design, expert assessments and site supervision.',
    'hero.sub.short':    'ESTER SAS — structural engineering: concrete design, expert assessments and site supervision in the Hautes-Alpes.',
    'hero.cta.write':    'Write to us',
    'hero.address':      '3 bis avenue Maréchal Foch · 05000 Gap, France',

    /* ── Certifications ───────────────────────────────── */
    'certif.opqibi.title': 'OPQIBI 1202 Qualification',
    'certif.opqibi.desc':  'Standard concrete structures · Valid until 2029',
    'certif.decennale.title': 'Ten-year liability insurance',
    'certif.decennale.desc':  'MMA — Liability covered for 10 years',
    'certif.founded.title': 'Founded in 1977',
    'certif.founded.desc':  'Nearly 50 years of continuous local presence',
    'certif.location.title': 'Gap, Hautes-Alpes',
    'certif.location.desc':  'Local expertise, knowledge of the Alpine territory',

    /* ── Services ─────────────────────────────────────── */
    'services.kicker':  'Our areas of expertise',
    'services.heading': 'Comprehensive technical expertise,<br />from design to site supervision.',
    'services.s1.title': 'Concrete structural studies',
    'services.s1.desc':  'Structural calculation and verification of reinforced concrete load-bearing elements for new constructions, extensions and renovations. Calculations compliant with Eurocodes (Eurocode 2 concrete, Eurocode 8 seismic).',
    'services.s2.title': 'Risk assessment',
    'services.s2.desc':  'Building structural diagnosis, assessment of existing structures and pathology evaluation. Detailed technical reports including structural reinforcement recommendations, for project owners and insurers.',
    'services.s3.title': 'Feasibility studies',
    'services.s3.desc':  'Structural analysis during the design phase to validate the technical feasibility of a project prior to planning permission, taking into account the seismic and Alpine constraints specific to the Hautes-Alpes (seismic zone 3, Gap area). Decision support for project owners.',
    'services.s4.title': 'Site supervision',
    'services.s4.desc':  'Inspection visits, structural defect resolution and technical assistance during construction. A dedicated technical contact throughout the project, serving Gap and the Hautes-Alpes.',
    'services.quote':    'Request a quote →',
    'services.s1.quote.aria': 'Contact us about concrete structural studies',
    'services.s2.quote.aria': 'Contact us about risk assessment',
    'services.s3.quote.aria': 'Contact us about a feasibility study',
    'services.s4.quote.aria': 'Contact us about site supervision',

    /* ── Réalisations ─────────────────────────────────── */
    'real.kicker':  'Recent projects',
    'real.heading': 'Projects rooted in the Alpine territory.',
    'real.intro':   'Schools, residential buildings, public facilities, mountain structures — ESTER works on a wide range of projects across the Hautes-Alpes and the PACA region.',
    'real.p1.loc':   'Gap — 05',
    'real.p2.loc':   'Briançon — 05',
    'real.p3.loc':   'Embrun — 05',
    'real.p4.loc':   'Hautes-Alpes — 05',
    'real.p5.loc':   'Gap — 05',
    'real.p6.loc':   'PACA',
    'real.p1.type':  'Public building · Renovation',
    'real.p1.title': 'Restructuring of a primary school',
    'real.p1.desc':  'Structural diagnosis, reinforcement study and construction supervision for seismic compliance.',
    'real.p2.type':  'Residential · New construction',
    'real.p2.title': 'Concrete structure of a 5-storey building',
    'real.p2.desc':  'Full reinforced concrete structure design, from foundations to floor slabs in a seismic zone.',
    'real.p3.type':  'Local authority · Expert assessment',
    'real.p3.title': 'Assessment of a community hall',
    'real.p3.desc':  'Evaluation of structural damage, technical report and repair recommendations for the local authority.',
    'real.p4.type':  'Tourism · Feasibility',
    'real.p4.title': 'Mountain residence — feasibility study',
    'real.p4.desc':  'Structural feasibility study for a tourist residence project on a constrained mountain site.',
    'real.p5.type':  'Education · Extension',
    'real.p5.title': 'Extension of a vocational high school',
    'real.p5.desc':  'Structural studies for the extension of a public school, coordinated with the lead architect.',
    'real.p6.type':  'Industrial · Renovation',
    'real.p6.title': 'Conversion of an industrial building',
    'real.p6.desc':  'Diagnosis, reinforcement design and technical support for conversion into office space.',

    /* ── Pourquoi ESTER ───────────────────────────────── */
    'why.kicker':  'About us',
    'why.heading': 'A human-scale engineering firm, rooted in the Alps.',
    'why.lead':    'For nearly 50 years, ESTER has supported structural projects in the Hautes-Alpes with recognised technical expertise and a direct relationship with its clients.',
    'why.quote':   'Every project deserves rigorous technical attention and a dedicated contact, from the first calculation to the final handover.',
    'why.quote.author': '— Philippe Duez, Managing Director, ESTER SAS',
    'why.p1.title': 'History and continuity',
    'why.p1.desc':  'Founded in 1977, ESTER has supported decades of construction in the Hautes-Alpes. Local technical knowledge that is difficult to match.',
    'why.p2.title': 'Certified OPQIBI qualification',
    'why.p2.desc':  'Qualification 1202 — standard concrete structures, valid until 2029. An objective benchmark of technical competence recognised by the profession.',
    'why.p3.title': 'Knowledge of the Alpine territory',
    'why.p3.desc':  'Seismicity, snow loads, mountain constraints — ESTER has a command of the technical specificities of Alpine projects that more distant firms often overlook.',
    'why.p4.title': 'Direct relationship, no middlemen',
    'why.p4.desc':  'As a small firm, you deal directly with the engineers working on your project. No handover between sales and technical teams.',
    'why.p5.title': 'Responsiveness and availability',
    'why.p5.desc':  'Short response times, reachable contact, regular follow-up — a level of responsiveness that larger firms struggle to guarantee.',
    'why.p6.title': 'End-to-end support',
    'why.p6.desc':  'From feasibility to site supervision, ESTER can be involved at every stage, ensuring technical consistency and continuity throughout.',

    /* ── Avis ─────────────────────────────────────────── */
    'avis.kicker':  'Testimonials',
    'avis.heading': 'What our clients say.',
    'avis.link':    'See reviews on Google Maps →',
    'avis.stars.aria': '{note} star(s) out of 5',
    'avis.google.reviews': '{note}/5 · {total} Google reviews',
    'avis.a1.text':   '"A serious, available and rigorous firm. Philippe Duez monitored our renovation project with genuine commitment. Deadlines were met and communication was clear from start to finish."',
    'avis.a1.name':   'Arnaud M.',
    'avis.a1.role':   'DPLG Architect · Gap',
    'avis.a2.text':   '"We have been working with ESTER for our local authority projects for several years. Their knowledge of the territory and responsiveness are real assets for our public contracts."',
    'avis.a2.name':   'Technical department',
    'avis.a2.role':   'Local authority · Hautes-Alpes',
    'avis.a3.text':   '"The structural study was carried out precisely and on schedule, despite the complexity of the high-altitude site. Quality technical support, without unnecessary jargon."',
    'avis.a3.name':   'C. Fontaine',
    'avis.a3.role':   'Private project owner · Briançon',

    /* ── Recrutement ──────────────────────────────────── */
    'recru.kicker':    'Join the team',
    'recru.heading':   'Practice your profession in the Alps.',
    'recru.desc':      'ESTER is a small firm where engineers work on varied projects with real autonomy and direct access to management. The quality of life in the Hautes-Alpes — mountains, skiing, climbing, fresh air — is an advantage few structural engineering positions can offer.',
    'recru.li1': 'Varied projects: housing, ERP, industrial buildings, renovations',
    'recru.li2': 'Rigorous technical environment, human scale',
    'recru.li3': 'Gap, prefecture of the Hautes-Alpes — exceptional quality of life',
    'recru.li4': 'Direct contact with management',
    'recru.cta.label': 'Experienced structural engineer',
    'recru.cta.sub':   'Send a spontaneous application',
    'recru.cta.btn':   'Spontaneous application',

    /* ── Contact ──────────────────────────────────────── */
    'contact.kicker':  'Contact',
    'contact.heading': 'Let\'s talk about your project.',
    'contact.intro':   'Quote requests, technical questions, information — we respond promptly.',
    'contact.nom.label':      'Name',
    'contact.nom.placeholder':'Your name',
    'contact.soc.label':      'Company / Firm',
    'contact.soc.placeholder':'Your organisation',
    'contact.email.label':    'Email',
    'contact.email.placeholder':'your@email.com',
    'contact.tel.label':      'Phone',
    'contact.tel.placeholder':'+33 6 XX XX XX XX',
    'contact.sujet.label':    'Nature of request',
    'contact.sujet.default':  'Select',
    'contact.sujet.o1': 'Concrete structural study',
    'contact.sujet.o2': 'Risk assessment',
    'contact.sujet.o3': 'Feasibility study',
    'contact.sujet.o4': 'Site supervision',
    'contact.sujet.o5': 'Other request',
    'contact.msg.label':      'Message',
    'contact.msg.placeholder':'Briefly describe your project or request…',
    'contact.mention': 'Fields marked * are required. Your data is used solely to respond to your request.',
    'contact.submit':  'Send message',
    'contact.success': 'Message sent. We will get back to you as soon as possible.',
    'contact.map.directions': 'Google Maps directions →',

    /* ── Pagination ──────────────────────────────────── */
    'pagination.prev': '← Previous',
    'pagination.next': 'Next →',
    'pagination.nav.aria': 'Projects navigation',
    'pagination.prev.aria': 'Previous page',
    'pagination.next.aria': 'Next page',
    'pagination.dot.aria': 'Page {page} of {total}',

    /* ── Réalisations empty state ─────────────────────── */
    'realisations.empty.label': 'Reserved area · projects coming soon',
    'realisations.empty': 'No projects to show yet,<br/><em>but that won\'t be long.</em>',

    /* ── Footer ───────────────────────────────────────── */
    'footer.baseline': 'Structural engineering firm<br/>since 1977 · Gap, Hautes-Alpes',
    'footer.nav.aria': 'Footer navigation',
    'footer.hosting': 'Hosting: Netlify Inc., 512 2nd Street, San Francisco, CA 94107',
    'footer.copy': 'ESTER SAS. All rights reserved.',
    'footer.ml': 'Legal notice & privacy policy',

    /* ── Metadata ─────────────────────────────────────── */
    'meta.home.title': 'ESTER SAS — Structural engineering firm · Gap, Hautes-Alpes',
    'meta.home.description': 'Structural engineering firm in Gap, Hautes-Alpes, since 1977. Concrete structural calculation, building diagnosis, site supervision. OPQIBI 1202.',
    'meta.home.og.title': 'ESTER SAS — Structural engineering firm · Gap',
    'meta.home.og.description': 'Structural studies, feasibility and site supervision for public and private projects in the Hautes-Alpes. Based in Gap since 1977.',

    /* ── Contact attributes ───────────────────────────── */
    'contact.loading': 'Sending…',
    'contact.map.aria': 'ESTER SAS location — 3 bis avenue Maréchal Foch, 05000 Gap',
    'contact.map.title': 'Google Maps — ESTER SAS, 3 bis avenue Maréchal Foch, 05000 Gap',

    /* ── Legal notice ─────────────────────────────────── */
    'legal.meta.title': 'ESTER SAS — Legal notice',
    'legal.logo.sub': 'Technical Studies<br/>&amp; Reinforced Concrete Structures',
    'legal.back': '← Back to home',
    'legal.eyebrow': 'Legal information',
    'legal.heading': 'Legal <em>notice</em>',
    'legal.intro': 'In accordance with Articles 6‑III and 19 of French Law no. 2004‑575 of 21 June 2004 on confidence in the digital economy (LCEN).',
    'legal.publisher.title': 'Website publisher',
    'legal.publisher.company.label': 'Company name',
    'legal.publisher.legal.label': 'Legal form',
    'legal.publisher.legal.value': 'Simplified joint-stock company',
    'legal.publisher.address.label': 'Registered office',
    'legal.publisher.phone.label': 'Phone',
    'legal.publisher.capital.label': 'Share capital',
    'legal.publisher.rcs.label': 'Trade register',
    'legal.publisher.director.label': 'Publication director',
    'legal.host.title': 'Hosting provider',
    'legal.host.value': '<strong style="color:white">Netlify, Inc.</strong><br/>512 2nd Street, Suite 200<br/>San Francisco, CA 94107, United States<br/><span style="color:rgba(255,255,255,.55)">netlify.com</span>',
    'legal.host.note': 'Visitor data may be transferred outside the European Union (United States). Netlify participates in the <em>EU‑US Data Privacy Framework</em> certified by the U.S. Department of Commerce, ensuring an adequate level of protection under the European Commission adequacy decision of 10 July 2023.',
    'legal.insurance.title': 'Professional insurance',
    'legal.insurance.insurer.label': 'Insurer',
    'legal.insurance.cover.label': 'Coverage',
    'legal.insurance.cover.value': 'Professional civil liability and ten-year liability',
    'legal.insurance.zone.label': 'Coverage area',
    'legal.insurance.zone.value': 'Metropolitan France',
    'legal.privacy.title': 'Personal data &amp; GDPR',
    'legal.privacy.intro': 'In accordance with Regulation (EU) 2016/679 (GDPR) and the amended French Data Protection Act, you have the right to access, rectify, erase, port, restrict and object to the processing of your personal data.',
    'legal.privacy.controller.label': 'Data controller',
    'legal.privacy.legalbasis.label': 'Legal basis',
    'legal.privacy.legalbasis.value': 'Consent (contact form) — Art. 6.1.a GDPR<br/>Legitimate interest (anonymous audience measurement) — Art. 6.1.f',
    'legal.privacy.data.label': 'Data collected',
    'legal.privacy.data.value': 'Via the contact form: name, email, message, and any information you choose to provide. No advertising cookies are placed.',
    'legal.privacy.retention.label': 'Retention period',
    'legal.privacy.retention.value': '3 years from the last contact for prospects; for clients, for the duration of the contractual relationship, then archived in accordance with legal obligations.',
    'legal.privacy.processor.label': 'Processor — form',
    'legal.privacy.processor.value': '<span class="placeholder">{{ form_provider }}</span> processes form submissions on our behalf. No data is shared for commercial purposes.',
    'legal.privacy.rights.label': 'Exercise your rights',
    'legal.privacy.rights.value': 'By post to the registered office address, or by email at <a href="mailto:contact@ester-bet.fr" style="color:white">contact@ester-bet.fr</a>.<br/>You may also lodge a complaint with the <strong>CNIL</strong> (<a href="https://www.cnil.fr">cnil.fr</a>).',
    'legal.third.title': 'Integrated third-party services',
    'legal.third.maps.label': 'Google Maps',
    'legal.third.maps.value': 'The Contact page embeds a Google Maps map to display the location of ESTER SAS at 3 bis avenue Maréchal Foch, 05000 Gap. When this map loads, your browser connects to Google servers. Technical data, such as your IP address, browser information and the page viewed, may then be transmitted to Google.',
    'legal.third.purpose.label': 'Purpose',
    'legal.third.purpose.value': 'This service is used only to make it easier to access ESTER SAS premises and to provide a route link to Google Maps. ESTER SAS does not receive the data collected by Google in this context.',
    'legal.third.google.label': 'Google privacy policy',
    'legal.third.google.value': 'For more information about Google processing, you can read Google\'s privacy policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener" style="color:white">policies.google.com/privacy</a>.',
    'legal.ip.title': 'Intellectual property',
    'legal.ip.text': 'All content on this website (texts, images, photographs, logos, structure) is the exclusive property of ESTER SAS unless otherwise stated, and is protected by the French Intellectual Property Code. Any reproduction, even partial, requires prior written authorization.',
    'legal.foot.updated': 'Last updated · {{ date_maj }}',
    'legal.foot.company': 'ESTER SAS · Gap, Hautes‑Alpes',
  }
};

/* ── Moteur i18n ─────────────────────────────────────────── */
/* Priorité : 1) choix mémorisé  2) langue navigateur  3) français */
function detectLang() {
  const saved = localStorage.getItem('ester-lang');
  if (saved && TRANSLATIONS[saved]) return saved;
  const browser = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase();
  return TRANSLATIONS[browser] ? browser : 'fr';
}
let currentLang = detectLang();

function applyTranslations(lang) {
  const t = TRANSLATIONS[lang];
  if (!t) return;

  /* Texte simple */
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });

  /* HTML (titres avec <br>, <em>, etc.) */
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if (t[key] !== undefined) el.innerHTML = t[key];
  });

  /* Placeholders */
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (t[key] !== undefined) el.placeholder = t[key];
  });

  /* Aria-labels */
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.dataset.i18nAria;
    if (t[key] !== undefined) el.setAttribute('aria-label', t[key]);
  });

  /* Title attributes */
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    if (t[key] !== undefined) el.setAttribute('title', t[key]);
  });

  /* Meta content */
  document.querySelectorAll('[data-i18n-content]').forEach(el => {
    const key = el.dataset.i18nContent;
    if (t[key] !== undefined) el.setAttribute('content', t[key]);
  });

  /* Langue du document */
  document.documentElement.lang = lang;

  /* État des boutons */
  document.querySelectorAll('.nav-lang-btn').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.lang === lang);
    btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
  });

  currentLang = lang;
  localStorage.setItem('ester-lang', lang);
}

function initI18n() {
  /* Boutons toggle */
  document.querySelectorAll('.nav-lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyTranslations(btn.dataset.lang));
  });

  /* Application initiale */
  applyTranslations(currentLang);
}

window.applyEsterTranslations = (lang = currentLang) => applyTranslations(lang);
window.getEsterTranslation = (key, lang = currentLang) => TRANSLATIONS[lang]?.[key] ?? key;

document.addEventListener('DOMContentLoaded', initI18n);
