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
    /* Sous-titres overlay mobile */
    'nav.sub.services':      'Études béton armé, expertises',
    'nav.sub.realisations':  '50+ projets dans les Hautes‑Alpes',
    'nav.sub.entreprise':    'Une équipe à Gap depuis 1977',
    'nav.sub.rejoindre':     'Postes ouverts · alternance',

    /* ── Hero ─────────────────────────────────────────── */
    'hero.kicker':       'Hautes-Alpes · Fondé en 1977 · OPQIBI 1202',
    'hero.kicker.short': 'Gap · Depuis 1977',
    'hero.heading':      'L\'ingénierie structure<br />à Gap, <em>depuis 47&nbsp;ans.</em>',
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
    'services.s1.desc':  'Dimensionnement et vérification des éléments porteurs en béton armé pour constructions neuves, extensions et réhabilitations. Calculs conformes aux Eurocodes.',
    'services.s2.title': 'Évaluation des risques',
    'services.s2.desc':  'Diagnostic structurel, expertise de bâtiments existants et évaluation des pathologies. Rapports techniques circonstanciés pour maîtres d\'ouvrage et assureurs.',
    'services.s3.title': 'Études de faisabilité',
    'services.s3.desc':  'Analyse structurelle en phase de conception pour valider la faisabilité technique d\'un projet avant dépôt de permis. Aide à la décision pour les maîtres d\'ouvrage.',
    'services.s4.title': 'Suivi de chantier',
    'services.s4.desc':  'Visites de contrôle, levée de réserves structurelles et assistance technique en phase d\'exécution. Interlocuteur technique disponible tout au long du chantier.',
    'services.quote':    'Demander un devis →',

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
    'contact.tel.label':      'Téléphone',
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

    /* ── Pagination ──────────────────────────────────── */
    'pagination.prev': '← Précédent',
    'pagination.next': 'Suivant →',

    /* ── Footer ───────────────────────────────────────── */
    'footer.baseline': 'Bureau d\'études en ingénierie structurelle<br/>depuis 1977 · Gap, Hautes-Alpes',
    'footer.ml': 'Mentions légales & confidentialité',
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
    'services.s1.desc':  'Sizing and verification of reinforced concrete load-bearing elements for new constructions, extensions and renovations. Calculations compliant with Eurocodes.',
    'services.s2.title': 'Risk assessment',
    'services.s2.desc':  'Structural diagnosis, assessment of existing buildings and pathology evaluation. Detailed technical reports for project owners and insurers.',
    'services.s3.title': 'Feasibility studies',
    'services.s3.desc':  'Structural analysis during the design phase to validate the technical feasibility of a project prior to planning permission. Decision support for project owners.',
    'services.s4.title': 'Site supervision',
    'services.s4.desc':  'Inspection visits, structural defect resolution and technical assistance during construction. A dedicated technical contact throughout the project.',
    'services.quote':    'Request a quote →',

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
    'contact.tel.label':      'Phone',
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

    /* ── Pagination ──────────────────────────────────── */
    'pagination.prev': '← Previous',
    'pagination.next': 'Next →',

    /* ── Footer ───────────────────────────────────────── */
    'footer.baseline': 'Structural engineering firm<br/>since 1977 · Gap, Hautes-Alpes',
    'footer.ml': 'Legal notice & privacy policy',
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

document.addEventListener('DOMContentLoaded', initI18n);
