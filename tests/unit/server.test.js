// @vitest-environment node
import { afterEach, beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import {
  cacheControlFor,
  contentTypeFor,
  createRequestHandler,
  createServer,
  listen,
  resolveStaticPath,
  startIfEntryPoint,
} from '../../server.mjs';

const FORM_PATH = '/api/contact';
const MAX_BODY_BYTES = 15 * 1024 * 1024;

let distDir;
let server;
let baseUrl;
let contactHandler;

function listenOnRandomPort(httpServer) {
  return new Promise((resolveListen) => {
    httpServer.listen(0, '127.0.0.1', () => resolveListen(`http://127.0.0.1:${httpServer.address().port}`));
  });
}

function closeServer(httpServer) {
  return new Promise((resolveClose) => {
    httpServer.closeAllConnections();
    httpServer.close(resolveClose);
  });
}

function rawGet(path) {
  return new Promise((resolveGet, rejectGet) => {
    const url = new URL(baseUrl);
    const req = httpRequest({ host: url.hostname, port: url.port, path, method: 'GET' }, (res) => {
      res.resume();
      res.on('end', () => resolveGet(res.statusCode));
    });
    req.on('error', rejectGet);
    req.end();
  });
}

beforeAll(async () => {
  distDir = mkdtempSync(join(tmpdir(), 'ester-dist-'));
  mkdirSync(join(distDir, 'assets'));
  mkdirSync(join(distDir, 'folder'));
  writeFileSync(join(distDir, 'index.html'), '<h1>home</h1>');
  writeFileSync(join(distDir, 'style.css'), 'body{}');
  writeFileSync(join(distDir, 'app.js'), 'console.log(1)');
  writeFileSync(join(distDir, 'robots.txt'), 'User-agent: *');
  writeFileSync(join(distDir, 'blob.unknown'), 'x');
  writeFileSync(join(distDir, 'assets', 'logo-abc.png'), 'png');
  writeFileSync(join(distDir, 'folder', 'index.html'), '<h1>folder</h1>');
  writeFileSync(join(distDir, '..', `${distDir.split('/').pop()}-secret.txt`), 'secret');

  contactHandler = vi.fn(async () => Response.json({ ok: true }));
  server = createServer({ distDir, contactHandler });
  baseUrl = await listenOnRandomPort(server);
});

afterAll(async () => {
  await closeServer(server);
  rmSync(distDir, { recursive: true, force: true });
  rmSync(`${distDir}-secret.txt`, { force: true });
});

afterEach(() => {
  contactHandler.mockClear();
  vi.restoreAllMocks();
});

describe('static serving', () => {
  it('serves index.html for / with security headers and no cache header', async () => {
    const res = await fetch(`${baseUrl}/`);

    expect(res.status).toBe(200);
    expect(await res.text()).toBe('<h1>home</h1>');
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(res.headers.get('cache-control')).toBeNull();
    expect(res.headers.get('x-frame-options')).toBe('DENY');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(res.headers.get('permissions-policy')).toBe('camera=(), microphone=(), geolocation=()');
  });

  it('serves nested index.html for directory paths ending with a slash', async () => {
    const res = await fetch(`${baseUrl}/folder/`);

    expect(await res.text()).toBe('<h1>folder</h1>');
  });

  it('caches css and js for one day', async () => {
    const css = await fetch(`${baseUrl}/style.css`);
    const js = await fetch(`${baseUrl}/app.js`);

    expect(css.headers.get('content-type')).toBe('text/css; charset=utf-8');
    expect(css.headers.get('cache-control')).toBe('public, max-age=86400');
    expect(js.headers.get('content-type')).toBe('text/javascript; charset=utf-8');
    expect(js.headers.get('cache-control')).toBe('public, max-age=86400');
  });

  it('caches /assets/* as immutable for one year', async () => {
    const res = await fetch(`${baseUrl}/assets/logo-abc.png`);

    expect(res.headers.get('content-type')).toBe('image/png');
    expect(res.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
  });

  it('falls back to octet-stream for unknown extensions', async () => {
    const res = await fetch(`${baseUrl}/blob.unknown`);

    expect(res.headers.get('content-type')).toBe('application/octet-stream');
  });

  it('answers HEAD without a body', async () => {
    const res = await fetch(`${baseUrl}/robots.txt`, { method: 'HEAD' });

    expect(res.status).toBe(200);
    expect(res.headers.get('content-length')).toBe('13');
    expect(await res.text()).toBe('');
  });

  it('returns 404 for missing files and directories without index', async () => {
    expect((await fetch(`${baseUrl}/missing.html`)).status).toBe(404);
    expect((await fetch(`${baseUrl}/assets`)).status).toBe(404);
  });

  it('returns 404 for path traversal attempts', async () => {
    const secretName = `${distDir.split('/').pop()}-secret.txt`;

    expect(await rawGet(`/../${secretName}`)).toBe(404);
    expect(await rawGet(`/%2e%2e/${secretName}`)).toBe(404);
  });

  it('returns 404 for malformed percent-encoding and null bytes', async () => {
    expect(await rawGet('/%E0%A4%A')).toBe(404);
    expect(await rawGet('/index.html%00')).toBe(404);
  });

  it('rejects unsupported methods with 405', async () => {
    const res = await fetch(`${baseUrl}/`, { method: 'DELETE' });

    expect(res.status).toBe(405);
  });
});

describe('contact route', () => {
  it('adapts the Node request to a Web Request and relays the Response', async () => {
    contactHandler.mockImplementationOnce(async (request) => {
      const payload = await request.json();
      return Response.json({ received: payload.data.nom }, { status: 201 });
    });

    const res = await fetch(`${baseUrl}${FORM_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { nom: 'Moreau' } }),
    });

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ received: 'Moreau' });
    expect(res.headers.get('x-frame-options')).toBe('DENY');
    const [request] = contactHandler.mock.calls[0];
    expect(request.method).toBe('POST');
    expect(request.headers.get('content-type')).toBe('application/json');
  });

  it('defaults the content type to JSON and the response type when absent', async () => {
    contactHandler.mockImplementationOnce(async (request) => {
      const response = new Response(request.headers.get('content-type'), { status: 200 });
      response.headers.delete('content-type');
      return response;
    });

    const res = await fetch(`${baseUrl}${FORM_PATH}`, { method: 'POST', body: Buffer.from('{}') });

    expect(await res.text()).toBe('application/json');
    expect(res.headers.get('content-type')).toBe('application/json');
  });

  it('accepts bodies close to the 15 MB limit', async () => {
    const res = await fetch(`${baseUrl}${FORM_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { cv_base64: 'a'.repeat(MAX_BODY_BYTES - 1024) } }),
    });

    expect(res.status).toBe(200);
  });

  it('rejects bodies above the limit with 413 based on content-length', async () => {
    const handler = createRequestHandler({ distDir, contactHandler });
    const req = { method: 'POST', url: FORM_PATH, headers: { 'content-length': String(MAX_BODY_BYTES + 1) } };
    const res = { setHeader: vi.fn(), writeHead: vi.fn(), end: vi.fn() };

    await handler(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(413, expect.any(Object));
    expect(res.setHeader).toHaveBeenCalledWith('Connection', 'close');
    expect(contactHandler).not.toHaveBeenCalled();
  });

  it('rejects oversized chunked bodies with 413', async () => {
    const chunk = Buffer.alloc(1024 * 1024);
    let sent = 0;
    const body = new ReadableStream({
      pull(controller) {
        sent += 1;
        controller.enqueue(chunk);
        if (sent === 16) controller.close();
      },
    });

    const outcome = await fetch(`${baseUrl}${FORM_PATH}`, { method: 'POST', body, duplex: 'half' })
      .then((res) => res.status)
      .catch(() => 'connection-closed');

    expect([413, 'connection-closed']).toContain(outcome);
    expect(contactHandler).not.toHaveBeenCalled();
  });

  it('rejects non-POST methods with 405', async () => {
    const res = await fetch(`${baseUrl}${FORM_PATH}`);

    expect(res.status).toBe(405);
  });

  it('returns 500 when the handler throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    contactHandler.mockRejectedValueOnce(new Error('boom'));

    const res = await fetch(`${baseUrl}${FORM_PATH}`, { method: 'POST', body: '{}' });

    expect(res.status).toBe(500);
    expect(await res.text()).toBe('Internal Server Error');
  });

  it('rethrows unexpected body read errors as 500', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const handler = createRequestHandler({ distDir, contactHandler });
    const brokenStream = {
      method: 'POST',
      url: FORM_PATH,
      headers: {},
      async *[Symbol.asyncIterator]() {
        throw new Error('stream failure');
      },
    };
    const res = { writeHead: vi.fn(), end: vi.fn() };

    await handler(brokenStream, res);

    expect(res.writeHead).toHaveBeenCalledWith(500, expect.any(Object));
  });
});

describe('default handler wiring', () => {
  it('uses the real contact-mail handler and dist folder by default', async () => {
    const defaultServer = createServer();
    const url = await listenOnRandomPort(defaultServer);
    const originalEnv = { ...process.env };
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_TO_EMAIL;
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await fetch(`${url}${FORM_PATH}`, { method: 'POST', body: JSON.stringify({ data: {} }) });
    const missing = await fetch(`${url}/definitely-missing`);

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Missing env vars' });
    expect(missing.status).toBe(404);
    process.env = originalEnv;
    await closeServer(defaultServer);
  });
});

describe('helpers', () => {
  it('cacheControlFor returns null for other files', () => {
    expect(cacheControlFor('/index.html')).toBeNull();
  });

  it('contentTypeFor is case-insensitive', () => {
    expect(contentTypeFor('/A.PNG')).toBe('image/png');
  });

  it('resolveStaticPath stays inside dist', () => {
    const root = resolve('/tmp/dist');

    expect(resolveStaticPath(root, '/a.css')).toBe(join(root, 'a.css'));
    expect(resolveStaticPath(root, '/../x')).toBeNull();
    expect(resolveStaticPath(root, '/%zz')).toBeNull();
  });

  it('listen binds to PORT when set and to 3000 otherwise', async () => {
    const withPort = listen({ PORT: '0' });
    await new Promise((resolveListening) => withPort.once('listening', resolveListening));
    expect(withPort.address().address).toBe('0.0.0.0');
    await closeServer(withPort);

    vi.spyOn(console, 'log').mockImplementation(() => {});
    const defaultPort = listen({});
    await new Promise((resolveListening) => defaultPort.once('listening', resolveListening));
    expect(defaultPort.address().port).toBe(3000);
    await closeServer(defaultPort);
  });

  it('startIfEntryPoint starts only when the module is the entry point', () => {
    const start = vi.fn();
    const moduleUrl = new URL('../../server.mjs', import.meta.url).href;

    expect(startIfEntryPoint('/other/entry.js', moduleUrl, start)).toBe(false);
    expect(start).not.toHaveBeenCalled();
    expect(startIfEntryPoint(fileURLToPath(moduleUrl), moduleUrl, start)).toBe(true);
    expect(start).toHaveBeenCalledOnce();
  });
});
