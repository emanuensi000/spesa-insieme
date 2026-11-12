import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {activeOffers} from '../public/core.js';
const catalog=JSON.parse(await readFile(new URL('../public/data/offers.json',import.meta.url),'utf8'));
test('il catalogo trascritto copre le 19 pagine di prodotti e le iniziative a pagina 20',()=>{
  assert.equal(catalog.store_group,'Casal Bertone - Fonte Nuova - Guidonia - Viterbo');
  assert.equal(catalog.offers.length,577);
  assert.deepEqual([...new Set(catalog.offers.map(o=>o.page))].sort((a,b)=>a-b),Array.from({length:19},(_,i)=>i+1));
  assert.equal(catalog.reviewed_pages.length,20);
  assert.equal(catalog.offers.filter(o=>o.valid_from==='2026-11-12').length,4);
  assert.equal(activeOffers(catalog.offers,'2026-11-11').length,573);
  assert.equal(catalog.offers.filter(o=>o.price===null&&o.discount_percent===10).length,1);
  assert.equal(new Set(catalog.offers.map(o=>o.id)).size,catalog.offers.length);
});
test('PDF e tutte le pagine archiviate corrispondono ai checksum dichiarati',async()=>{
  const folder=new URL('../public/flyers/946-20261102/',import.meta.url);
  const manifest=JSON.parse(await readFile(new URL('source.json',folder),'utf8'));
  assert.equal(manifest.files.length,21);
  for(const file of manifest.files){
    const bytes=await readFile(new URL(file.name,folder));
    assert.equal(bytes.length,file.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);
    assert.ok(bytes.subarray(0,4).toString().startsWith('%PDF')||bytes.subarray(0,2).equals(Buffer.from([255,216])));
  }
});

test('ogni prodotto ha un ritaglio locale e una zona selezionabile dentro la pagina',async()=>{
  const regions=JSON.parse(await readFile(new URL('../data/flyer-regions-946.json',import.meta.url),'utf8'));
  for (const offer of catalog.offers) {
    assert.deepEqual(offer.region,regions[offer.id]);
    assert.equal(offer.region.length,4);
    const [x,y,w,h]=offer.region;
    assert.ok([x,y,w,h].every(Number.isFinite));
    assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=1.000001&&y+h<=1.000001,offer.id);
    assert.equal(offer.local_page,catalog.flyers[0].local_pages[offer.page-1]);
  }
});
