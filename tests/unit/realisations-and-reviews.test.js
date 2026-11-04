import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let importNonce = 0;

function importFresh(path) {
  importNonce += 1;
  return import(`${path}?t=${importNonce}`);
}

function setViewport(width) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  });
}

function setupTranslations(overrides = {}) {
  const translations = {
    'avis.stars.aria': 'Note {note} sur 5',
    'avis.google.reviews': 'Google {note}/5 sur {total} avis',
    'pagination.nav.aria': 'Pagination des references',
    'pagination.prev.aria': 'Page avant',
    'pagination.next.aria': 'Page apres',
    'pagination.dot.aria': 'Page {page} de {total}',
    ...overrides,
  };

  window.getEsterTranslation = vi.fn((key) => translations[key] ?? key);
}

function makeResponse(body, ok = true) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(body),
  };
}

function realisation(overrides = {}) {
  return {
    type: 'Bâtiment public',
    categorie: 'Structure',
    titre: 'Mairie de test',
    description: 'Diagnostic structurel complet.',
    lieu: 'Annecy',
    ...overrides,
  };
}

function seedRealisationCards(count) {
  document.body.innerHTML = `
    <section id="realisations">
      <ul class="realisations-grid"></ul>
    </section>
  `;

  const grid = document.querySelector('.realisations-grid');
  for (let index = 1; index <= count; index += 1) {
    const card = document.createElement('li');
    card.className = 'realisation-card';
    card.textContent = `Reference ${index}`;
    grid.append(card);
  }

  return {
    grid,
    section: document.getElementById('realisations'),
    cards: Array.from(grid.querySelectorAll('.realisation-card')),
  };
}

describe('Google reviews loading', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    setupTranslations();
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete globalThis.fetch;
    delete window.getEsterTranslation;
  });

  it('does nothing when the reviews DOM is missing', async () => {
    const { loadGoogleAvis } = await importFresh('../../js/avis.js');

    await loadGoogleAvis();

    expect(fetch).not.toHaveBeenCalled();
  });

  it('renders successful Google reviews, filters low ratings, and updates the aggregate note', async () => {
    document.body.innerHTML = `
      <section id="avis" hidden>
        <span class="avis-note-score"></span>
        <ul class="avis-grid"><li>stale</li></ul>
      </section>
    `;
    fetch.mockResolvedValue(makeResponse({
      note_moyenne: 4.8,
      total: 42,
      avis: [
        { note: 5, texte: 'Excellent suivi.', auteur: 'Alice', date: '2026' },
        { note: 3.5, texte: 'Too low.', auteur: 'Bob', date: '2025' },
        { note: 4.4, texte: '', auteur: 'Camille', date: '2024' },
      ],
    }));
    const { loadGoogleAvis } = await importFresh('../../js/avis.js');

    await loadGoogleAvis();

    const section = document.getElementById('avis');
    const cards = document.querySelectorAll('.avis-card');

    expect(fetch).toHaveBeenCalledWith('/data/avis.json', { cache: 'no-store' });
    expect(section.hidden).toBe(false);
    expect(cards).toHaveLength(2);
    expect(document.body.textContent).toContain('Alice');
    expect(document.body.textContent).toContain('Camille');
    expect(document.body.textContent).not.toContain('Bob');
    expect(document.querySelectorAll('.avis-text')).toHaveLength(1);
    expect(document.querySelector('.avis-stars').getAttribute('aria-label')).toBe('Note 5 sur 5');
    expect(document.querySelector('.avis-note-score').textContent).toBe('Google 4.8/5 sur 42 avis');
  });

  it('uses review translation fallbacks when translation helpers are absent or return the key', async () => {
    document.body.innerHTML = `
      <section id="avis" hidden>
        <ul class="avis-grid"></ul>
      </section>
    `;
    delete window.getEsterTranslation;
    fetch.mockResolvedValueOnce(makeResponse({
      avis: [{ note: 4, texte: 'Fallback text.', auteur: 'Dana', date: '2026' }],
    }));
    const { loadGoogleAvis } = await importFresh('../../js/avis.js');

    await loadGoogleAvis();
    expect(document.querySelector('.avis-stars').getAttribute('aria-label')).toBe('4 étoile(s) sur 5');

    document.body.innerHTML = `
      <section id="avis" hidden>
        <span class="avis-note-score"></span>
        <ul class="avis-grid"></ul>
      </section>
    `;
    window.getEsterTranslation = vi.fn((key) => key);
    fetch.mockResolvedValueOnce(makeResponse({
      note_moyenne: 4.6,
      total: 8,
      avis: [{ note: 5, texte: 'Fallback aggregate.', auteur: 'Eli', date: '2026' }],
    }));

    await loadGoogleAvis();

    expect(document.querySelector('.avis-note-score').textContent).toBe('4.6/5 · 8 avis Google');
  });

  it('keeps the reviews section hidden for empty or low-rated review data', async () => {
    document.body.innerHTML = `
      <section id="avis">
        <ul class="avis-grid"><li>stale</li></ul>
      </section>
    `;
    fetch.mockResolvedValue(makeResponse({ avis: [{ note: 2, auteur: 'Nope', date: '2024' }] }));
    const { loadGoogleAvis } = await importFresh('../../js/avis.js');

    await loadGoogleAvis();

    expect(document.getElementById('avis').hidden).toBe(true);
    expect(document.querySelector('.avis-grid').children).toHaveLength(0);
  });

  it('keeps the reviews section hidden when the generated JSON omits reviews', async () => {
    document.body.innerHTML = `
      <section id="avis">
        <ul class="avis-grid"><li>stale</li></ul>
      </section>
    `;
    fetch.mockResolvedValue(makeResponse({}));
    const { loadGoogleAvis } = await importFresh('../../js/avis.js');

    await loadGoogleAvis();

    expect(document.getElementById('avis').hidden).toBe(true);
    expect(document.querySelector('.avis-grid').children).toHaveLength(0);
  });

  it('leaves reviews hidden when the generated JSON response is not ok', async () => {
    document.body.innerHTML = `
      <section id="avis">
        <ul class="avis-grid"><li>stale</li></ul>
      </section>
    `;
    fetch.mockResolvedValue(makeResponse({}, false));
    const { loadGoogleAvis } = await importFresh('../../js/avis.js');

    await loadGoogleAvis();

    expect(document.getElementById('avis').hidden).toBe(true);
    expect(document.querySelector('.avis-grid').children).toHaveLength(0);
  });

  it('leaves reviews hidden when fetching generated JSON fails', async () => {
    document.body.innerHTML = `
      <section id="avis">
        <ul class="avis-grid"><li>stale</li></ul>
      </section>
    `;
    fetch.mockRejectedValue(new Error('network'));
    const { loadGoogleAvis } = await importFresh('../../js/avis.js');

    await loadGoogleAvis();

    expect(document.getElementById('avis').hidden).toBe(true);
    expect(document.querySelector('.avis-grid').children).toHaveLength(0);
  });
});

describe('Notion realisations loading', () => {
  let visibility;
  let eventListeners;

  beforeEach(() => {
    vi.useFakeTimers();
    visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    eventListeners = vi.spyOn(document, 'addEventListener');
    document.body.innerHTML = '';
    window.applyEsterTranslations = vi.fn();
    window.rebuildRealisationsPagination = vi.fn();
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    for (const [event, listener] of eventListeners.mock.calls) {
      if (event === 'visibilitychange') document.removeEventListener(event, listener);
    }
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    delete globalThis.fetch;
    delete window.applyEsterTranslations;
    delete window.rebuildRealisationsPagination;
  });

  it('does nothing when the realisations grid is missing', async () => {
    const { loadNotionRealisations } = await importFresh('../../js/notion.js');

    await loadNotionRealisations();

    expect(fetch).not.toHaveBeenCalled();
  });

  it('renders runtime realisations and rebuilds pagination', async () => {
    document.body.innerHTML = `
      <ul class="realisations-grid" hidden></ul>
      <p class="realisations-empty"></p>
    `;
    fetch.mockResolvedValue(makeResponse({
      realisations: [
        realisation({
          type: 'Logement collectif',
          image: '/uploads/logement.jpg',
          titre: 'Residence image',
        }),
        realisation({
          type: 'Type inconnu',
          categorie: '',
          titre: 'Reference placeholder',
          image: '',
        }),
      ],
    }));
    const { loadNotionRealisations } = await importFresh('../../js/notion.js');

    await loadNotionRealisations();

    const grid = document.querySelector('.realisations-grid');
    const cards = document.querySelectorAll('.realisation-card');

    expect(fetch).toHaveBeenCalledWith('/api/realisations', { cache: 'no-store' });
    expect(grid.hidden).toBe(false);
    expect(document.querySelector('.realisations-empty').hidden).toBe(true);
    expect(cards).toHaveLength(2);
    expect(document.querySelector('.realisation-img-photo').getAttribute('src')).toBe('/uploads/logement.jpg');
    expect(document.querySelector('.realisation-img-placeholder').classList.contains('realisation-img-1')).toBe(true);
    expect(document.body.textContent).toContain('Logement collectif · Structure');
    expect(document.body.textContent).toContain('Type inconnu');
    expect(window.rebuildRealisationsPagination).toHaveBeenCalledTimes(1);
    expect(window.applyEsterTranslations).not.toHaveBeenCalled();
  });

  it('refreshes cards every 60 seconds and rebuilds pagination after each render', async () => {
    seedRealisationCards(1);
    fetch
      .mockResolvedValueOnce(makeResponse({ realisations: [realisation({ titre: 'Avant modification' })] }))
      .mockResolvedValue(makeResponse({ realisations: [realisation({ titre: 'Après modification' })] }));
    const { loadNotionRealisations } = await importFresh('../../js/notion.js');

    await loadNotionRealisations();
    expect(document.querySelector('.realisation-title').textContent).toBe('Avant modification');

    await vi.advanceTimersByTimeAsync(59_999);
    expect(fetch).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);

    expect(document.querySelector('.realisation-title').textContent).toBe('Après modification');
    expect(fetch).toHaveBeenLastCalledWith('/api/realisations', { cache: 'no-store' });
    expect(window.rebuildRealisationsPagination).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(window.rebuildRealisationsPagination).toHaveBeenCalledTimes(3);
  });

  it('keeps one refresh schedule when startup is called repeatedly', async () => {
    seedRealisationCards(1);
    fetch.mockResolvedValue(makeResponse({ realisations: [realisation()] }));
    const { loadNotionRealisations } = await importFresh('../../js/notion.js');

    await Promise.all([loadNotionRealisations(), loadNotionRealisations()]);
    await loadNotionRealisations();
    expect(fetch).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(120_000);

    expect(fetch).toHaveBeenCalledTimes(3);
    expect(window.rebuildRealisationsPagination).toHaveBeenCalledTimes(3);
  });

  it('stops polling while hidden and resumes a single schedule when visible', async () => {
    seedRealisationCards(1);
    fetch.mockResolvedValue(makeResponse({ realisations: [realisation()] }));
    const { loadNotionRealisations } = await importFresh('../../js/notion.js');

    await loadNotionRealisations();
    await vi.advanceTimersByTimeAsync(30_000);
    visibility.mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(180_000);
    expect(fetch).toHaveBeenCalledTimes(1);

    visibility.mockReturnValue('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(59_999);
    expect(fetch).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('loads immediately when started hidden and schedules polling only after becoming visible', async () => {
    seedRealisationCards(1);
    visibility.mockReturnValue('hidden');
    fetch.mockResolvedValue(makeResponse({ realisations: [realisation()] }));
    const { loadNotionRealisations } = await importFresh('../../js/notion.js');

    await loadNotionRealisations();
    expect(document.querySelector('.realisation-title').textContent).toBe('Mairie de test');
    await vi.advanceTimersByTimeAsync(120_000);
    expect(fetch).toHaveBeenCalledTimes(1);
    visibility.mockReturnValue('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(60_000);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it.each(['HTTP error', 'network error', 'invalid JSON'])('preserves rendered cards on a refresh %s and recovers later', async (failure) => {
    seedRealisationCards(1);
    fetch.mockResolvedValueOnce(makeResponse({ realisations: [realisation({ titre: 'Donnée conservée' })] }));
    if (failure === 'HTTP error') fetch.mockResolvedValueOnce(makeResponse({}, false));
    if (failure === 'network error') fetch.mockRejectedValueOnce(new Error('network'));
    if (failure === 'invalid JSON') {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => { throw new Error('invalid JSON'); } });
    }
    fetch.mockResolvedValue(makeResponse({ realisations: [realisation({ titre: 'Donnée rétablie' })] }));
    const { loadNotionRealisations } = await importFresh('../../js/notion.js');

    await loadNotionRealisations();
    const card = document.querySelector('.realisation-card');
    await vi.advanceTimersByTimeAsync(60_000);

    expect(document.querySelector('.realisation-card')).toBe(card);
    expect(document.querySelector('.realisations-grid').hidden).toBe(false);
    expect(window.rebuildRealisationsPagination).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(document.querySelector('.realisation-title').textContent).toBe('Donnée rétablie');
    expect(window.rebuildRealisationsPagination).toHaveBeenCalledTimes(2);
  });

  it('renders a successful empty refresh and preserves its state through a later failure', async () => {
    document.body.innerHTML = '<ul class="realisations-grid"></ul><p class="realisations-empty" hidden></p>';
    fetch
      .mockResolvedValueOnce(makeResponse({ realisations: [realisation()] }))
      .mockResolvedValueOnce(makeResponse({ realisations: [] }))
      .mockRejectedValue(new Error('network'));
    const { loadNotionRealisations } = await importFresh('../../js/notion.js');

    await loadNotionRealisations();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(document.querySelector('.realisations-grid').children).toHaveLength(0);
    expect(document.querySelector('.realisations-empty').hidden).toBe(false);
    expect(window.rebuildRealisationsPagination).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(window.rebuildRealisationsPagination).toHaveBeenCalledTimes(2);
  });

  it('does not overlap a pending refresh with another polling request', async () => {
    seedRealisationCards(1);
    let resolveRefresh;
    fetch
      .mockResolvedValueOnce(makeResponse({ realisations: [realisation()] }))
      .mockImplementationOnce(() => new Promise((resolve) => { resolveRefresh = resolve; }))
      .mockResolvedValue(makeResponse({ realisations: [realisation({ titre: 'Refresh suivant' })] }));
    const { loadNotionRealisations } = await importFresh('../../js/notion.js');

    await loadNotionRealisations();
    await vi.advanceTimersByTimeAsync(180_000);
    expect(fetch).toHaveBeenCalledTimes(2);
    resolveRefresh(makeResponse({ realisations: [realisation({ titre: 'Refresh terminé' })] }));
    await vi.advanceTimersByTimeAsync(0);
    expect(document.querySelector('.realisation-title').textContent).toBe('Refresh terminé');
    await vi.advanceTimersByTimeAsync(60_000);
    expect(document.querySelector('.realisation-title').textContent).toBe('Refresh suivant');
  });

  it('renders without optional empty-state and pagination callbacks', async () => {
    document.body.innerHTML = '<ul class="realisations-grid" hidden></ul>';
    delete window.rebuildRealisationsPagination;
    delete window.applyEsterTranslations;
    fetch.mockResolvedValue(makeResponse({
      realisations: [realisation({ titre: 'Sans callback', image: '/photo.jpg' })],
    }));
    const { loadNotionRealisations } = await importFresh('../../js/notion.js');

    await loadNotionRealisations();

    expect(document.querySelector('.realisations-grid').hidden).toBe(false);
    expect(document.querySelectorAll('.realisation-card')).toHaveLength(1);
  });

  it('shows the empty state when generated realisations are empty', async () => {
    document.body.innerHTML = `
      <ul class="realisations-grid"><li>stale</li></ul>
      <p class="realisations-empty" hidden></p>
    `;
    fetch.mockResolvedValue(makeResponse({ realisations: [] }));
    const { loadNotionRealisations } = await importFresh('../../js/notion.js');

    await loadNotionRealisations();

    expect(document.querySelector('.realisations-grid').hidden).toBe(true);
    expect(document.querySelector('.realisations-grid').children).toHaveLength(0);
    expect(document.querySelector('.realisations-empty').hidden).toBe(false);
    expect(window.applyEsterTranslations).toHaveBeenCalledTimes(1);
    expect(window.rebuildRealisationsPagination).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state when generated realisations are absent', async () => {
    document.body.innerHTML = `
      <ul class="realisations-grid"><li>stale</li></ul>
    `;
    fetch.mockResolvedValue(makeResponse({}));
    const { loadNotionRealisations } = await importFresh('../../js/notion.js');

    await loadNotionRealisations();

    expect(document.querySelector('.realisations-grid').hidden).toBe(true);
    expect(window.applyEsterTranslations).toHaveBeenCalledTimes(1);
    expect(window.rebuildRealisationsPagination).toHaveBeenCalledTimes(1);
  });

  it('can show the empty state without optional translation and rebuild callbacks', async () => {
    document.body.innerHTML = `
      <ul class="realisations-grid"><li>stale</li></ul>
      <p class="realisations-empty" hidden></p>
    `;
    delete window.applyEsterTranslations;
    delete window.rebuildRealisationsPagination;
    fetch.mockResolvedValue(makeResponse({ realisations: [] }));
    const { loadNotionRealisations } = await importFresh('../../js/notion.js');

    await loadNotionRealisations();

    expect(document.querySelector('.realisations-grid').hidden).toBe(true);
    expect(document.querySelector('.realisations-empty').hidden).toBe(false);
  });

  it('shows the empty state when the generated JSON response is not ok', async () => {
    document.body.innerHTML = `
      <ul class="realisations-grid"><li>stale</li></ul>
      <p class="realisations-empty" hidden></p>
    `;
    fetch.mockResolvedValue(makeResponse({}, false));
    const { loadNotionRealisations } = await importFresh('../../js/notion.js');

    await loadNotionRealisations();

    expect(document.querySelector('.realisations-grid').hidden).toBe(true);
    expect(document.querySelector('.realisations-empty').hidden).toBe(false);
    expect(window.applyEsterTranslations).toHaveBeenCalledTimes(1);
    expect(window.rebuildRealisationsPagination).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state when fetching generated realisations fails', async () => {
    document.body.innerHTML = `
      <ul class="realisations-grid"><li>stale</li></ul>
      <p class="realisations-empty" hidden></p>
    `;
    fetch.mockRejectedValue(new Error('network'));
    const { loadNotionRealisations } = await importFresh('../../js/notion.js');

    await loadNotionRealisations();

    expect(document.querySelector('.realisations-grid').hidden).toBe(true);
    expect(document.querySelector('.realisations-empty').hidden).toBe(false);
    expect(window.applyEsterTranslations).toHaveBeenCalledTimes(1);
    expect(window.rebuildRealisationsPagination).toHaveBeenCalledTimes(1);
  });
});

describe('realisations pagination', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    setupTranslations();
    setViewport(1024);
    window.scrollTo = vi.fn();
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 200,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete window.getEsterTranslation;
    delete window.rebuildRealisationsPagination;
  });

  it('does nothing when the realisations grid is missing', async () => {
    const { initPagination } = await importFresh('../../js/pagination.js');

    initPagination();

    expect(window.rebuildRealisationsPagination).toBeUndefined();
  });

  it('does not build pagination when desktop cards fit on one page', async () => {
    const { cards } = seedRealisationCards(6);
    const { initPagination } = await importFresh('../../js/pagination.js');

    initPagination();

    expect(document.querySelector('.realisations-pagination')).toBeNull();
    expect(cards.every((card) => card.style.display === '')).toBe(true);
    expect(window.rebuildRealisationsPagination).toEqual(expect.any(Function));
  });

  it('paginates desktop cards, handles next, previous, and dot clicks', async () => {
    const { section, cards } = seedRealisationCards(13);
    section.getBoundingClientRect = vi.fn(() => ({ top: 300 }));
    const { initPagination } = await importFresh('../../js/pagination.js');

    initPagination();

    const prev = document.querySelector('.pagination-prev');
    const next = document.querySelector('.pagination-next');

    expect(document.querySelector('.realisations-pagination').getAttribute('aria-label')).toBe('Pagination des references');
    expect(document.querySelectorAll('.pagination-dot')).toHaveLength(3);
    expect(cards.slice(0, 6).every((card) => card.style.display === '')).toBe(true);
    expect(cards.slice(6).every((card) => card.style.display === 'none')).toBe(true);
    expect(prev.disabled).toBe(true);
    expect(next.disabled).toBe(false);

    next.click();
    expect(cards.slice(0, 6).every((card) => card.style.display === 'none')).toBe(true);
    expect(cards.slice(6, 12).every((card) => card.style.display === '')).toBe(true);
    expect(prev.disabled).toBe(false);
    expect(next.disabled).toBe(false);
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 412, behavior: 'smooth' });

    document.querySelectorAll('.pagination-dot')[2].click();
    expect(cards.slice(12).every((card) => card.style.display === '')).toBe(true);
    expect(next.disabled).toBe(true);

    prev.click();
    expect(cards.slice(6, 12).every((card) => card.style.display === '')).toBe(true);
  });

  it('keeps boundary pagination clicks on the current page', async () => {
    const { cards } = seedRealisationCards(7);
    const { initPagination } = await importFresh('../../js/pagination.js');

    initPagination();

    const prev = document.querySelector('.pagination-prev');
    const next = document.querySelector('.pagination-next');

    prev.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(cards.slice(0, 6).every((card) => card.style.display === '')).toBe(true);
    expect(window.scrollTo).not.toHaveBeenCalled();

    next.click();
    next.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(cards[6].style.display).toBe('');
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
  });

  it('paginates mobile cards with three cards per page', async () => {
    setViewport(480);
    const { cards } = seedRealisationCards(7);
    const { initPagination } = await importFresh('../../js/pagination.js');

    initPagination();

    expect(document.querySelectorAll('.pagination-dot')).toHaveLength(3);
    expect(cards.slice(0, 3).every((card) => card.style.display === '')).toBe(true);
    expect(cards.slice(3).every((card) => card.style.display === 'none')).toBe(true);
  });

  it('rebuilds pagination when resize crosses the mobile breakpoint', async () => {
    const { cards } = seedRealisationCards(7);
    const { initPagination } = await importFresh('../../js/pagination.js');

    initPagination();
    expect(document.querySelectorAll('.pagination-dot')).toHaveLength(2);
    expect(cards.slice(0, 6).every((card) => card.style.display === '')).toBe(true);

    setViewport(480);
    window.dispatchEvent(new Event('resize'));

    expect(document.querySelectorAll('.pagination-dot')).toHaveLength(3);
    expect(cards.slice(0, 3).every((card) => card.style.display === '')).toBe(true);
    expect(cards.slice(3).every((card) => card.style.display === 'none')).toBe(true);

    window.rebuildRealisationsPagination();
    expect(document.querySelectorAll('.realisations-pagination')).toHaveLength(1);
  });

  it('uses pagination translation fallbacks and ignores same-range resizes', async () => {
    delete window.getEsterTranslation;
    const { cards } = seedRealisationCards(7);
    const { initPagination } = await importFresh('../../js/pagination.js');

    initPagination();

    expect(document.querySelector('.realisations-pagination').getAttribute('aria-label')).toBe('Navigation des réalisations');
    expect(document.querySelector('.pagination-dot').getAttribute('aria-label')).toBe('Page 1 sur 2');

    setViewport(900);
    window.dispatchEvent(new Event('resize'));

    expect(document.querySelectorAll('.pagination-dot')).toHaveLength(2);
    expect(cards.slice(0, 6).every((card) => card.style.display === '')).toBe(true);
  });

  it('uses pagination fallback text when the translator returns the key', async () => {
    window.getEsterTranslation = vi.fn((key) => key);
    seedRealisationCards(7);
    const { initPagination } = await importFresh('../../js/pagination.js');

    initPagination();

    expect(document.querySelector('.realisations-pagination').getAttribute('aria-label')).toBe('Navigation des réalisations');
    expect(document.querySelector('.pagination-dot').getAttribute('aria-label')).toBe('Page 1 sur 2');
  });
});
