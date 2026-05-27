/* ── Google Reviews : chargement des données générées au build ─── */

/**
 * Rendu des étoiles pour une note 1–5.
 * Utilise ★ (plein) et ☆ (vide) — arrondi à l'entier le plus proche.
 */
function t(key, fallback, params = {}) {
  const translated = window.getEsterTranslation ? window.getEsterTranslation(key) : fallback;
  const value = translated === key ? fallback : translated;
  return Object.entries(params).reduce(
    (text, [name, replacement]) => text.replace(`{${name}}`, replacement),
    value
  );
}

function buildStars(note) {
  const n     = Math.round(note);
  const stars = '★'.repeat(n) + '☆'.repeat(5 - n);
  const label = t('avis.stars.aria', `${note} étoile(s) sur 5`, { note });
  return `<div class="avis-stars" role="img" aria-label="${label}">
      <span aria-hidden="true">${stars}</span>
    </div>`;
}

/**
 * Construit le HTML d'une carte d'avis.
 * Si l'auteur n'a pas rédigé de texte, la blockquote est omise.
 */
function buildCard(a) {
  const texte = a.texte
    ? `<blockquote class="avis-text">"${a.texte}"</blockquote>`
    : '';

  return `<li class="avis-card reveal is-visible">
      ${buildStars(a.note)}
      ${texte}
      <footer class="avis-author">
        <strong>${a.auteur}</strong>
        <span>Google · ${a.date}</span>
      </footer>
    </li>`;
}

function renderAvis(data, grid, section) {
  const avis = (data.avis || []).filter(a => a.note >= 4);
  if (avis.length === 0) return;

  grid.innerHTML = avis.map(buildCard).join('\n');
  section.hidden = false;

  /* Met à jour la note agrégée si l'élément existe */
  const noteEl = document.querySelector('.avis-note-score');
  if (noteEl && data.note_moyenne) {
    noteEl.textContent = t('avis.google.reviews', `${data.note_moyenne}/5 · ${data.total} avis Google`, {
      note: data.note_moyenne,
      total: data.total
    });
  }
}

export async function loadGoogleAvis() {
  const grid = document.querySelector('.avis-grid');
  const section = document.getElementById('avis');
  if (!grid || !section) return;

  section.hidden = true;
  grid.innerHTML = '';

  try {
    const response = await fetch('/data/avis.json', { cache: 'no-store' });
    if (!response.ok) return;

    const data = await response.json();
    renderAvis(data, grid, section);
  } catch {
    section.hidden = true;
  }
}
