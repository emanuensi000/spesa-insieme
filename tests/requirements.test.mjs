import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateLocalBackup, makeLocalBackup, readBackupFile} from '../public/backup.js';
import {validateItem, cents, splitAmount, periodBounds, inPeriod, nextDate} from '../public/organizer-core.js';
import {createSecret, parseLink, cartEstimate, groupItems, safeSourceUrl, safeLocalFlyer, availableOffers, offerPrice} from '../public/core.js';
import {createReceipt, spendingSummary, validPhoto} from '../public/shopping-history.js';
import {worker} from './helpers/worker.mjs';

// Ogni ID accettato ha un'asserzione dedicata, senza credenziali o dati reali.
const check=(id,description,fn)=>test(`${id} — ${description}`,fn);
const group='11111111-1111-4111-8111-111111111111',item='22222222-2222-4222-8222-222222222222';
const backup=()=>({groups:[{id:group,name:'Casa',role:'member'}],snapshots:{[group]:{items:[{id:item,group_id:group,kind:'task',data:{title:'Pane'}}],members:[{id:'remote',role:'owner'}],invites:[{token:'untrusted'}]}},profile:{name:'Anna'},prefs:{period:'month',completed:true,quiet:false},active:group});
const change=fn=>{const value=backup();fn(value);return value;};
const invalid=fn=>assert.throws(()=>validateLocalBackup(change(fn)));
const data=value=>value.snapshots[group].items[0].data;
check('ROB-161','limite file verificato prima di leggerlo',async()=>{let read=false;await assert.rejects(readBackupFile({size:2_000_001,text(){read=true;}}),/2 MB/);assert.equal(read,false);});
check('ROB-162','JSON non leggibile rifiutato',async()=>{await assert.rejects(readBackupFile({size:4,text:async()=>'{bad'}),/JSON/);});
check('ROB-163','formato sconosciuto',()=>invalid(v=>v.format='other'));
check('ROB-164','schema sconosciuto',()=>invalid(v=>Object.assign(v,{format:'organaizer-local-backup',schemaVersion:99})));
check('ROB-165','export storici senza envelope',()=>assert.equal(validateLocalBackup(backup()).groups.length,1));
check('ROB-166','proprietà pericolose annidate',()=>{for(const key of ['__proto__','constructor','prototype'])invalid(v=>data(v).extra=JSON.parse(`{"nested":{"${key}":{}}}`));assert.equal({}.polluted,undefined);});
check('ROB-167','profondità massima',()=>invalid(v=>{let p=v.profile;for(let i=0;i<34;i++)p=p.child={};}));
check('ROB-168','gruppi duplicati',()=>invalid(v=>v.groups.push({...v.groups[0]})));
check('ROB-169','risorsa di gruppo non dichiarato',()=>invalid(v=>v.snapshots[group].items[0].group_id=item));
check('ROB-170','snapshot mancante',()=>invalid(v=>delete v.snapshots[group]));
check('ROB-171','risorsa duplicata',()=>invalid(v=>v.snapshots[group].items.push({...v.snapshots[group].items[0]})));
check('ROB-172','testi di tipo errato',()=>{for(const key of ['title','note','date','time','place','payer','category'])invalid(v=>data(v)[key]={bad:true});});
check('ROB-173','date impossibili',()=>{for(const date of ['2026-02-30','2026-13-01','2026-04-31'])invalid(v=>data(v).date=date);});
check('ROB-174','quote non intere o negative',()=>{for(const cents of [-1,.5,NaN])invalid(v=>data(v).shares=[{person:'Anna',cents}]);});
check('ROB-175','rimborsi strutturati',()=>{for(const refunds of [{},'bad',[{person:'',cents:1}]])invalid(v=>data(v).refunds=refunds);});
check('ROB-176','elementi riservati non importabili',()=>invalid(v=>{v.snapshots[group].items[0].kind='event';data(v).sensitive=true;}));
check('ROB-177','membro locale normalizzato',()=>assert.deepEqual(validateLocalBackup(backup()).snapshots[group].members,[{id:'local',name:'Anna',role:'owner'}]));
check('ROB-178','privilegi e inviti remoti ignorati',()=>{const v=validateLocalBackup(backup());assert.equal(v.groups[0].role,'owner');assert.deepEqual(v.snapshots[group].invites,[]);assert.equal(v.snapshots[group].items[0].author,'local');});
for(const [id,key] of [['FUN-362','format'],['FUN-363','exportedAt'],['FUN-364','groups'],['FUN-365','snapshots'],['FUN-366','profile'],['FUN-367','prefs']])check(id,`export conserva ${key}`,()=>{
 const source=backup(),result=makeLocalBackup(source);
 if(key==='format'){assert.equal(result.format,'organaizer-local-backup');assert.equal(result.schemaVersion,1);}
 else if(key==='exportedAt')assert.ok(Number.isFinite(Date.parse(result.exportedAt)));
 else assert.deepEqual(result[key],source[key]);
});
for(const [id,key] of [['FUN-372','groups'],['FUN-373','snapshots'],['FUN-374','profile'],['FUN-375','prefs'],['FUN-376','active']])check(id,`ripristino ${key}`,()=>{
 const result=validateLocalBackup(makeLocalBackup(backup()));
 if(key==='groups')assert.deepEqual(result.groups.map(g=>g.name),['Casa']);
 if(key==='snapshots')assert.equal(result.snapshots[group].items[0].data.title,'Pane');
 if(key==='profile')assert.equal(result.profile.name,'Anna');
 if(key==='prefs')assert.deepEqual(result.prefs,{period:'month',completed:true,quiet:false});
 if(key==='active'){assert.equal(result.active,group);assert.equal(validateLocalBackup({...backup(),active:'missing'}).active,group);}
});
check('ROB-181','titoli vuoti',()=>{for(const title of ['','   ','\n'])assert.throws(()=>validateItem('task',{title}));});
check('ROB-182','limite titoli e tipi',()=>{assert.throws(()=>validateItem('task',{title:'a'.repeat(161)}));assert.throws(()=>validateItem('task',{title:42}));assert.equal(validateItem('task',{title:'a'.repeat(160)}).title.length,160);});
check('ROB-187','importi negativi',()=>{assert.throws(()=>cents('-1'));assert.throws(()=>validateItem('expense',{title:'Luce',amount:-1}));});
check('ROB-188','massimo due decimali',()=>{for(const value of ['1.001','1,234'])assert.throws(()=>cents(value));});
check('ROB-189','centesimi interi',()=>{assert.equal(cents('0,29'),29);assert.equal(cents('123.45'),12345);});
check('ROB-190','somma quote',()=>{assert.throws(()=>validateItem('expense',{title:'Luce',amount:100,shares:[{person:'Anna',cents:99}]}));assert.equal(splitAmount(100,['A','B','C']).reduce((s,q)=>s+q.cents,0),100);});
check('ROB-191','URL eseguibili',()=>{for(const url of ['javascript:alert(1)','data:text/html,evil','http://ipertriscount.it'])assert.equal(safeSourceUrl(url),null);});
check('ROB-192','origini fonti consentite',()=>{assert.equal(safeSourceUrl('https://ipertriscount.it.evil.org'),null);assert.equal(safeSourceUrl('https://user:password@ipertriscount.it'),null);assert.ok(safeSourceUrl('https://www.ipertriscount.it/volantini'));});
check('ROB-193','percorsi immagini locali',()=>{for(const path of ['../config.js','./flyers/../../config.js','https://evil.org/page-01.jpg'])assert.equal(safeLocalFlyer(path),null);assert.ok(safeLocalFlyer('./flyers/test/page-01.jpg'));});
const photo={path:'./flyers/test/page-01.jpg',region:[.1,.1,.2,.2]};
check('ROB-194','ritagli entro pagina',()=>{assert.equal(validPhoto({...photo,region:[.9,0,.2,.2]}),null);assert.equal(validPhoto({...photo,region:[0,.9,.2,.2]}),null);});
check('ROB-195','ritagli con area positiva',()=>{for(const region of [[0,0,0,1],[0,0,1,-1],[0,0,NaN,1]])assert.equal(validPhoto({...photo,region}),null);});
check('ROB-200','sconto senza prezzo',()=>{assert.equal(offerPrice({price:null,discount_percent:20}),'−20%');assert.equal(offerPrice({price:null}),'Prezzo non indicato');});
const products=[{id:'a',name:'Pane',quantity:'1 kg',note:'Integrale',price:.1,checked:true},{id:'b',name:'Pane',quantity:'1 kg',note:'Integrale',price:.1,checked:true},{id:'c',name:'Sale',price:.2,checked:false},{id:'d',name:'Extra',price:null,checked:true}];
const receipt=(extra={})=>createReceipt({id:'list',name:'Spesa',items:products,amount:'2,00',date:'2026-01-15',photoFor:()=>photo,...extra});
check('FUN-286','unità equivalenti raggruppate',()=>{const groups=groupItems(products);assert.equal(groups[0].length,2);assert.equal(groups.length,3);});
check('FUN-295','stima totale',()=>assert.equal(cartEstimate(products).total,.4));
check('FUN-296','acquistati e rimanenti',()=>{const e=cartEstimate(products);assert.equal(e.checked,.2);assert.equal(e.remaining,.2);});
check('FUN-297','senza prezzo esclusi',()=>{assert.equal(cartEstimate(products).unpriced,1);assert.equal(cartEstimate([{price:null}]).total,0);});
const offers=[{valid_from:'2026-01-01',valid_until:'2026-01-15'},{valid_from:'2026-01-16',valid_until:'2026-02-01'},{valid_from:'2025-01-01',valid_until:'2025-12-31'}];
check('FUN-306','offerte oggi',()=>assert.deepEqual(availableOffers(offers,'today','2026-01-15'),[offers[0]]));
check('FUN-307','offerte in corso e future',()=>assert.deepEqual(availableOffers(offers,'available','2026-01-15'),offers.slice(0,2)));
check('FUN-308','scadute solo con filtro esplicito',()=>assert.deepEqual(availableOffers(offers,'all','2026-01-15'),offers));
check('FUN-311','prezzo per unità',()=>{assert.match(offerPrice({price:2,size:'al kg'}),/\/ kg/);assert.match(offerPrice({price:2,size:'100 g'}),/\/ 100 g/);});
check('FUN-313','solo sconto percentuale',()=>assert.equal(offerPrice({discount_percent:10}),'−10%'));
check('FUN-336','foto conservata nello snapshot',()=>{const saved=receipt();assert.deepEqual(saved.items[0].photo,photo);assert.notEqual(saved.items[0].photo.region,photo.region);});
check('FUN-346','non acquistati conservati',()=>{const saved=receipt();assert.ok(saved.items.some(i=>i.name==='Sale'&&!i.checked));});
check('FUN-348','quantità e prezzi storici',()=>{const saved=receipt();assert.equal(saved.items[0].quantity,'1 kg');assert.equal(saved.items[0].price,.1);});
check('FUN-349','foto scontrino',()=>assert.deepEqual(receipt().items[0].photo,photo));
// I valori statistici sotto sono verificati anche nel Profilo dai test browser.
for(const [id,key,expected] of [['FUN-353','total',200],['FUN-354','count',1],['FUN-355','average',200],['FUN-356','months',6]])check(id,`statistiche ${key}`,()=>{const s=spendingSummary([receipt()],'2026-01');assert.equal(key==='months'?s.months.length:s[key],expected);});
check('FUN-358','totale pagato distinto dalla stima',()=>{const saved=receipt();assert.equal(saved.amount_cents,200);assert.equal(saved.estimate_cents,20);});
check('ROB-041','token casuali crittografici',()=>{const a=createSecret(),b=createSecret();assert.match(a,/^[0-9a-f]{64}$/);assert.notEqual(a,b);});
check('ROB-042','token da 32 byte',async()=>{const source=await readFile(new URL('../public/core.js',import.meta.url),'utf8');assert.match(source,/crypto.getRandomValues\(new Uint8Array\(32\)\)/);assert.equal(Buffer.from(createSecret(),'hex').length,32);});
check('ROB-046','identificativo lista',()=>{for(const id of ['','invalid','../../etc/passwd'])assert.throws(()=>parseLink('#list='+id+'&key='+'a'.repeat(64)));});
check('ROB-047','formato token',()=>{for(const key of ['a'.repeat(63),'g'.repeat(64),'a'.repeat(65)])assert.throws(()=>parseLink('#list='+group+'&key='+key));});
for(const [id,path,options] of [
 ['ROB-146','unknown.json',{}],['ROB-147','?invite=secret',{navigate:true}],['ROB-148','app.js?secret=value',{}],
 ['ROB-149','https://project.supabase.co/rest/v1/rpc/test',{}],['ROB-150','app.js',{headers:{Authorization:'Bearer secret'}}]
])check(id,'richiesta riservata o non statica esclusa dalla cache',async()=>{const w=await worker();await w.get(path,options);assert.deepEqual(w.writes,[]);});
for(const [id,options] of [['ROB-151',{cacheControl:'private'}],['ROB-152',{cacheControl:'no-store'}],['ROB-153',{redirected:true}]])check(id,'risposta privata o redirect esclusa',async()=>{const w=await worker(options);await w.get('app.js');assert.deepEqual(w.writes,[]);});
check('ROB-154','cache della build prevale sulla rete',async()=>{const w=await worker();await w.get('app.js');await w.get('app.js');assert.equal(w.requests.length,1);assert.equal(w.writes.length,1);});
for(const [id,path,shell] of [['ROB-155','?code=secret','index.html'],['ROB-156','shopping.html?group=secret','shopping.html']])check(id,'fallback offline nella pagina corretta',async()=>{const saved={shell};const w=await worker({offline:true,entries:[['https://example.github.io/spesa-insieme/'+shell,saved]]});assert.equal(await w.get(path,{navigate:true}),saved);});
check('ROB-252','limite gruppi backup',()=>invalid(v=>{v.groups=Array.from({length:101},()=>v.groups[0]);}));
check('ROB-253','limite risorse backup',()=>invalid(v=>{v.snapshots[group].items=Array.from({length:5001},()=>v.snapshots[group].items[0]);}));
const workflow=await readFile(new URL('../.github/workflows/pages.yml',import.meta.url),'utf8');
for(const [id,pattern] of [['ROB-261',/run: npm test/],['ROB-262',/run: python -m unittest/],['ROB-263',/run: npm run build/],['ROB-264',/needs: build/],['ROB-265',/run: npm ci/]])check(id,'controllo obbligatorio pipeline',()=>assert.match(workflow,pattern));
check('ROB-266','versioni pacchetto allineate',async()=>{const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url))),lock=JSON.parse(await readFile(new URL('../package-lock.json',import.meta.url)));assert.equal(pkg.version,lock.version);assert.equal(pkg.version,lock.packages[''].version);});
check('ROB-267','funzioni pure senza credenziali',()=>{assert.deepEqual(periodBounds('day','2026-01-01'),['2026-01-01','2026-01-01']);assert.equal(nextDate('2026-01-01','weekly'),'2026-01-08');});
check('ROB-268','RPC su PostgreSQL con ruoli realistici',async()=>{const source=await readFile(new URL('./database.test.mjs',import.meta.url),'utf8');assert.match(source,/new PGlite/);assert.match(source,/create role anon;create role authenticated/);assert.match(source,/await db.exec\(sql\);await db.exec\(sql\)/);});
check('ROB-280','matrice tracciabile con 102 requisiti originari e un nuovo ID',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../docs/accettazione-0.3.2.json',import.meta.url),'utf8'));
 const catalog=await readFile(new URL('../docs/REQUISITI_1000.md',import.meta.url),'utf8');
 const extra=await readFile(new URL('../docs/REQUISITI_SUCCESSIVI.md',import.meta.url),'utf8');
 const report=await readFile(new URL('../docs/ACCETTAZIONE_0.3.2.md',import.meta.url),'utf8');
 assert.equal(manifest.requirements.length,103);assert.equal(new Set(manifest.requirements.map(r=>r.id)).size,103);
 assert.equal(manifest.requirements.filter(r=>r.id!=='FUN-401').length,102);
 assert.equal([...catalog.matchAll(/^- \[[ x]\] \*\*/gm)].length,1000);
 for(const row of manifest.requirements){
  assert.ok((row.id==='FUN-401'?extra:catalog).includes(`- [x] **${row.id}**`));
  assert.ok(report.includes(`| ${row.id} |`));assert.ok(row.tests.length);
  for(const path of row.tests){
   assert.match(path,/^tests\/[a-z/.-]+\.mjs$/);
   assert.ok((await readFile(new URL('../'+path,import.meta.url),'utf8')).includes(row.id));
  }
 }
});
