/* ── Réalisations : pagination ──────────────────────────── */
const BREAKPOINT = 600;

function t(key, fallback, params = {}) {
  const translated = window.getEsterTranslation ? window.getEsterTranslation(key) : fallback;
  const value = translated === key ? fallback : translated;
  return Object.entries(params).reduce(
    (text, [name, replacement]) => text.replace(`{${name}}`, replacement),
    value
  );
}

function getPerPage() {
  return window.innerWidth <= BREAKPOINT ? 3 : 6;
}

export function initPagination() {
  const grid    = document.querySelector('.realisations-grid');
  const section = document.getElementById('realisations');
  if (!grid) return;

  function getCards() {
    return Array.from(grid.querySelectorAll('.realisation-card'));
  }

  function buildPagination() {
    const cards   = getCards();
    const perPage = getPerPage();

    const existing = section.querySelector('.realisations-pagination');
    if (existing) existing.remove();

    if (cards.length <= perPage) {
      cards.forEach(c => (c.style.display = ''));
      return;
    }

    let currentPage   = 0;
    const totalPages  = Math.ceil(cards.length / perPage);

    const nav = document.createElement('nav');
    nav.className = 'realisations-pagination';
    nav.setAttribute('aria-label', t('pagination.nav.aria', 'Navigation des réalisations'));
    nav.setAttribute('data-i18n-aria', 'pagination.nav.aria');

    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn pagination-prev';
    prevBtn.setAttribute('data-i18n', 'pagination.prev');
    prevBtn.setAttribute('data-i18n-aria', 'pagination.prev.aria');
    prevBtn.setAttribute('aria-label', t('pagination.prev.aria', 'Page précédente'));
    prevBtn.textContent = '← Précédent';

    const dots = document.createElement('ol');
    dots.className = 'pagination-dots';
    dots.setAttribute('role', 'list');

    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn pagination-next';
    nextBtn.setAttribute('data-i18n', 'pagination.next');
    nextBtn.setAttribute('data-i18n-aria', 'pagination.next.aria');
    nextBtn.setAttribute('aria-label', t('pagination.next.aria', 'Page suivante'));
    nextBtn.textContent = 'Suivant →';

    nav.append(prevBtn, dots, nextBtn);
    grid.after(nav);

    function renderPage(page) {
      const pp    = getPerPage();
      const start = page * pp;
      const end   = start + pp;

      cards.forEach((card, i) => {
        const show = i >= start && i < end;
        card.style.display = show ? '' : 'none';
        if (show && !card.classList.contains('is-visible')) card.classList.add('is-visible');
      });

      prevBtn.disabled = (page === 0);
      nextBtn.disabled = (page === totalPages - 1);

      dots.innerHTML = '';
      for (let i = 0; i < totalPages; i++) {
        const li  = document.createElement('li');
        const dot = document.createElement('button');
        dot.className = 'pagination-dot' + (i === page ? ' is-active' : '');
        dot.setAttribute('aria-label', t('pagination.dot.aria', 'Page {page} sur {total}', {
          page: i + 1,
          total: totalPages
        }));
        dot.setAttribute('aria-current', i === page ? 'true' : 'false');
        dot.addEventListener('click', () => goTo(i));
        li.appendChild(dot);
        dots.appendChild(li);
      }

      currentPage = page;
    }

    function goTo(page) {
      renderPage(page);
      const top = section.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top, behavior: 'smooth' });
    }

    prevBtn.addEventListener('click', () => { if (currentPage > 0) goTo(currentPage - 1); });
    nextBtn.addEventListener('click', () => { if (currentPage < totalPages - 1) goTo(currentPage + 1); });

    renderPage(0);
  }

  buildPagination();

  let lastPerPage = getPerPage();
  window.addEventListener('resize', () => {
    const next = getPerPage();
    if (next !== lastPerPage) { lastPerPage = next; buildPagination(); }
  }, { passive: true });

  /* Exposé pour le CMS Notion après injection des cartes */
  window.rebuildRealisationsPagination = buildPagination;
}
