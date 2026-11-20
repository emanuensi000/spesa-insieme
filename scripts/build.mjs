import { cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = new URL('../dist/', import.meta.url);
const {version} = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error('Versione applicazione non valida.');
// Una nuova build deve eliminare anche i volantini rimossi dalle sorgenti.
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(new URL('../public/', import.meta.url), output, { recursive: true });
await mkdir(new URL('docs/', output), {recursive:true});
for (const [source,target] of [['RELEASE_NOTES.md','RELEASE_NOTES.md'],['DEPLOY_GITHUB.md','DEPLOY_GITHUB.md'],['REQUISITI.md','REQUISITI.md'],['docs/IMPLEMENTAZIONE.md','IMPLEMENTAZIONE.md'],['docs/LOGIN.md','LOGIN.md'],['supabase/migrations/001_organaizer.sql','001_organaizer.sql'],['supabase/migrations/002_shopping_history.sql','002_shopping_history.sql']]) await cp(new URL('../'+source,import.meta.url),new URL('docs/'+target,output));
const implementationPath=new URL('docs/IMPLEMENTAZIONE.md',output);
await writeFile(implementationPath,(await readFile(implementationPath,'utf8')).replace('../supabase/migrations/001_organaizer.sql','./001_organaizer.sql').replace('../supabase/migrations/002_shopping_history.sql','./002_shopping_history.sql'));
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

// Un solo SVG per header, favicon, icone installate e icona Apple.
const brandSvg = await readFile(new URL('icons/icon.svg',output));
for (const size of [192,512]) await sharp(brandSvg).resize(size,size).png().toFile(new URL(`icons/icon-${size}.png`,output).pathname);
await sharp(brandSvg).resize(512,512).flatten({background:'#244b3b'}).png().toFile(new URL('icons/icon-maskable-512.png',output).pathname);
await sharp(brandSvg).resize(180,180).flatten({background:'#244b3b'}).png().toFile(new URL('icons/apple-touch-icon.png',output).pathname);
const inputs = await Promise.all(['sw.js','pwa-update.js','app.js','core.js','shopping-history.js','shopping-groups.js','styles.css','index.html','shopping.html','organizer.js','organizer-core.js','backup.js','organizer.css','navigation.css','auth.js','auth-client.js','login.js','manifest.webmanifest','icons/icon.svg','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/apple-touch-icon.png','docs/RELEASE_NOTES.md','docs/DEPLOY_GITHUB.md','docs/REQUISITI.md','docs/IMPLEMENTAZIONE.md','docs/LOGIN.md','docs/001_organaizer.sql','docs/002_shopping_history.sql','config.js','data/offers.json','data/archived-offers.json'].map(name => readFile(new URL(name, output))));
const digest = createHash('sha256').update(version).update(Buffer.concat(inputs)).digest('hex').slice(0,12);
// Il footer identifica la stessa build della cache offline, senza richieste di rete.
for (const name of ['index.html','shopping.html']) {
  const path = new URL(name, output);
  const html = await readFile(path, 'utf8');
  await writeFile(path, html.replaceAll('__APP_VERSION__', version).replaceAll('__BUILD_ID__', digest));
}
const worker = await readFile(new URL('sw.js',output),'utf8');
const catalog = JSON.parse(await readFile(new URL('data/offers.json', output),'utf8'));
const archivedPhotos=JSON.parse(await readFile(new URL('data/archived-offers.json',output),'utf8'));
const offlineAssets = [...new Set([...(catalog.flyers || []).flatMap(flyer => [...(flyer.local_pages || []), ...(flyer.local_pdf ? [flyer.local_pdf] : [])]),...archivedPhotos.local_pages])];
if (offlineAssets.some(path => !/^\.\/flyers\/[a-z0-9-]+\/(?:page-\d{2}\.jpg|volantino\.pdf)$/.test(path))) throw new Error('Percorso del volantino locale non valido.');
await Promise.all(offlineAssets.map(path => readFile(new URL(path,output))));
await writeFile(new URL('sw.js',output),worker.replace('__BUILD_ID__',digest).replace('__FLYER_ASSETS__',JSON.stringify(offlineAssets)));
await writeFile(new URL('.nojekyll',output),'');
console.log(`Build pronta: ${root}dist${config.supabaseUrl ? ' · condivisione configurata' : ' · modalità locale'}`);
