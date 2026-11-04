// @vitest-environment node
import { build } from 'vite';
import { JSDOM } from 'jsdom';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import assert from 'node:assert/strict';
import { createServer } from '../server.mjs';
import { mkdtemp, rm } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';

const test = process.env.VITEST ? (await import('vitest')).it : async (_name, run) => run();

const text = path => readFileSync(path, 'utf8');

await test('preserves the data-loading architecture', () => {
  assert.ok(existsSync('package.json'), 'package.json must exist for build commands');
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
  assert.match(notion, /fetch\(['"]\/api\/realisations['"]/, 'realisations module must consume the runtime Notion API');

  const envExample = text('.env.example');
  for (const key of ['ESTER_MODE', 'NOTION_TOKEN', 'NOTION_DATABASE_ID', 'GOOGLE_PLACES_API_KEY', 'GOOGLE_PLACE_ID']) {
    assert.match(envExample, new RegExp(`^${key}=`, 'm'), `.env.example must document ${key}`);
  }
});

await test('serves built legal CSS and modules plus the existing favicon', async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'ester-legal-build-'));
  const server = createServer({ distDir: outDir });
  try {
    await build({ build: { outDir }, logLevel: 'silent' });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const origin = `http://127.0.0.1:${server.address().port}`;
    const homeResponse = await fetch(origin);
    assert.equal(homeResponse.status, 200);
    const home = await homeResponse.text();

    const legalResponse = await fetch(`${origin}/mentions-legales.html`);
    assert.equal(legalResponse.status, 200);
    const legal = await legalResponse.text();
    const modulePaths = [...legal.matchAll(/<script[^>]*type="module"[^>]*src="([^"]+)"/g)].map(match => match[1]);
    const cssPaths = [...legal.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(match => match[1]);
    assert.ok(modulePaths.length, 'legal translations must be bundled as a module');
    assert.ok(cssPaths.length, 'legal CSS must be emitted by Vite');
    const stylesheets = new Map();
    for (const [paths, type] of [[modulePaths, 'text/javascript'], [cssPaths, 'text/css']]) {
      for (const path of paths) {
        const response = await fetch(new URL(path, origin));
        assert.equal(response.status, 200, `legal asset ${path} must exist`);
        assert.ok(response.headers.get('content-type').startsWith(type));
        const body = await response.text();
        if (type === 'text/javascript') {
          assert.match(body, /applyEsterTranslations/);
          assert.match(body, /estersarl.ing@gmail.com/);
          assert.equal(body.includes('contact@ester-bet.fr'), false);
        } else {
          assert.match(body, /--bleu/);
          stylesheets.set(path, body);
        }
      }
    }
    // Preserve the emitted CSS order: Vite puts the shared stylesheet after the inline theme.
    const renderedLegal = legal.replace(
      /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,
      (_tag, path) => `<style>${stylesheets.get(path)}</style>`,
    );
    const dom = new JSDOM(renderedLegal);
    try {
      const { document, getComputedStyle } = dom.window;
      const theme = getComputedStyle(document.body);
      assert.match(theme.backgroundImage, /^radial-gradient\(/, 'the legal page must keep its dark gradient after shared CSS loads');
      assert.match(theme.backgroundImage, /rgb\(10, 31, 58\)/, 'the legal gradient must retain its dark background');
      assert.equal(theme.color, 'rgb(255, 255, 255)', 'legal body text must stay white against the dark theme');
      assert.equal(getComputedStyle(document.querySelector('.legal-text')).color, 'rgba(255, 255, 255, 0.78)');
    } finally {
      dom.window.close();
    }
    assert.match(home, /<title[^>]*>ESTER SAS, ingénierie structurelle à Gap<\/title>/);
    assert.match(home, /data-i18n="services.s2.title">Diagnostics techniques solidité</);
    assert.match(home, /data-i18n="contact.sujet.o2">Diagnostics techniques solidité</);
    assert.match(home, /data-i18n="recru.li4">Travail en équipe</);
    assert.equal(JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]).email, 'estersarl.ing@gmail.com');
    assert.equal(home.includes('contact@ester-bet.fr'), false);
    for (const email of home.matchAll(/mailto:([^"\s]+)/g)) {
      assert.equal(email[1], 'estersarl.ing@gmail.com');
    }

    assert.equal(legal.includes('contact@ester-bet.fr'), false);
    assert.match(legal, /mailto:estersarl.ing@gmail.com/);
    const icons = [...home.matchAll(/<link[^>]*rel="icon"[^>]*href="([^"]+)"/g)];
    assert.equal(icons.length, 1, 'keep a single existing favicon');
    const faviconResponse = await fetch(new URL(icons[0][1], origin));
    assert.equal(faviconResponse.status, 200);
    assert.equal(faviconResponse.headers.get('content-type'), 'image/png');
    const favicon = Buffer.from(await faviconResponse.arrayBuffer());
    assert.equal(favicon.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  } finally {
    if (server.listening) await new Promise(resolve => server.close(resolve));
    await rm(outDir, { recursive: true, force: true });
  }
}, 20_000);
