import { fileURLToPath } from 'node:url';
import { readFile, stat } from 'node:fs/promises';
import contactMail from './server/contact-mail.mjs';
import { extname, join, resolve, sep } from 'node:path';
import { createServer as createHttpServer } from 'node:http';
import { createNotionRealisationsService } from './server/notion-realisations.mjs';

const ROOT_DIR = fileURLToPath(new URL('.', import.meta.url));
const CONTACT_PATH = '/api/contact';
const REALISATIONS_PATH = '/api/realisations';
const MAX_BODY_BYTES = 15 * 1024 * 1024;
const DEFAULT_PORT = 3000;
const HOST = '0.0.0.0';

const ONE_DAY = 'public, max-age=86400';
const ONE_YEAR_IMMUTABLE = 'public, max-age=31536000, immutable';

const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

class PayloadTooLargeError extends Error {}

export function cacheControlFor(urlPath) {
  if (urlPath.startsWith('/assets/')) return ONE_YEAR_IMMUTABLE;
  if (urlPath.endsWith('.css') || urlPath.endsWith('.js')) return ONE_DAY;
  return null;
}

export function contentTypeFor(filePath) {
  return CONTENT_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
}

export function resolveStaticPath(distDir, urlPath) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  const relativePath = decodedPath.endsWith('/') ? `${decodedPath}index.html` : decodedPath;
  const filePath = resolve(join(distDir, relativePath));
  return filePath.startsWith(distDir + sep) ? filePath : null;
}

async function readFileIfExists(filePath) {
  try {
    const fileStat = await stat(filePath);
    return fileStat.isFile() ? await readFile(filePath) : null;
  } catch {
    return null;
  }
}

function sendResponse(res, statusCode, headers, body) {
  res.writeHead(statusCode, { ...SECURITY_HEADERS, ...headers });
  res.end(body);
}

function sendText(res, statusCode, message) {
  sendResponse(res, statusCode, { 'Content-Type': 'text/plain; charset=utf-8' }, message);
}

async function serveStatic(req, res, distDir) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendText(res, 405, 'Method Not Allowed');
  }
  const { pathname } = new URL(req.url, 'http://localhost');
  const filePath = resolveStaticPath(distDir, pathname);
  const content = filePath ? await readFileIfExists(filePath) : null;
  if (!content) return sendText(res, 404, 'Not Found');

  const headers = { 'Content-Type': contentTypeFor(filePath), 'Content-Length': content.length };
  const cacheControl = cacheControlFor(pathname);
  if (cacheControl) headers['Cache-Control'] = cacheControl;
  return sendResponse(res, 200, headers, req.method === 'HEAD' ? null : content);
}

async function readBody(req) {
  if (Number(req.headers['content-length']) > MAX_BODY_BYTES) throw new PayloadTooLargeError();
  const chunks = [];
  let received = 0;
  for await (const chunk of req) {
    received += chunk.length;
    if (received > MAX_BODY_BYTES) throw new PayloadTooLargeError();
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function handleContact(req, res, contactHandler) {
  if (req.method !== 'POST') return sendText(res, 405, 'Method Not Allowed');
  let body;
  try {
    body = await readBody(req);
  } catch (error) {
    if (!(error instanceof PayloadTooLargeError)) throw error;
    res.setHeader('Connection', 'close');
    return sendText(res, 413, 'Payload Too Large');
  }
  const request = new Request(`http://localhost${CONTACT_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': req.headers['content-type'] ?? 'application/json' },
    body,
  });
  const response = await contactHandler(request);
  const headers = { 'Content-Type': response.headers.get('content-type') ?? 'application/json' };
  return sendResponse(res, response.status, headers, Buffer.from(await response.arrayBuffer()));
}

async function handleRealisations(req, res, notionService) {
  if (req.method !== 'GET') return sendText(res, 405, 'Method Not Allowed');
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  };
  try {
    const { realisations } = await notionService.getRealisations();
    return sendResponse(res, 200, headers, JSON.stringify({ realisations }));
  } catch {
    return sendResponse(res, 503, headers, JSON.stringify({ error: 'Notion CMS unavailable' }));
  }
}

export function createRequestHandler({
  distDir = join(ROOT_DIR, 'dist'),
  contactHandler = contactMail,
  notionService = createNotionRealisationsService(),
} = {}) {
  const rootDir = resolve(distDir);
  return async (req, res) => {
    try {
      if (req.headers.host === 'www.ester-sas.fr') {
        return sendResponse(res, 308, { Location: `https://ester-sas.fr${req.url}` }, null);
      }
      const { pathname } = new URL(req.url, 'http://localhost');
      if (pathname === CONTACT_PATH) return await handleContact(req, res, contactHandler);
      if (pathname === REALISATIONS_PATH) return await handleRealisations(req, res, notionService);
      return await serveStatic(req, res, rootDir);
    } catch (error) {
      console.error('[server] Unhandled error:', error);
      return sendText(res, 500, 'Internal Server Error');
    }
  };
}

export function createServer(options) {
  return createHttpServer(createRequestHandler(options));
}

export function listen(env = process.env) {
  const port = Number(env.PORT) || DEFAULT_PORT;
  return createServer().listen(port, HOST, () => console.log(`[server] Listening on ${HOST}:${port}`));
}

export function startIfEntryPoint(entryPath, moduleUrl, start = listen) {
  if (entryPath !== fileURLToPath(moduleUrl)) return false;
  start();
  return true;
}

startIfEntryPoint(process.argv[1], import.meta.url);
