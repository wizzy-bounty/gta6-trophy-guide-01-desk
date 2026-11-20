// Platinum Desk — local preview server (Node 22, standard library only).
// Serves this repository's app/ folder so the guide can be tried in a browser:
//   node serve.ts        then open http://localhost:8080
// It serves files only; the guide itself makes no network requests at run time.

import { readFileSync, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'app');
const port = Number(process.env.PORT ?? 8080);

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const rel = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  let file = join(root, rel === '/' ? 'index.html' : rel);
  if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Not found');
    return;
  }
  res.writeHead(200, { 'content-type': contentTypes[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
}).listen(port, () => {
  console.log('Platinum Desk preview at http://localhost:' + port);
});
