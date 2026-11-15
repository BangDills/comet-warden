import { createServer } from 'node:http';
import { existsSync, lstatSync, readFileSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const PORT = 8080;
const ROOT = resolve(import.meta.dirname, 'game');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith('/')) {
    pathname += 'index.html';
  }

  const filePath = resolve(join(ROOT, normalize(pathname)));

  // Prevent path traversal outside ROOT
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  if (!existsSync(filePath) || !lstatSync(filePath).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }

  const ext = extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';
  const fileBytes = readFileSync(filePath);

  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': fileBytes.length,
    'Cache-Control': 'no-cache',
  });
  res.end(fileBytes);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Comet Warden local server active at http://localhost:${PORT}`);
});
