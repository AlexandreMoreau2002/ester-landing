import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

// Keep helper exports compatible for existing consumers; all CMS fetching is runtime-only.
export { plainText, firstProp, propText, propImage, propPublished, normalizeRealisation } from '../server/notion-realisations.mjs';

const SITEMAP_PATH = join(process.cwd(), 'public', 'sitemap.xml');

const DATA_DIR = join(process.cwd(), 'public', 'data');
const GOOGLE_FIELDS = 'rating,user_ratings_total,reviews,url';

/* Avis Google réels, repris en dur : servis en dev et dès que GOOGLE_PLACES_API_KEY est absente. */
const FALLBACK_AVIS = {
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
  if (env.ESTER_MODE === 'dev' || !env.GOOGLE_PLACES_API_KEY) {
    return {
      ...FALLBACK_AVIS,
      avis: starsOnly(FALLBACK_AVIS.avis),
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

export async function generateRealisations(env) {
  // Local fixtures keep Vite development usable without runtime Notion access.
  if (env.ESTER_MODE === 'dev') {
    return { realisations: [{
      titre: 'Projet de démonstration',
      type: 'Bâtiment public',
      categorie: 'Diagnostic structurel',
      lieu: 'Gap',
      description: 'Exemple fictif pour le développement local du site ESTER.',
      image: '',
    }] };
  }
  // Live projects are fetched by the server; production keeps an empty build fallback.
  return { realisations: [] };
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export async function updateSitemapLastmod(sitemapPath = SITEMAP_PATH, date = todayIso()) {
  const xml = await readFile(sitemapPath, 'utf8');
  const updated = xml.replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${date}</lastmod>`);
  await writeFile(sitemapPath, updated);
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
  await updateSitemapLastmod();
  console.log(`Generated public data for ESTER_MODE=${mode}`);
}

/* v8 ignore next 6 */
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main().catch(error => {
    console.error(error.message);
    process.exit(1);
  });
}
