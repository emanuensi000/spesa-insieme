import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
await import('./build.mjs');
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const types = { '.md':'text/plain; charset=utf-8','.sql':'text/plain; charset=utf-8','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png' };
const server = createServer(async (request,response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    let file = resolve(root,`.${pathname}`);
    if (!file.startsWith(root.endsWith(sep) ? root : `${root}${sep}`) && file !== resolve(root)) { response.writeHead(403); response.end(); return; }
    if ((await stat(file)).isDirectory()) file = resolve(file,'index.html');
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type':types[extname(file)] || 'application/octet-stream','Cache-Control':'no-cache','Referrer-Policy':'no-referrer' }); response.end(content);
  } catch { response.writeHead(404); response.end('Non trovato'); }
});
const port = Number(process.env.PORT || 4173);
server.listen(port,'127.0.0.1',()=>console.log(`Anteprima: http://127.0.0.1:${port}`));
