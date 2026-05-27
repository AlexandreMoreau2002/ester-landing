import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const DATA_DIR = join(process.cwd(), 'public', 'data');
const GOOGLE_FIELDS = 'rating,user_ratings_total,reviews,url';

const MOCK_AVIS = {
  note_moyenne: 4.5,
  total: 2,
  url: 'https://www.google.com/maps/place/Ester+Sarl/@44.5624537,6.0846692,17z/data=!3m1!4b1!4m6!3m5!1s0x12cb4069d06a9419:0x72daaab867139eef!8m2!3d44.5624537!4d6.0846692!16s%2Fg%2F1v7x_w0s',
  avis: [
    {
      auteur: 'Noémie De Oliveira',
      note: 5,
      texte: '',
      date: 'il y a un an',
      profil: '',
    },
    {
      auteur: 'jean louis rey',
      note: 4,
      texte: '',
      date: 'il y a 3 ans',
      profil: '',
    },
  ],
};

export function parseEnv(text) {
  return text.split(/\r?\n/).reduce((env, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return env;

    const separator = trimmed.indexOf('=');
    if (separator === -1) return env;

    const key = trimmed.slice(0, separator).trim();
    const raw = trimmed.slice(separator + 1).trim();
    env[key] = raw.replace(/^['"]|['"]$/g, '');
    return env;
  }, {});
}

export async function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  return parseEnv(await readFile(path, 'utf8'));
}

export async function getBuildEnv({
  loadEnvFile: readEnvFile = loadEnvFile,
  processEnv = process.env,
} = {}) {
  const fileEnv = {
    ...(await readEnvFile('.env')),
    ...(await readEnvFile('.env.local')),
  };

  return {
    ...fileEnv,
    ...processEnv,
    ESTER_MODE: processEnv.ESTER_MODE || fileEnv.ESTER_MODE || 'prod',
  };
}

export function required(env, key) {
  const value = env[key];
  if (!value) {
    throw new Error(`${key} est requis quand ESTER_MODE=prod`);
  }
  return value;
}

export function starsOnly(reviews = []) {
  return reviews.filter(review => Number(review.note) >= 4);
}

export async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error?.message || data?.message || response.statusText;
    throw new Error(`${response.status} ${message}`);
  }

  return data;
}

export async function generateAvis(env) {
  if (env.ESTER_MODE === 'dev') {
    return {
      ...MOCK_AVIS,
      avis: starsOnly(MOCK_AVIS.avis),
    };
  }

  const apiKey = required(env, 'GOOGLE_PLACES_API_KEY');
  const placeId = required(env, 'GOOGLE_PLACE_ID');
  const params = new URLSearchParams({
    place_id: placeId,
    fields: GOOGLE_FIELDS,
    reviews_sort: 'newest',
    language: 'fr',
    key: apiKey,
  });

  const data = await fetchJson(`https://maps.googleapis.com/maps/api/place/details/json?${params}`);
  if (data.status !== 'OK') {
    throw new Error(`Google Places API: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`);
  }

  const result = data.result || {};
  const avis = (result.reviews || []).map(review => ({
    auteur: review.author_name || 'Client Google',
    note: Number(review.rating || 0),
    texte: review.text || '',
    date: review.relative_time_description || '',
    profil: review.author_url || '',
  }));

  return {
    note_moyenne: result.rating || null,
    total: result.user_ratings_total || avis.length,
    url: result.url || '',
    avis: starsOnly(avis),
  };
}

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

export async function generateRealisations(env) {
  if (env.ESTER_MODE === 'dev' && (!env.NOTION_TOKEN || !env.NOTION_DATABASE_ID)) {
    return { realisations: [] };
  }

  const token = required(env, 'NOTION_TOKEN');
  const databaseId = required(env, 'NOTION_DATABASE_ID');
  const data = await fetchJson(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      page_size: 100,
      sorts: [
        {
          timestamp: 'created_time',
          direction: 'descending',
        },
      ],
    }),
  });

  const realisations = (data.results || [])
    .filter(page => propPublished(page.properties || {}))
    .map(normalizeRealisation)
    .filter(item => item.titre);

  return { realisations };
}

export async function writeData(name, data) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(join(DATA_DIR, name), `${JSON.stringify(data, null, 2)}\n`);
}

export async function main() {
  const env = await getBuildEnv();
  const mode = env.ESTER_MODE === 'dev' ? 'dev' : 'prod';
  const buildEnv = { ...env, ESTER_MODE: mode };

  const [avis, realisations] = await Promise.all([
    generateAvis(buildEnv),
    generateRealisations(buildEnv),
  ]);

  await writeData('avis.json', avis);
  await writeData('realisations.json', realisations);
  console.log(`Generated public data for ESTER_MODE=${mode}`);
}

/* v8 ignore next 6 */
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main().catch(error => {
    console.error(error.message);
    process.exit(1);
  });
}
