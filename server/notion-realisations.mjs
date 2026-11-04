const CACHE_TTL_MS = 15_000;
const FAILURE_COOLDOWN_MS = 15_000;
const REFRESH_DEADLINE_MS = 10_000;

export function plainText(items = []) {
  return items.map(item => item.plain_text || '').join('').trim();
}

export function firstProp(properties, names) {
  return names.map(name => properties[name]).find(Boolean);
}

export function propText(properties, names) {
  const prop = firstProp(properties, names);
  if (!prop) return '';

  if (prop.type === 'title') return plainText(prop.title);
  if (prop.type === 'rich_text') return plainText(prop.rich_text);
  if (prop.type === 'select') return prop.select?.name || '';
  if (prop.type === 'multi_select') return (prop.multi_select || []).map(item => item.name).join(', ');
  if (prop.type === 'url') return prop.url || '';
  if (prop.type === 'number') return String(prop.number ?? '');
  if (prop.type === 'date') return prop.date?.start || '';
  return '';
}

export function propImage(properties, names) {
  const prop = firstProp(properties, names);
  const file = prop?.files?.[0];
  if (!file) return '';
  return file.type === 'external' ? file.external?.url || '' : file.file?.url || '';
}

export function propPublished(properties) {
  const prop = firstProp(properties, ['Publié', 'Publie', 'Published', 'Statut', 'Status']);
  if (!prop) return true;
  if (prop.type === 'checkbox') return Boolean(prop.checkbox);
  if (prop.type === 'status') return /publi|publish|live|online/i.test(prop.status?.name || '');
  if (prop.type === 'select') return /publi|publish|live|online/i.test(prop.select?.name || '');
  return true;
}

export function normalizeRealisation(page) {
  const p = page.properties || {};
  return {
    titre: propText(p, ['Titre', 'Nom', 'Name', 'Projet', 'Title']) || 'Projet ESTER',
    type: propText(p, ['Type', 'Typologie', 'Catégorie principale']) || 'Bâtiment public',
    categorie: propText(p, ['Catégorie', 'Categorie', 'Category']),
    lieu: propText(p, ['Lieu', 'Ville', 'Location']) || 'Hautes-Alpes',
    description: propText(p, ['Description', 'Résumé', 'Resume', 'Summary']),
    image: propImage(p, ['Image', 'Photo', 'Cover', 'Visuel']),
  };
}

export function createNotionRealisationsService({
  env = process.env,
  fetch = globalThis.fetch,
  now = Date.now,
} = {}) {
  let cache = null;
  let refresh = null;
  let retryAfter = 0;

  async function fetchRealisations(signal) {
    if (!env.NOTION_TOKEN || !env.NOTION_DATABASE_ID) throw new Error('Notion CMS unavailable');

    const realisations = [];
    const seenCursors = new Set();
    let cursor;
    do {
      const response = await fetch(`https://api.notion.com/v1/databases/${env.NOTION_DATABASE_ID}/query`, {
        method: 'POST',
        signal,
        headers: {
          Authorization: `Bearer ${env.NOTION_TOKEN}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          page_size: 100,
          sorts: [{ timestamp: 'created_time', direction: 'descending' }],
          ...(cursor ? { start_cursor: cursor } : {}),
        }),
      });
      signal.throwIfAborted();
      if (!response.ok) throw new Error('Notion CMS unavailable');
      const data = await response.json();
      signal.throwIfAborted();
      if (!Array.isArray(data.results)) throw new Error('Notion CMS unavailable');

      realisations.push(...data.results
        .filter(page => propPublished(page.properties || {}))
        .map(normalizeRealisation));

      cursor = data.has_more ? data.next_cursor : null;
      if (data.has_more && (!cursor || seenCursors.has(cursor))) throw new Error('Notion CMS unavailable');
      seenCursors.add(cursor);
    } while (cursor);

    // Replace the last good response only after every page succeeds.
    cache = { realisations, fetchedAt: now() };
    return { realisations, stale: false };
  }

  async function refreshWithDeadline() {
    const controller = new AbortController();
    let timer;
    const deadline = new Promise((_, reject) => {
      timer = setTimeout(() => {
        const error = new Error('Notion CMS unavailable');
        controller.abort(error);
        reject(error);
      }, REFRESH_DEADLINE_MS);
    });
    try {
      // The race also bounds body consumption and transports that ignore abort.
      return await Promise.race([fetchRealisations(controller.signal), deadline]);
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    async getRealisations() {
      if (cache && now() - cache.fetchedAt < CACHE_TTL_MS) {
        return { realisations: cache.realisations, stale: false };
      }
      if (now() < retryAfter) {
        if (cache) return { realisations: cache.realisations, stale: true };
        throw new Error('Notion CMS unavailable');
      }
      if (!refresh) {
        refresh = refreshWithDeadline().catch(error => {
          retryAfter = now() + FAILURE_COOLDOWN_MS;
          throw error;
        }).finally(() => { refresh = null; });
      }
      try {
        return await refresh;
      } catch {
        if (cache) return { realisations: cache.realisations, stale: true };
        throw new Error('Notion CMS unavailable');
      }
    },
  };
}
