'use strict';

/* ── Logo nav : fallback texte si image absente ─────────── */
const logoImg = document.querySelector('.ester-nav-logo-img');
const logoText = document.querySelector('.ester-nav-logo-text');

if (logoImg) {
  logoImg.addEventListener('error', () => {
    logoImg.style.display = 'none';
    if (logoText) logoText.style.display = 'block';
  });
}

/* ── Nav : scroll behavior ──────────────────────────────── */
const header = document.getElementById('site-header');

const onScroll = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 40);
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();


/* ── Nav : overlay mobile ───────────────────────────────── */
const burger  = document.getElementById('nav-burger');
const overlay = document.getElementById('ester-nav-overlay');

function navSetOpen(open) {
  document.body.classList.toggle('ester-nav-open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
}

burger.addEventListener('click', () => {
  navSetOpen(!document.body.classList.contains('ester-nav-open'));
});

overlay.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navSetOpen(false));
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.body.classList.contains('ester-nav-open')) {
    navSetOpen(false);
    burger.focus();
  }
});


/* ── Reveal au scroll (Intersection Observer) ───────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      const delay = entry.target.dataset.delay ?? 0;
      setTimeout(() => {
        entry.target.classList.add('is-visible');
      }, Number(delay));
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach((el, i) => {
  revealObserver.observe(el);
});

/* Décalage en cascade pour les grilles */
document.querySelectorAll('.certifs-list, .services-grid, .realisations-grid, .avis-grid, .pourquoi-points').forEach(grid => {
  Array.from(grid.children).forEach((child, i) => {
    child.dataset.delay = i * 80;
  });
});


/* ── Nav : active link on scroll ───────────────────────── */
const sections = document.querySelectorAll('main section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinkEls.forEach(link => {
        link.classList.toggle(
          'nav-link--active',
          link.getAttribute('href') === `#${entry.target.id}`
        );
      });
    });
  },
  { threshold: 0.4 }
);

sections.forEach(s => sectionObserver.observe(s));


/* ── Footer : année dynamique ───────────────────────────── */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ── Formulaire de contact ──────────────────────────────── */
const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('form-submit');
const successMsg = document.getElementById('form-success');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    form.classList.add('was-validated');

    if (!form.checkValidity()) {
      const firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const label = submitBtn.querySelector('.form-submit-label');
    const loading = submitBtn.querySelector('.form-submit-loading');

    submitBtn.disabled = true;
    label.hidden = true;
    loading.hidden = false;

    /* Simulation — remplacer par un vrai endpoint ou Formspree */
    await new Promise(r => setTimeout(r, 1000));

    form.reset();
    form.classList.remove('was-validated');
    submitBtn.hidden = true;
    successMsg.hidden = false;
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}


/* ── Réalisations : pagination ──────────────────────────── */
(function initRealisationsPagination() {
  const grid    = document.querySelector('.realisations-grid');
  const section = document.getElementById('realisations');
  if (!grid) return;

  const PER_PAGE = 6;

  /* Collecte toutes les cartes (statiques ou injectées par le CMS) */
  function getCards() {
    return Array.from(grid.querySelectorAll('.realisation-card'));
  }

  /* Construit la pagination si on en a besoin */
  function buildPagination() {
    const cards = getCards();
    if (cards.length <= PER_PAGE) return; /* rien à faire */

    let currentPage = 0;
    const totalPages = Math.ceil(cards.length / PER_PAGE);

    /* Conteneur */
    const nav = document.createElement('nav');
    nav.className = 'realisations-pagination';
    nav.setAttribute('aria-label', 'Navigation des réalisations');

    /* Bouton précédent */
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn pagination-prev';
    prevBtn.setAttribute('data-i18n', 'pagination.prev');
    prevBtn.setAttribute('aria-label', 'Page précédente');
    prevBtn.textContent = '← Précédent';

    /* Points */
    const dots = document.createElement('ol');
    dots.className = 'pagination-dots';
    dots.setAttribute('role', 'list');

    /* Bouton suivant */
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn pagination-next';
    nextBtn.setAttribute('data-i18n', 'pagination.next');
    nextBtn.setAttribute('aria-label', 'Page suivante');
    nextBtn.textContent = 'Suivant →';

    nav.append(prevBtn, dots, nextBtn);
    grid.after(nav);

    function renderPage(page) {
      const start = page * PER_PAGE;
      const end   = start + PER_PAGE;

      cards.forEach((card, i) => {
        const show = i >= start && i < end;
        card.style.display = show ? '' : 'none';
        /* Relance l'animation reveal sur les cartes qui apparaissent */
        if (show && !card.classList.contains('is-visible')) {
          card.classList.add('is-visible');
        }
      });

      prevBtn.disabled = (page === 0);
      nextBtn.disabled = (page === totalPages - 1);

      /* Recrée les dots */
      dots.innerHTML = '';
      for (let i = 0; i < totalPages; i++) {
        const li  = document.createElement('li');
        const dot = document.createElement('button');
        dot.className = 'pagination-dot' + (i === page ? ' is-active' : '');
        dot.setAttribute('aria-label', `Page ${i + 1} sur ${totalPages}`);
        dot.setAttribute('aria-current', i === page ? 'true' : 'false');
        dot.addEventListener('click', () => goTo(i));
        li.appendChild(dot);
        dots.appendChild(li);
      }

      currentPage = page;
    }

    function goTo(page) {
      renderPage(page);
      /* Scroll doux vers le haut de la section */
      const offset = 88;
      const top = section.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }

    prevBtn.addEventListener('click', () => { if (currentPage > 0) goTo(currentPage - 1); });
    nextBtn.addEventListener('click', () => { if (currentPage < totalPages - 1) goTo(currentPage + 1); });

    renderPage(0);
  }

  /* Lance au chargement (cartes statiques) */
  buildPagination();

  /*
   * Point d'extension pour le CMS Notion :
   * Après injection dynamique des cartes, appeler window.rebuildPagination()
   */
  window.rebuildRealisationsPagination = buildPagination;
})();


/* ── Mountains : viewBox responsive ─────────────────────── */
(function initMountainsViewBox() {
  const svg = document.querySelector('.ester-mountains svg');
  if (!svg) return;

  /* Coordonnées depuis app.jsx HeroCompact :
     mobile  → Gleize (x=640) + Bure (x=920) seulement
     tablette → Charance + Gleize + Bure (Vieux Chaillol hors cadre)
     desktop  → 4 sommets complets */
  const VB = {
    mobile:  '480 0 620 396',
    tablet:  '0 0 1080 396',
    desktop: '0 0 1400 396',
  };

  function update() {
    const w = window.innerWidth;
    svg.setAttribute('viewBox',
      w <= 600  ? VB.mobile  :
      w <= 1024 ? VB.tablet  :
                  VB.desktop
    );
  }

  window.addEventListener('resize', update, { passive: true });
  update();
})();


/* ── Smooth scroll pour les CTA du hero ─────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
