import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFile, unlink, writeFile } from 'node:fs/promises';

import {
  fetchJson,
  generateAvis,
  generateRealisations,
  getBuildEnv,
  loadEnvFile,
  main,
  normalizeRealisation,
  parseEnv,
  plainText,
  propImage,
  propPublished,
  propText,
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

  it('extracts Notion text, images and publication status', () => {
    const properties = {
      Titre: { type: 'title', title: [{ plain_text: 'Projet' }] },
      Description: { type: 'rich_text', rich_text: [{ plain_text: 'Résumé' }] },
      Type: { type: 'select', select: { name: 'Tourisme' } },
      Tags: { type: 'multi_select', multi_select: [{ name: 'A' }, { name: 'B' }] },
      Link: { type: 'url', url: 'https://site.test' },
      Count: { type: 'number', number: 7 },
      When: { type: 'date', date: { start: '2026-01-01' } },
      EmptyNumber: { type: 'number', number: null },
      EmptySelect: { type: 'select', select: null },
      EmptyMulti: { type: 'multi_select', multi_select: [{}, { name: 'B' }] },
      EmptyUrl: { type: 'url', url: null },
      EmptyDate: { type: 'date', date: null },
      Photo: { files: [{ type: 'external', external: { url: 'https://image.test/a.jpg' } }] },
      Cover: { files: [{ type: 'file', file: { url: 'https://image.test/b.jpg' } }] },
      EmptyPhoto: { files: [{ type: 'external', external: null }] },
      EmptyCover: { files: [{ type: 'file', file: null }] },
    };

    expect(propText(properties, ['Titre'])).toBe('Projet');
    expect(propText(properties, ['Description'])).toBe('Résumé');
    expect(propText(properties, ['Type'])).toBe('Tourisme');
    expect(propText(properties, ['Tags'])).toBe('A, B');
    expect(propText(properties, ['Link'])).toBe('https://site.test');
    expect(propText(properties, ['Count'])).toBe('7');
    expect(propText(properties, ['When'])).toBe('2026-01-01');
    expect(propText(properties, ['EmptyNumber'])).toBe('');
    expect(propText(properties, ['EmptySelect'])).toBe('');
    expect(propText(properties, ['EmptyMulti'])).toBe(', B');
    expect(propText(properties, ['EmptyUrl'])).toBe('');
    expect(propText(properties, ['EmptyDate'])).toBe('');
    expect(propText(properties, ['Missing'])).toBe('');
    expect(propText({ Other: { type: 'unknown' } }, ['Other'])).toBe('');
    expect(plainText([{}])).toBe('');
    expect(propText({ EmptyMultiNull: { type: 'multi_select', multi_select: null } }, ['EmptyMultiNull'])).toBe('');
    expect(propImage(properties, ['Photo'])).toBe('https://image.test/a.jpg');
    expect(propImage(properties, ['Cover'])).toBe('https://image.test/b.jpg');
    expect(propImage(properties, ['EmptyPhoto'])).toBe('');
    expect(propImage(properties, ['EmptyCover'])).toBe('');
    expect(propImage({ Photo: {} }, ['Photo'])).toBe('');
    expect(propImage(properties, ['Missing'])).toBe('');
    expect(propPublished({})).toBe(true);
    expect(propPublished({ Publié: { type: 'checkbox', checkbox: true } })).toBe(true);
    expect(propPublished({ Publié: { type: 'checkbox', checkbox: false } })).toBe(false);
    expect(propPublished({ Status: { type: 'status', status: { name: 'Published' } } })).toBe(true);
    expect(propPublished({ Status: { type: 'status', status: { name: 'Draft' } } })).toBe(false);
    expect(propPublished({ Status: { type: 'status', status: null } })).toBe(false);
    expect(propPublished({ Status: { type: 'select', select: { name: 'Published' } } })).toBe(true);
    expect(propPublished({ Status: { type: 'select', select: { name: 'Draft' } } })).toBe(false);
    expect(propPublished({ Status: { type: 'select', select: null } })).toBe(false);
    expect(propPublished({ Status: { type: 'rich_text' } })).toBe(true);
  });

  it('normalizes Notion pages with defaults', () => {
    expect(normalizeRealisation({ properties: {} })).toEqual({
      titre: 'Projet ESTER',
      type: 'Bâtiment public',
      categorie: '',
      lieu: 'Hautes-Alpes',
      description: '',
      image: '',
    });
    expect(normalizeRealisation({}).titre).toBe('Projet ESTER');
  });

  it('generates empty realisations in dev when Notion is not configured', async () => {
    await expect(generateRealisations({ ESTER_MODE: 'dev' })).resolves.toEqual({ realisations: [] });
  });

  it('uses Notion in dev when credentials are present', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    }));

    await expect(generateRealisations({
      ESTER_MODE: 'dev',
      NOTION_TOKEN: 'secret',
      NOTION_DATABASE_ID: 'db',
    })).resolves.toEqual({ realisations: [] });
  });

  it('generates published Notion realisations', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        results: [
          {
            properties: {
              Titre: { type: 'title', title: [{ plain_text: 'Publié' }] },
              Publié: { type: 'checkbox', checkbox: true },
            },
          },
          {
            properties: {},
          },
          {
            properties: {
              Titre: { type: 'title', title: [{ plain_text: 'Brouillon' }] },
              Publié: { type: 'checkbox', checkbox: false },
            },
          },
          {},
        ],
      }),
    }));

    const data = await generateRealisations({
      ESTER_MODE: 'prod',
      NOTION_TOKEN: 'secret',
      NOTION_DATABASE_ID: 'db',
    });

    expect(fetch).toHaveBeenCalledWith('https://api.notion.com/v1/databases/db/query', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer secret' }),
    }));
    expect(data.realisations).toHaveLength(3);
    expect(data.realisations[0].titre).toBe('Publié');
    expect(data.realisations[1].titre).toBe('Projet ESTER');
    expect(data.realisations[2].titre).toBe('Projet ESTER');
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
    process.env.NOTION_TOKEN = 'secret';
    process.env.NOTION_DATABASE_ID = 'db';
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'OK', result: { reviews: [{}] } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      }));
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    await main();

    expect(log).toHaveBeenCalledWith('Generated public data for ESTER_MODE=prod');
  });
});
