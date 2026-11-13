import { cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = new URL('../dist/', import.meta.url);
// Una nuova build deve eliminare anche i volantini rimossi dalle sorgenti.
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(new URL('../public/', import.meta.url), output, { recursive: true });
await mkdir(new URL('docs/', output), {recursive:true});
for (const [source,target] of [['REQUISITI.md','REQUISITI.md'],['docs/IMPLEMENTAZIONE.md','IMPLEMENTAZIONE.md'],['docs/LOGIN.md','LOGIN.md'],['supabase/migrations/001_organaizer.sql','001_organaizer.sql']]) await cp(new URL('../'+source,import.meta.url),new URL('docs/'+target,output));
const implementationPath=new URL('docs/IMPLEMENTAZIONE.md',output);
await writeFile(implementationPath,(await readFile(implementationPath,'utf8')).replace('../supabase/migrations/001_organaizer.sql','./001_organaizer.sql'));
const requirementsPath=new URL('docs/REQUISITI.md',output);
await writeFile(requirementsPath,(await readFile(requirementsPath,'utf8')).replace('docs/REQUISITI_SPESA.md','./REQUISITI_SPESA.md').replace('docs/IMPLEMENTAZIONE.md','./IMPLEMENTAZIONE.md'));
await cp(new URL('../docs/REQUISITI_SPESA.md',import.meta.url),new URL('docs/REQUISITI_SPESA.md',output));
let config = {};
try { config = JSON.parse(await readFile(new URL('../config.public.json', import.meta.url), 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
try { config = { ...config, ...JSON.parse(await readFile(new URL('../config.local.json', import.meta.url), 'utf8')) }; }
catch (error) { if (error.code !== 'ENOENT') throw error; }
config = { supabaseUrl: process.env.SUPABASE_URL || config.supabaseUrl || '', supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || config.supabasePublishableKey || '' };
if (Boolean(config.supabaseUrl) !== Boolean(config.supabasePublishableKey)) throw new Error('Fornisci sia SUPABASE_URL sia SUPABASE_PUBLISHABLE_KEY.');
if (config.supabaseUrl && !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(config.supabaseUrl)) throw new Error('SUPABASE_URL deve essere l’URL HTTPS del progetto Supabase.');
if (config.supabasePublishableKey) {
  if (config.supabasePublishableKey.startsWith('sb_secret_')) throw new Error('Non usare chiavi segrete nella PWA.');
  if (config.supabasePublishableKey.startsWith('eyJ')) {
    const payload = JSON.parse(Buffer.from(config.supabasePublishableKey.split('.')[1], 'base64url').toString());
    if (payload.role !== 'anon') throw new Error('Nel frontend è consentita soltanto la chiave anon/public.');
  } else if (!config.supabasePublishableKey.startsWith('sb_publishable_')) throw new Error('Chiave pubblica Supabase non riconosciuta.');
}
await writeFile(new URL('config.js', output), `export default ${JSON.stringify(config)};\n`);

// Icone PNG senza dipendenze o strumenti esterni.
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, bytes) {
  const name = Buffer.from(type), length = Buffer.alloc(4), crc = Buffer.alloc(4);
  length.writeUInt32BE(bytes.length); crc.writeUInt32BE(crc32(Buffer.concat([name, bytes])));
  return Buffer.concat([length, name, bytes, crc]);
}
function icon(size) {
  const scan = Buffer.alloc(size * (1 + size * 4));
  const lines = [[.30,.31,.43,.31],[.30,.31,.30,.44],[.43,.31,.43,.44],[.30,.44,.43,.44],[.57,.31,.70,.31],[.57,.31,.57,.44],[.70,.31,.70,.44],[.57,.44,.70,.44],[.30,.57,.43,.57],[.30,.57,.30,.70],[.43,.57,.43,.70],[.30,.70,.43,.70],[.55,.64,.61,.70],[.61,.70,.73,.56]];
  function distance(x,y,ax,ay,bx,by) { const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy))); return Math.hypot(x-ax-t*dx,y-ay-t*dy); }
  for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
    const nx=x/size,ny=y/size, offset=y*(1+size*4)+1+x*4;
    const light=lines.some(l=>distance(nx,ny,...l)<.024);
    scan.set(light?[243,244,220,255]:[51,79,61,255],offset);
  }
  const header=Buffer.alloc(13);header.writeUInt32BE(size);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(scan)),chunk('IEND',Buffer.alloc(0))]);
}
for (const size of [192,512]) await writeFile(new URL(`icons/icon-${size}.png`,output),icon(size));
const inputs = await Promise.all(['app.js','core.js','styles.css','index.html','shopping.html','organizer.js','organizer-core.js','organizer.css','navigation.css','auth.js','auth-client.js','login.js','manifest.webmanifest','docs/REQUISITI.md','docs/IMPLEMENTAZIONE.md','docs/LOGIN.md','docs/001_organaizer.sql','config.js','data/offers.json'].map(name => readFile(new URL(name, output))));
const digest = createHash('sha256').update(Buffer.concat(inputs)).digest('hex').slice(0,12);
const worker = await readFile(new URL('sw.js',output),'utf8');
const catalog = JSON.parse(await readFile(new URL('data/offers.json', output),'utf8'));
const offlineAssets = (catalog.flyers || []).flatMap(flyer => [...(flyer.local_pages || []), ...(flyer.local_pdf ? [flyer.local_pdf] : [])]);
if (offlineAssets.some(path => !/^\.\/flyers\/[a-z0-9-]+\/(?:page-\d{2}\.jpg|volantino\.pdf)$/.test(path))) throw new Error('Percorso del volantino locale non valido.');
await Promise.all(offlineAssets.map(path => readFile(new URL(path,output))));
await writeFile(new URL('sw.js',output),worker.replace('__BUILD_ID__',digest).replace('__FLYER_ASSETS__',JSON.stringify(offlineAssets)));
await writeFile(new URL('.nojekyll',output),'');
console.log(`Build pronta: ${root}dist${config.supabaseUrl ? ' · condivisione configurata' : ' · modalità locale'}`);
