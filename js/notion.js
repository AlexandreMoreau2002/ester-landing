/* ── Notion CMS : chargement des données générées au build ─── */
const ICONS = {
  'Bâtiment public':    `<svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 58H62" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round"/><path d="M16 58V40" stroke="rgba(255,255,255,0.85)" stroke-width="1.8"/><path d="M26 58V40" stroke="rgba(255,255,255,0.85)" stroke-width="1.8"/><path d="M36 58V40" stroke="rgba(255,255,255,0.85)" stroke-width="1.8"/><path d="M46 58V40" stroke="rgba(255,255,255,0.85)" stroke-width="1.8"/><path d="M56 58V40" stroke="rgba(255,255,255,0.85)" stroke-width="1.8"/><path d="M12 40H60" stroke="rgba(255,255,255,0.9)" stroke-width="2"/><path d="M36 22L8 40H64L36 22Z" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linejoin="round"/></svg>`,
  'Logement collectif': `<svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="14" width="44" height="44" rx="1.5" stroke="rgba(255,255,255,0.9)" stroke-width="2"/><path d="M14 28H58" stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/><path d="M14 42H58" stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/><rect x="19" y="17.5" width="7" height="8" rx="0.75" stroke="rgba(255,255,255,0.8)" stroke-width="1.4"/><rect x="32.5" y="17.5" width="7" height="8" rx="0.75" stroke="rgba(255,255,255,0.8)" stroke-width="1.4"/><rect x="46" y="17.5" width="7" height="8" rx="0.75" stroke="rgba(255,255,255,0.8)" stroke-width="1.4"/><rect x="19" y="31.5" width="7" height="8" rx="0.75" stroke="rgba(255,255,255,0.8)" stroke-width="1.4"/><rect x="46" y="31.5" width="7" height="8" rx="0.75" stroke="rgba(255,255,255,0.8)" stroke-width="1.4"/><path d="M30 58V46H42V58" stroke="rgba(255,255,255,0.75)" stroke-width="1.4"/><path d="M8 58H64" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round"/></svg>`,
  'Collectivité':       `<svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 44L36 20L64 44" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linejoin="round"/><path d="M8 44V60" stroke="rgba(255,255,255,0.85)" stroke-width="2"/><path d="M64 44V60" stroke="rgba(255,255,255,0.85)" stroke-width="2"/><path d="M8 60H64" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round"/><circle cx="56" cy="22" r="8" stroke="rgba(255,255,255,0.8)" stroke-width="1.8"/><path d="M62 28L68 34" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round"/></svg>`,
  'Tourisme':           `<svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M36 8L50 28H22L36 8Z" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linejoin="round"/><path d="M8 50L22 28H50L64 50" stroke="rgba(255,255,255,0.7)" stroke-width="1.6" stroke-linejoin="round"/><path d="M24 50L36 40L48 50" stroke="rgba(255,255,255,0.9)" stroke-width="1.8" stroke-linejoin="round"/><rect x="27" y="50" width="18" height="12" stroke="rgba(255,255,255,0.85)" stroke-width="1.8"/><path d="M8 62H64" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  'Enseignement':       `<svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="22" width="34" height="28" rx="1.5" stroke="rgba(255,255,255,0.9)" stroke-width="2"/><rect x="44" y="32" width="18" height="18" rx="1.5" stroke="rgba(255,255,255,0.9)" stroke-width="2"/><rect x="15" y="27" width="6" height="6" rx="0.5" stroke="rgba(255,255,255,0.65)" stroke-width="1.3"/><rect x="25" y="27" width="6" height="6" rx="0.5" stroke="rgba(255,255,255,0.65)" stroke-width="1.3"/><rect x="35" y="27" width="6" height="6" rx="0.5" stroke="rgba(255,255,255,0.65)" stroke-width="1.3"/><path d="M38 40H48" stroke="rgba(255,255,255,0.5)" stroke-width="1.3" stroke-dasharray="2 2"/><path d="M8 60H64" stroke="rgba(255,255,255,0.55)" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  'Industriel':         `<svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 36L20 20H52L66 36" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linejoin="round"/><path d="M6 36V58" stroke="rgba(255,255,255,0.85)" stroke-width="2"/><path d="M66 36V58" stroke="rgba(255,255,255,0.85)" stroke-width="2"/><path d="M6 58H66" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round"/><path d="M20 20V58" stroke="rgba(255,255,255,0.35)" stroke-width="1.2"/><path d="M52 20V58" stroke="rgba(255,255,255,0.35)" stroke-width="1.2"/><rect x="28" y="40" width="16" height="18" rx="0.5" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/></svg>`,
  'Ouvrage d art':      `<svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 52 Q36 20 64 52" stroke="rgba(255,255,255,0.9)" stroke-width="2" fill="none"/><path d="M8 52H64" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round"/><path d="M20 52V38" stroke="rgba(255,255,255,0.55)" stroke-width="1.3"/><path d="M30 52V30" stroke="rgba(255,255,255,0.55)" stroke-width="1.3"/><path d="M36 52V26" stroke="rgba(255,255,255,0.55)" stroke-width="1.3"/><path d="M42 52V30" stroke="rgba(255,255,255,0.55)" stroke-width="1.3"/><path d="M52 52V38" stroke="rgba(255,255,255,0.55)" stroke-width="1.3"/><rect x="4" y="52" width="8" height="8" rx="1" stroke="rgba(255,255,255,0.75)" stroke-width="1.5"/><rect x="60" y="52" width="8" height="8" rx="1" stroke="rgba(255,255,255,0.75)" stroke-width="1.5"/></svg>`,
};

const BG = {
  'Bâtiment public':    1,
  'Logement collectif': 2,
  'Collectivité':       3,
  'Tourisme':           4,
  'Enseignement':       5,
  'Industriel':         6,
  'Ouvrage d art':      1,
};

function buildCard(r) {
  const bg   = BG[r.type]   || 1;
  const icon = ICONS[r.type] || ICONS['Bâtiment public'];
  const type = r.categorie ? `${r.type} · ${r.categorie}` : r.type;

  const imgContent = r.image
    ? `<img src="${r.image}" alt="${r.titre}" class="realisation-img-photo" loading="lazy" />`
    : `<div class="realisation-img-placeholder realisation-img-${bg}" aria-hidden="true"></div>
       <div class="realisation-img-icon" aria-hidden="true">${icon}</div>`;

  return `<li class="realisation-card reveal is-visible">
      <div class="realisation-img" aria-label="${r.titre}">
        ${imgContent}
        <span class="realisation-badge">${r.lieu}</span>
      </div>
      <div class="realisation-body">
        <p class="realisation-type">${type}</p>
        <h3 class="realisation-title">${r.titre}</h3>
        <p class="realisation-desc">${r.description}</p>
      </div>
    </li>`;
}

export async function loadNotionRealisations() {
  const grid = document.querySelector('.realisations-grid');
  const emptyState = document.querySelector('.realisations-empty');
  if (!grid) return;

  function showEmptyState() {
    grid.innerHTML = '';
    grid.hidden = true;
    if (emptyState) emptyState.hidden = false;
    if (window.applyEsterTranslations) window.applyEsterTranslations();
    if (window.rebuildRealisationsPagination) window.rebuildRealisationsPagination();
  }

  function showGrid(realisations) {
    grid.hidden = false;
    grid.innerHTML = realisations.map(buildCard).join('\n');
    if (emptyState) emptyState.hidden = true;
    if (window.rebuildRealisationsPagination) window.rebuildRealisationsPagination();
  }

  try {
    const response = await fetch('/data/realisations.json', { cache: 'no-store' });
    if (!response.ok) {
      showEmptyState();
      return;
    }

    const data = await response.json();
    const realisations = data.realisations || [];
    if (realisations.length === 0) {
      showEmptyState();
      return;
    }

    showGrid(realisations);
  } catch {
    showEmptyState();
  }
}
