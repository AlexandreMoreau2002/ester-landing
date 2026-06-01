import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let importId = 0;
const freshImport = () => import(/* @vite-ignore */ `../../netlify/functions/form-notify.mjs?t=${++importId}`);

function makeRequest(data) {
  return new Request('http://localhost/.netlify/functions/form-notify', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

describe('form-notify Netlify Function', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv, RESEND_API_KEY: 'test-key', NOTIFY_EMAIL: 'philippe@example.com' };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it('sends an email with correct subject, body, and contact block', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    const { default: handler } = await freshImport();
    const res = await handler(makeRequest({
      nom: 'Moreau',
      prenom: 'Alexandre',
      email: 'alex@test.fr',
      tel: '0769666370',
      societe: 'ESTER SAS',
      sujet_label: 'Étude de structure béton',
      message: 'Bonjour, je voudrais un devis.',
    }));

    expect(res.status).toBe(200);
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    const body = JSON.parse(options.body);
    expect(body.subject).toBe('Site internet - Étude de structure béton - Moreau Alexandre');
    expect(body.text).toContain('Bonjour, je voudrais un devis.');
    expect(body.text).toContain('Nom : Moreau Alexandre');
    expect(body.text).toContain('Email : alex@test.fr');
    expect(body.text).toContain('Tél : 0769666370');
    expect(body.text).toContain('Entreprise : ESTER SAS');
    expect(body.reply_to).toBe('alex@test.fr');
    expect(body.to).toEqual(['philippe@example.com']);
    expect(options.headers.Authorization).toBe('Bearer test-key');
  });

  it('omits Tél and Entreprise lines when those fields are empty', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    const { default: handler } = await freshImport();
    const res = await handler(makeRequest({
      nom: 'Durand',
      prenom: 'Claire',
      email: 'claire@test.fr',
      tel: '',
      societe: '',
      sujet_label: 'Autre demande',
      message: 'Question rapide.',
    }));

    expect(res.status).toBe(200);
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.text).not.toContain('Tél');
    expect(body.text).not.toContain('Entreprise');
  });

  it('falls back to sujet slug when sujet_label is absent', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    const { default: handler } = await freshImport();
    await handler(makeRequest({
      nom: 'Dupont', prenom: 'Jean', email: 'j@test.fr',
      sujet: 'faisabilite', message: 'Test',
    }));

    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.subject).toContain('faisabilite');
  });

  it('falls back to "Contact" when neither sujet_label nor sujet is present', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    const { default: handler } = await freshImport();
    await handler(makeRequest({ nom: 'X', prenom: 'Y', email: 'x@test.fr', message: 'msg' }));

    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.subject).toContain('Contact');
  });

  it('returns 502 when Resend API returns an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      text: async () => 'Invalid API key',
    }));

    const { default: handler } = await freshImport();
    const res = await handler(makeRequest({
      nom: 'X', prenom: 'Y', email: 'x@test.fr', message: 'msg',
    }));

    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toBe('Invalid API key');
  });

  it('returns 500 when request.json() throws', async () => {
    const badRequest = new Request('http://localhost', {
      method: 'POST',
      body: 'not-json',
    });

    const { default: handler } = await freshImport();
    const res = await handler(badRequest);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(typeof json.error).toBe('string');
  });
});
