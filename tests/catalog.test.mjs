import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {activeOffers} from '../public/core.js';
const catalog=JSON.parse(await readFile(new URL('../public/data/offers.json',import.meta.url),'utf8'));
test('il catalogo Al costo copre le 20 pagine e le offerte Iper Day del solo 23 novembre',()=>{
  assert.equal(catalog.store_group,'Casal Bertone - Fonte Nuova - Guidonia');
  assert.equal(catalog.flyers[0].id,'20001');
  assert.equal(catalog.flyers[0].url,'https://www.ipertriscount.it/volantini/20001-al-costo-2');
  assert.equal(catalog.offers.length,577);
  assert.deepEqual([...new Set(catalog.offers.map(o=>o.page))].sort((a,b)=>a-b),Array.from({length:20},(_,i)=>i+1));
  assert.equal(catalog.reviewed_pages.length,20);
  const special=catalog.offers.filter(o=>o.valid_from==='2026-11-23');
  assert.equal(special.length,8);
  assert.ok(special.every(o=>o.conditions.includes('Fidelity Card')&&o.conditions.includes('Solo lunedì 23 novembre')));
  assert.equal(activeOffers(catalog.offers,'2026-11-12').length,0);
  assert.equal(activeOffers(catalog.offers,'2026-11-13').length,569);
  assert.equal(activeOffers(catalog.offers,'2026-11-22').length,569);
  assert.equal(activeOffers(catalog.offers,'2026-11-23').length,577);
  assert.equal(activeOffers(catalog.offers,'2026-11-24').length,0);
  assert.ok(catalog.offers.every(o=>o.price>0&&o.valid_until==='2026-11-23'&&o.flyer_url===catalog.flyers[0].url&&o.store_group===catalog.store_group));
  assert.equal(catalog.offers.find(o=>o.brand==='La Molisana').price,0.75);
  assert.equal(catalog.offers.find(o=>o.name==='Petto di pollo a fette pacco famiglia').price,7.99);
  assert.equal(catalog.offers.find(o=>o.name==='Culatta nazionale').size,'200 g');
  assert.equal(new Set(catalog.offers.map(o=>o.id)).size,catalog.offers.length);
});
test('PDF e tutte le pagine archiviate corrispondono ai checksum dichiarati',async()=>{
  const folder=new URL('../public/flyers/20001-20261112/',import.meta.url);
  const manifest=JSON.parse(await readFile(new URL('source.json',folder),'utf8'));
  assert.equal(manifest.files.length,21);
  assert.equal(manifest.url,catalog.flyers[0].url);
  assert.match(manifest.pdf_note,/assemblato localmente/);
  for(const file of manifest.files){
    const bytes=await readFile(new URL(file.name,folder));
    assert.equal(bytes.length,file.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);
    assert.ok(bytes.subarray(0,4).toString().startsWith('%PDF')||bytes.subarray(0,2).equals(Buffer.from([255,216])));
  }
  const pdf=await readFile(new URL('volantino.pdf',folder));
  assert.equal((pdf.toString('latin1').match(/\/Type \/Page\b/g)||[]).length,20);
  assert.match(pdf.toString('latin1'),/\/Type \/Pages \/Kids \[.*\] \/Count 20/);
  for(const file of manifest.files.filter(f=>f.name.endsWith('.jpg'))){
    assert.ok(pdf.includes(await readFile(new URL(file.name,folder))),`Pagina originale mancante nel PDF: ${file.name}`);
  }
  const xref=Number(pdf.toString('latin1').match(/startxref\n(\d+)\n%%EOF/)[1]);
  assert.equal(pdf.subarray(xref,xref+4).toString(),'xref');
});

test('ogni prodotto ha un ritaglio locale e una zona selezionabile dentro la pagina',async()=>{
  const regions=JSON.parse(await readFile(new URL('../data/flyer-regions-20001.json',import.meta.url),'utf8'));
  const previous=JSON.parse(await readFile(new URL('../data/flyer-regions-946.json',import.meta.url),'utf8'));
  for (const offer of catalog.offers) {
    assert.equal(previous[offer.id],undefined);
    assert.deepEqual(offer.region,regions[offer.id]);
    assert.equal(offer.region.length,4);
    const [x,y,w,h]=offer.region;
    assert.ok([x,y,w,h].every(Number.isFinite));
    assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=1.000001&&y+h<=1.000001,offer.id);
    assert.equal(offer.local_page,catalog.flyers[0].local_pages[offer.page-1]);
  }
});

test('le foto delle offerte scadute restano consultabili senza rientrare nel catalogo attivo',async()=>{
  const archive=JSON.parse(await readFile(new URL('../public/data/archived-offers.json',import.meta.url),'utf8'));
  assert.equal(archive.offers.length,577);
  assert.ok(archive.offers.every(o=>o.valid_until==='2026-11-12'));
  assert.ok(catalog.offers.every(o=>o.flyer_url.includes('/20001-')));
  for(const source of archive.sources)for(const file of source.files){
    const bytes=await readFile(new URL('../public/'+source.folder.slice(2)+'/'+file.name,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);
  }
});
