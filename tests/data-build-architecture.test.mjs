import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const text = path => readFileSync(path, 'utf8');

assert.ok(existsSync('package.json'), 'package.json must exist for Netlify build commands');
const pkg = JSON.parse(text('package.json'));
assert.equal(pkg.scripts?.build, 'node scripts/generate-data.mjs && vite build');
assert.equal(pkg.scripts?.dev, 'node scripts/generate-data.mjs && vite --host 0.0.0.0');
assert.ok(pkg.devDependencies?.vite, 'Vite must be installed as a dev dependency');

assert.ok(existsSync('scripts/generate-data.mjs'), 'build-time data generator is required');
assert.ok(existsSync('public/data/.gitkeep'), 'public data directory must be present');
assert.equal(existsSync('js/env.js'), false, 'client-side .env reader must not exist');

const main = text('main.js');
assert.equal(main.includes('./js/env.js'), false, 'main.js must not import client-side env code');
assert.equal(main.includes('loadEsterConfig'), false, 'main.js must not load .env in the browser');

const avis = text('js/avis.js');
assert.match(avis, /fetch\(['"]\/data\/avis\.json['"]/, 'avis module must consume generated public JSON');
assert.equal(avis.includes('MOCK_AVIS'), false, 'review mocks belong in the build script only');
assert.match(avis, /\.filter\([^)]*note\s*>=\s*4/s, 'client still filters reviews below 4 stars');

const notion = text('js/notion.js');
assert.match(notion, /fetch\(['"]\/data\/realisations\.json['"]/, 'realisations module must consume generated public JSON');

const envExample = text('.env.example');
for (const key of ['ESTER_MODE', 'NOTION_TOKEN', 'NOTION_DATABASE_ID', 'GOOGLE_PLACES_API_KEY', 'GOOGLE_PLACE_ID']) {
  assert.match(envExample, new RegExp(`^${key}=`, 'm'), `.env.example must document ${key}`);
}
