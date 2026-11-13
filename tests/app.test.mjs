import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import * as core from '../public/core.js';
import * as shoppingHistory from '../public/shopping-history.js';

// Exercise real event handlers and offline persistence with a minimal DOM adapter.
class Element {
  constructor(tag='div') { this.tagName=tag; this.children=[]; this.style={}; this.dataset={}; this.value=''; this.open=false; this.classList={toggle(){}}; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children=children; }
  setAttribute(name,value) { this[name]=value; }
  addEventListener() {}
  showModal() { this.open=true; }
  close() { this.open=false; }
  focus() {}
  cloneNode() { return Object.assign(new Element(this.tagName),{value:this.value,textContent:this.textContent}); }
}
async function startApp({legacy=false, both=false, full=false}={}) {
  const html=await readFile(new URL('../public/shopping.html',import.meta.url),'utf8');
  const nodes=new Map([...html.matchAll(/id="([^"]+)"/g)].map(m=>[`#${m[1]}`,new Element()]));
  nodes.get('#offer-validity').value='all';
  const id='12345678-1234-1234-1234-123456789012',token='a'.repeat(64);
  const stored={active:{id,token},lists:{[id]:{name:'Test',base:[],pending:[],created:true,loaded:true,localOnly:true,token}}};
  const catalog=JSON.parse(await readFile(new URL('../public/data/offers.json',import.meta.url),'utf8'));
  const photoArchive=JSON.parse(await readFile(new URL('../public/data/archived-offers.json',import.meta.url),'utf8'));
  stored.lists[id].pending=[{op_id:'23456789-1234-1234-1234-123456789012',kind:'add',item_id:'34567890-1234-1234-1234-123456789012',data:{name:'Latte',quantity:'1'}}].filter(()=>legacy || both);
  const original=JSON.stringify(stored);
  const memory=new Map([[legacy ? 'spesa-insieme:v1' : 'organaizer:v1',original]]);
  if(both) memory.set('spesa-insieme:v1',JSON.stringify({...stored,active:null,lists:{}}));
  let failStorage=full;
  const context=vm.createContext({...core,...shoppingHistory,config:{},crypto:webcrypto,URLSearchParams,Intl,AbortSignal,
    document:{querySelector:selector=>nodes.get(selector),querySelectorAll:()=>[],createElement:tag=>new Element(tag),createTextNode:text=>({textContent:text}),addEventListener(){}},
    navigator:{onLine:false},location:{hash:'',protocol:'http:',hostname:'test'},window:{addEventListener(){}},
    localStorage:{getItem:key=>memory.get(key) ?? null,setItem:(key,value)=>{if(failStorage) throw Error('Full');memory.set(key,value);}},
    fetch:async path=>({ok:true,json:async()=>path.includes('archived-offers')?photoArchive:catalog}),setInterval(){},setTimeout(){},clearTimeout(){},confirm:()=>true
  });
  const source=(await readFile(new URL('../public/app.js',import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'');
  vm.runInContext(source,context);
  await new Promise(resolve=>setImmediate(resolve));
  return {context,nodes,run:script=>vm.runInContext(script,context),memory,original,snapshot:()=>JSON.parse(memory.get('organaizer:v1')).lists[id],fail:()=>{failStorage=true;}};
}

test('tap sul volantino, quantità, acquisto, rimozione e riaggiunta mantengono prezzi e stato',async()=>{
  const app=await startApp(), {nodes,run}=app;
  nodes.get('#open-flyer').onclick();
  assert.ok(nodes.get('#page-dialog').open);
  assert.equal(nodes.get('#page-hotspots').children.length,12);
  nodes.get('#page-hotspots').children[0].onclick();
  assert.equal(run('itemsNow().length'),1);
  assert.equal(nodes.get('#estimate-total').textContent,core.money(.75));
  let controls=nodes.get('#items').children[0].children.find(n=>n.className==='item-meta').children[0];
  controls.children[2].onclick();
  assert.equal(run('itemsNow().length'),2);
  assert.equal(nodes.get('#estimate-total').textContent,core.money(1.50));
  controls=nodes.get('#items').children[0].children.find(n=>n.className==='item-meta').children[0];
  controls.children[1].value='4';controls.children[1].onchange();
  assert.equal(run('itemsNow().length'),4);
  assert.equal(nodes.get('#estimate-total').textContent,core.money(3.00));
  nodes.get('#items').children[0].children.find(n=>n.className==='check').onclick();
  assert.equal(nodes.get('#items').children.length,1);
  assert.ok(nodes.get('#items').children[0].className.includes('collapsed'));
  assert.equal(nodes.get('#done-items').children.length,0);
  nodes.get('#items').children[0].children.find(n=>n.className==='item-info').children.find(n=>n.className==='item-toggle').onclick();
  assert.ok(!nodes.get('#items').children[0].className.includes('collapsed'));
  assert.equal(run('itemsNow().filter(i=>i.checked).length'),4);
  assert.equal(nodes.get('#estimate-total').textContent,core.money(3.00));
  assert.equal(nodes.get('#page-hotspots').children[0]['aria-pressed'],'true');
  nodes.get('#page-hotspots').children[0].onclick();
  assert.equal(run('itemsNow().length'),0);
  nodes.get('#page-hotspots').children[0].onclick();
  assert.equal(run('itemsNow().length'),1);
  assert.equal(core.projectItems(app.snapshot().base,app.snapshot().pending).length,1);
  nodes.get('#next-page').onclick();
  assert.equal(nodes.get('#page-position').textContent,'2 / 20');
  assert.equal(nodes.get('#page-hotspots').children.length,42);
});

test('la modifica di quantità viene annullata interamente se il salvataggio fallisce',async()=>{
  const {nodes,run,fail}=await startApp();
  nodes.get('#open-flyer').onclick();nodes.get('#page-hotspots').children[0].onclick();
  fail();
  const controls=nodes.get('#items').children[0].children.find(n=>n.className==='item-meta').children[0];
  controls.children[1].value='5';controls.children[1].onchange();
  assert.equal(run('itemsNow().length'),1);
  assert.equal(controls.children[1].value,1);
});


test('la rinomina recupera lista, token e coda offline e conserva la copia precedente',async()=>{
  const app=await startApp({legacy:true});
  assert.equal(app.memory.get('spesa-insieme:v1'),app.original);
  assert.equal(app.memory.get('organaizer:v1'),app.original);
  assert.equal(app.run('itemsNow()[0].name'),'Latte');
  assert.equal(app.snapshot().pending.length,1);
  assert.equal(app.snapshot().token,'a'.repeat(64));
});

test('i dati OrganAIzer esistenti prevalgono sulla copia precedente',async()=>{
  const app=await startApp({both:true});
  assert.equal(app.memory.get('organaizer:v1'),app.original);
  assert.equal(app.run('itemsNow()[0].name'),'Latte');
});

test('memoria piena durante la migrazione conserva intatta la coda precedente',async()=>{
  const app=await startApp({legacy:true,full:true});
  assert.equal(app.memory.get('spesa-insieme:v1'),app.original);
  assert.equal(app.memory.has('organaizer:v1'),false);
  assert.equal(app.nodes.get('#notice').hidden,false);
});

test('chiusura salva totale scontrino e foto, blocca le modifiche e permette una nuova lista',async()=>{
  const app=await startApp(),{nodes,run}=app;
  nodes.get('#open-flyer').onclick();nodes.get('#page-hotspots').children[0].onclick();
  nodes.get('#items').children[0].children.find(n=>n.className==='check').onclick();
  nodes.get('#close-shopping').onclick();assert.equal(nodes.get('#checkout-amount').value,'0.75');
  nodes.get('#checkout-amount').value='0,70';
  await nodes.get('#checkout-form').onsubmit({preventDefault(){}});
  const receipt=app.snapshot().closure.receipt;
  assert.equal(receipt.amount_cents,70);assert.equal(receipt.estimate_cents,75);
  assert.equal(receipt.items.length,1);assert.ok(receipt.items[0].photo.path.includes('20001-20261112'));
  assert.equal(app.snapshot().closure.pending,false);
  assert.equal(nodes.get('#add-form').hidden,true);
  const operations=app.snapshot().pending.length;
  nodes.get('#page-hotspots').children[0].onclick();
  assert.equal(app.snapshot().pending.length,operations);
  await nodes.get('#checkout-form').onsubmit({preventDefault(){}});
  assert.equal(app.snapshot().closure.receipt.amount_cents,70);
  nodes.get('#new-shopping').onclick();assert.equal(run('link'),null);
  assert.equal(nodes.get('#welcome').hidden,false);assert.equal(app.snapshot().closure.receipt.amount_cents,70);
  nodes.get('#list-name').value='Nuova spesa';await nodes.get('#create-form').onsubmit({preventDefault(){}});
  assert.equal(nodes.get('#offers').children[0].children.at(-1).disabled,false);
  assert.notEqual(run('link.id'),receipt.id);
});

test('i prodotti della precedente edizione conservano la propria foto, anche nello storico',async()=>{
  const app=await startApp(),{run,nodes}=app;
  const old=JSON.parse(await readFile(new URL('../public/data/archived-offers.json',import.meta.url),'utf8')).offers[0];
  const date=d=>d.split('-').reverse().join('/');
  const item={id:'88888888-8888-4888-8888-888888888888',name:[old.brand,old.name].filter(Boolean).join(' '),quantity:old.size,price:old.price,checked:true,created_at:'2026-11-11T10:00:00Z',note:`Offerta dal ${date(old.valid_from)} al ${date(old.valid_until)} · pag. ${old.page}`};
  run(`state.base=[${JSON.stringify(item)}];state.pending=[];render();`);
  const frame=nodes.get('#items').children[0].children.find(n=>n.className==='product-photo');
  assert.equal(frame.children[0].src,old.local_page);
  nodes.get('#close-shopping').onclick();await nodes.get('#checkout-form').onsubmit({preventDefault(){}});
  assert.equal(app.snapshot().closure.receipt.items[0].photo.path,old.local_page);
});

test('chiusura con memoria piena lascia la lista aperta e tutti i prodotti intatti',async()=>{
  const app=await startApp(),{nodes,fail,run}=app;
  nodes.get('#open-flyer').onclick();nodes.get('#page-hotspots').children[0].onclick();
  nodes.get('#items').children[0].children.find(n=>n.className==='check').onclick();
  nodes.get('#close-shopping').onclick();fail();
  await nodes.get('#checkout-form').onsubmit({preventDefault(){}});
  assert.equal(run('!!state.closure'),false);assert.equal(run('itemsNow().length'),1);
  assert.equal(nodes.get('#checkout-error').hidden,false);assert.equal(nodes.get('#checkout-dialog').open,true);
});


test('i prodotti spuntati vanno in fondo e tornano tra quelli da acquistare togliendo la spunta',async()=>{
  const {nodes,run}=await startApp();
  run("addItem('Latte'); addItem('Pane'); addItem('Uova');");
  const rows=()=>nodes.get('#items').children;
  const names=()=>rows().map(row=>row.children.find(n=>n.className==='item-info').children[0].textContent);
  const check=row=>row.children.find(n=>n.className==='check').onclick();
  check(rows()[0]);
  assert.deepEqual(names(),['Pane','Uova','Latte']);
  assert.ok(rows()[2].className.includes('collapsed'));
  check(rows()[0]);
  assert.deepEqual(names(),['Uova','Latte','Pane']);
  check(rows()[1]);
  assert.deepEqual(names(),['Latte','Uova','Pane']);
  assert.equal(run('itemsNow().length'),3);
});
