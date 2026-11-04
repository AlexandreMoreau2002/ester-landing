import { describe, expect, it, vi } from 'vitest';
import {
  plainText,
  propText,
  propImage,
  propPublished,
  normalizeRealisation,
  createNotionRealisationsService,
} from '../../server/notion-realisations.mjs';

const env = { NOTION_TOKEN: 'secret', NOTION_DATABASE_ID: 'db' };
const page = { properties: { Titre: { type: 'title', title: [{ plain_text: 'École' }] } } };
const response = (results = [page], extra = {}) => Response.json({ results, has_more: false, next_cursor: null, ...extra });

describe('runtime Notion realisations', () => {
  it('maps only published pages into the existing card contract', async () => {
    const fetch = vi.fn(async () => response([
      { properties: {
        Titre: { type: 'title', title: [{ plain_text: ' École ' }] },
        Type: { type: 'select', select: { name: 'Enseignement' } },
        Catégorie: { type: 'rich_text', rich_text: [{ plain_text: 'Neuf' }] },
        Lieu: { type: 'rich_text', rich_text: [{ plain_text: 'Gap' }] },
        Description: { type: 'rich_text', rich_text: [{ plain_text: 'Une école' }] },
        Image: { files: [{ type: 'external', external: { url: 'https://image.test/ecole.jpg' } }] },
        Publié: { type: 'checkbox', checkbox: true },
      } },
      { properties: { Publié: { type: 'checkbox', checkbox: false } } },
      {},
    ]));
    const service = createNotionRealisationsService({ env, fetch });

    expect(await service.getRealisations()).toEqual({ stale: false, realisations: [
      { titre: 'École', type: 'Enseignement', categorie: 'Neuf', lieu: 'Gap', description: 'Une école', image: 'https://image.test/ecole.jpg' },
      { titre: 'Projet ESTER', type: 'Bâtiment public', categorie: '', lieu: 'Hautes-Alpes', description: '', image: '' },
    ] });
    expect(fetch).toHaveBeenCalledWith('https://api.notion.com/v1/databases/db/query', expect.objectContaining({
      method: 'POST',
      headers: { Authorization: 'Bearer secret', 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
      body: JSON.stringify({ page_size: 100, sorts: [{ timestamp: 'created_time', direction: 'descending' }] }),
    }));
  });

  it('reuses the cache before 15 seconds and refreshes at the boundary', async () => {
    let time = 1000;
    const fetch = vi.fn().mockImplementationOnce(async () => response()).mockImplementationOnce(async () => response([]));
    const service = createNotionRealisationsService({ env, fetch, now: () => time });
    await service.getRealisations();
    time = 15999;
    expect((await service.getRealisations()).realisations[0].titre).toBe('École');
    expect(fetch).toHaveBeenCalledTimes(1);
    time = 16000;
    expect(await service.getRealisations()).toEqual({ realisations: [], stale: false });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('serves the last good cache after refresh failure and retries later', async () => {
    let time = 0;
    const fetch = vi.fn()
      .mockImplementationOnce(async () => response())
      .mockRejectedValueOnce(new Error('offline'))
      .mockImplementationOnce(async () => response([]));
    const service = createNotionRealisationsService({ env, fetch, now: () => time });
    const first = await service.getRealisations();
    time = 60000;
    expect(await service.getRealisations()).toEqual({ ...first, stale: true });
    expect(await service.getRealisations()).toEqual({ realisations: [], stale: false });
  });

  it.each(['fetch', 'json'])('bounds a hanging %s refresh, serves stale data, and permits a later retry', async stage => {
    vi.useFakeTimers();
    try {
      let time = 0;
      let finish;
      const latePage = { properties: { Titre: { type: 'title', title: [{ plain_text: 'Late response' }] } } };
      const pending = new Promise(resolve => { finish = resolve; });
      const fetch = vi.fn()
        .mockImplementationOnce(async () => response())
        .mockImplementationOnce(() => stage === 'fetch' ? pending : Promise.resolve({ ok: true, json: () => pending }))
        .mockImplementationOnce(async () => response([]));
      const service = createNotionRealisationsService({ env, fetch, now: () => time });
      const original = await service.getRealisations();
      expect(vi.getTimerCount()).toBe(0);
      time = 60000;
      const completed = [];
      const first = service.getRealisations().then(result => completed.push(result));
      const second = service.getRealisations().then(result => completed.push(result));

      await vi.advanceTimersByTimeAsync(9999);
      expect(completed).toEqual([]);
      await vi.advanceTimersByTimeAsync(1);
      expect(completed).toEqual([{ ...original, stale: true }, { ...original, stale: true }]);
      await Promise.all([first, second]);
      expect(fetch.mock.calls[1][1].signal.aborted).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(vi.getTimerCount()).toBe(0);

      // Even a transport that ignores abort must not publish its late result.
      finish(stage === 'fetch' ? response([latePage]) : { results: [latePage], has_more: false });
      await vi.advanceTimersByTimeAsync(0);
      expect(await service.getRealisations()).toEqual({ realisations: [], stale: false });
      expect(fetch).toHaveBeenCalledTimes(3);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it.each([{}, { NOTION_TOKEN: 'secret' }, { NOTION_DATABASE_ID: 'db' }])('rejects missing runtime configuration without calling Notion: %j', async config => {
    const fetch = vi.fn();
    const service = createNotionRealisationsService({ env: config, fetch });
    await expect(service.getRealisations()).rejects.toThrow('Notion CMS unavailable');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('coalesces concurrent refreshes into one request', async () => {
    let finish;
    const fetch = vi.fn(() => new Promise(resolve => { finish = resolve; }));
    const service = createNotionRealisationsService({ env, fetch });
    const first = service.getRealisations();
    const second = service.getRealisations();
    finish(response());
    expect(await first).toEqual(await second);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('fetches every page before publishing the cache', async () => {
    const fetch = vi.fn()
      .mockImplementationOnce(async () => response([page], { has_more: true, next_cursor: 'next' }))
      .mockImplementationOnce(async () => response([{ properties: { Nom: { type: 'title', title: [{ plain_text: 'Mairie' }] } } }]));
    const service = createNotionRealisationsService({ env, fetch });
    expect((await service.getRealisations()).realisations.map(item => item.titre)).toEqual(['École', 'Mairie']);
    expect(JSON.parse(fetch.mock.calls[1][1].body).start_cursor).toBe('next');
  });

  it('retains the complete old cache when a later page fails', async () => {
    let time = 0;
    const fetch = vi.fn()
      .mockImplementationOnce(async () => response())
      .mockImplementationOnce(async () => response([], { has_more: true, next_cursor: 'next' }))
      .mockImplementationOnce(async () => new Response('error', { status: 500 }));
    const service = createNotionRealisationsService({ env, fetch, now: () => time });
    await service.getRealisations();
    time = 60000;
    const cached = await service.getRealisations();
    expect(cached.stale).toBe(true);
    expect(cached.realisations[0].titre).toBe('École');
  });

  it.each([
    () => new Response('error', { status: 401 }),
    () => new Response('not json'),
    () => Response.json({}),
    () => Response.json({ results: [], has_more: true, next_cursor: null }),
  ])('rejects failed or incomplete Notion responses without caching them', async makeResponse => {
    const service = createNotionRealisationsService({ env, fetch: async () => makeResponse() });
    await expect(service.getRealisations()).rejects.toThrow();
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

});
