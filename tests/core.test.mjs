import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLink, projectItems, activeOffers, safeSourceUrl, romeDate } from '../public/core.js';
const id='12345678-1234-1234-1234-123456789012', token='a'.repeat(64);
test('il link richiede id e token completo',()=>{
  assert.deepEqual(parseLink(`#list=${id}&key=${token}`),{id,token});
  assert.equal(parseLink(''),null);
  assert.throws(()=>parseLink(`#list=${id}`));
  assert.throws(()=>parseLink('#list=x&key=y'));
});
test('la coda offline mantiene le modifiche degli altri e non resuscita i rimossi',()=>{
  const base=[{id:'a',name:'Latte',checked:false,created_at:'2026-11-11T10:00:00Z'},{id:'b',name:'Pane',checked:false,created_at:'2026-11-11T10:01:00Z'}];
  const pending=[{kind:'check',item_id:'a',data:{checked:true}},{kind:'delete',item_id:'a',data:{}},{kind:'add',item_id:'a',data:{name:'Duplicato',created_at:'2026-11-11T10:00:00Z'}},{kind:'check',item_id:'a',data:{checked:false}}];
  assert.deepEqual(projectItems(base,pending).map(i=>i.name),['Pane']);
  assert.equal(base[0].checked,false);
});
test('ripetere un add non duplica il prodotto',()=>{
  const add={kind:'add',item_id:'a',data:{name:'Latte',created_at:'2026-11-11T10:00:00Z'}};
  assert.equal(projectItems([], [add,add]).length,1);
});
test('la validità delle offerte include entrambi gli estremi e segue Roma',()=>{
  const offer={valid_from:'2026-11-11',valid_until:'2026-11-12'};
  assert.equal(activeOffers([offer],'2026-11-11').length,1);
  assert.equal(activeOffers([offer],'2026-11-12').length,1);
  assert.equal(activeOffers([offer],'2026-11-13').length,0);
  assert.equal(romeDate(new Date('2026-11-11T23:30:00Z')),'2026-11-12');
});
test('fonti esterne o protocolli eseguibili sono rifiutati',()=>{
  assert.equal(safeSourceUrl('javascript:alert(1)'),null);
  assert.equal(safeSourceUrl('https://ipertriscount.it.evil.example/a'),null);
  assert.equal(safeSourceUrl('https://ipertriscount.it/volantini'),'https://ipertriscount.it/volantini');
});
