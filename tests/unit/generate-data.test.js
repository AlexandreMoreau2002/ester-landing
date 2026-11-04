import { readFile, unlink, writeFile } from 'node:fs/promises';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchJson,
  generateAvis,
  generateRealisations,
  getBuildEnv,
  loadEnvFile,
  main,
  parseEnv,
  required,
  starsOnly,
  todayIso,
  updateSitemapLastmod,
  writeData,
} from '../../scripts/generate-data.mjs';

describe('generate-data helpers', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    return unlink('public/data/unit-test.json').catch(() => {});
  });

  it('parses env files and keeps quoted values', () => {
    expect(parseEnv('\n# noop\nA=one\nB=\"two\"\nC=three=four\nBAD\n')).toEqual({
      A: 'one',
      B: 'two',
      C: 'three=four',
    });
  });

  it('requires prod env values', () => {
    expect(required({ TOKEN: 'x' }, 'TOKEN')).toBe('x');
    expect(() => required({}, 'TOKEN')).toThrow('TOKEN est requis quand ESTER_MODE=prod');
  });

  it('filters reviews below four stars', () => {
    expect(starsOnly([{ note: 5 }, { note: 3 }, { note: '4' }])).toEqual([{ note: 5 }, { note: '4' }]);
    expect(starsOnly()).toEqual([]);
  });

  it('throws useful errors for failed JSON responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Nope',
      json: () => Promise.resolve({ error: { message: 'broken' } }),
    }));

    await expect(fetchJson('https://example.test')).rejects.toThrow('500 broken');
  });

  it('uses empty JSON when a failed response has no JSON body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Missing',
      json: () => Promise.reject(new Error('bad json')),
    }));

    await expect(fetchJson('https://example.test')).rejects.toThrow('404 Missing');
  });

  it('returns parsed JSON for successful responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    }));

    await expect(fetchJson('https://example.test')).resolves.toEqual({ ok: true });
  });

  it('generates mock reviews in dev mode', async () => {
    const avis = await generateAvis({ ESTER_MODE: 'dev' });

    expect(avis.avis).toHaveLength(2);
    expect(avis.avis.every(review => review.note >= 4)).toBe(true);
  });

  it('generates Google reviews in prod mode and filters low ratings', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        status: 'OK',
        result: {
          rating: 4.7,
          user_ratings_total: 12,
          url: 'https://maps.test',
          reviews: [
            { author_name: 'A', rating: 5, text: 'top', relative_time_description: 'hier', author_url: 'https://a.test' },
            { rating: 2 },
            { author_name: '', rating: 4 },
          ],
        },
      }),
    }));

    const avis = await generateAvis({
      ESTER_MODE: 'prod',
      GOOGLE_PLACES_API_KEY: 'key',
      GOOGLE_PLACE_ID: 'place',
    });

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('place_id=place'), {});
    expect(avis).toMatchObject({ note_moyenne: 4.7, total: 12, url: 'https://maps.test' });
    expect(avis.avis).toEqual([
      { auteur: 'A', note: 5, texte: 'top', date: 'hier', profil: 'https://a.test' },
      { auteur: 'Client Google', note: 4, texte: '', date: '', profil: '' },
    ]);
  });

  it('throws when Google Places returns a non-OK status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'REQUEST_DENIED', error_message: 'bad key' }),
    }));

    await expect(generateAvis({
      ESTER_MODE: 'prod',
      GOOGLE_PLACES_API_KEY: 'key',
      GOOGLE_PLACE_ID: 'place',
    })).rejects.toThrow('Google Places API: REQUEST_DENIED - bad key');
  });

  it('throws Google status errors without optional messages', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'ZERO_RESULTS' }),
    }));

    await expect(generateAvis({
      ESTER_MODE: 'prod',
      GOOGLE_PLACES_API_KEY: 'key',
      GOOGLE_PLACE_ID: 'place',
    })).rejects.toThrow('Google Places API: ZERO_RESULTS');
  });

  it('generates empty Google reviews when the result payload is missing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'OK' }),
    }));

    await expect(generateAvis({
      ESTER_MODE: 'prod',
      GOOGLE_PLACES_API_KEY: 'key',
      GOOGLE_PLACE_ID: 'place',
    })).resolves.toEqual({
      note_moyenne: null,
      total: 0,
      url: '',
      avis: [],
    });
  });

  it.each([
    { ESTER_MODE: 'dev' },
    { ESTER_MODE: 'prod' },
    { ESTER_MODE: 'dev', NOTION_TOKEN: 'secret', NOTION_DATABASE_ID: 'db' },
    { ESTER_MODE: 'prod', NOTION_TOKEN: 'secret', NOTION_DATABASE_ID: 'db' },
  ])('writes an empty build fallback without contacting Notion: %j', async env => {
    vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Build must not call Notion'); }));
    await expect(generateRealisations(env)).resolves.toEqual({ realisations: [] });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('loads build env from .env files and process.env defaults', async () => {
    const env = await getBuildEnv({
      loadEnvFile: async path => path === '.env' ? { ESTER_MODE: 'dev', A: 'file' } : { A: 'local', B: 'local' },
      processEnv: { A: 'process' },
    });

    expect(env).toMatchObject({ ESTER_MODE: 'dev', A: 'process', B: 'local' });
  });

  it('defaults build env mode to prod', async () => {
    const env = await getBuildEnv({
      loadEnvFile: async () => ({}),
      processEnv: {},
    });

    expect(env.ESTER_MODE).toBe('prod');
  });

  it('loads real env files when present and returns empty objects when absent', async () => {
    // Utilise un fixture commité — le vrai .env est gitignored et absent en CI
    await expect(loadEnvFile('tests/fixtures/.env.test')).resolves.toHaveProperty('ESTER_MODE');
    await expect(loadEnvFile('.definitely-missing-env-file')).resolves.toEqual({});
  });

  it('todayIso returns a YYYY-MM-DD string matching today', () => {
    const result = todayIso();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result).toBe(new Date().toISOString().slice(0, 10));
  });

  it('updateSitemapLastmod replaces all lastmod dates in the sitemap', async () => {
    const sitemapPath = 'public/sitemap-unit-test.xml';
    const original = `<?xml version="1.0"?>\n<urlset>\n  <url><lastmod>2020-01-01</lastmod></url>\n  <url><lastmod>2020-01-01</lastmod></url>\n</urlset>\n`;
    await writeFile(sitemapPath, original);

    await updateSitemapLastmod(sitemapPath, '2099-12-31');

    const result = await readFile(sitemapPath, 'utf8');
    expect(result).not.toContain('2020-01-01');
    expect(result.match(/<lastmod>2099-12-31<\/lastmod>/g)).toHaveLength(2);

    await unlink(sitemapPath);
  });

  it('writes generated data files and runs the dev main flow', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    await writeData('unit-test.json', { ok: true });
    await main();

    expect(log).toHaveBeenCalledWith('Generated public data for ESTER_MODE=dev');
  });

  it('runs the prod main flow from process env', async () => {
    process.env.ESTER_MODE = 'prod';
    process.env.GOOGLE_PLACES_API_KEY = 'key';
    process.env.GOOGLE_PLACE_ID = 'place';
    delete process.env.NOTION_TOKEN;
    delete process.env.NOTION_DATABASE_ID;
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'OK', result: { reviews: [{}] } }),
      }));
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    await main();

    expect(log).toHaveBeenCalledWith('Generated public data for ESTER_MODE=prod');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(await readFile('public/data/realisations.json', 'utf8'))).toEqual({ realisations: [] });
  });
});
