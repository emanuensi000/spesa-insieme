import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import * as core from '../public/core.js';

// Exercise real event handlers and offline persistence with a minimal DOM adapter.
class Element {
  constructor(tag='div') { this.tagName=tag; this.children=[]; this.style={}; this.dataset={}; this.value=''; this.open=false; this.classList={toggle(){}}; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children=children; }
  setAttribute(name,value) { this[name]=value; }
  addEventListener() {}
  showModal() { this.open=true; }
  cloneNode() { return Object.assign(new Element(this.tagName),{value:this.value,textContent:this.textContent}); }
}
async function startApp() {
  const html=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
  const nodes=new Map([...html.matchAll(/id="([^"]+)"/g)].map(m=>[`#${m[1]}`,new Element()]));
  nodes.get('#offer-validity').value='all';
  const id='12345678-1234-1234-1234-123456789012',token='a'.repeat(64);
  const stored={active:{id,token},lists:{[id]:{name:'Test',base:[],pending:[],created:true,loaded:true,localOnly:true,token}}};
  const catalog=JSON.parse(await readFile(new URL('../public/data/offers.json',import.meta.url),'utf8'));
  let memory=JSON.stringify(stored),failStorage=false;
  const context=vm.createContext({...core,config:{},crypto:webcrypto,URLSearchParams,Intl,AbortSignal,
    document:{querySelector:selector=>nodes.get(selector),querySelectorAll:()=>[],createElement:tag=>new Element(tag),createTextNode:text=>({textContent:text}),addEventListener(){}},
    navigator:{onLine:false},location:{hash:'',protocol:'http:',hostname:'test'},window:{addEventListener(){}},
    localStorage:{getItem:()=>memory,setItem:(key,value)=>{if(failStorage) throw Error('Full');memory=value;}},
    fetch:async()=>({ok:true,json:async()=>catalog}),setInterval(){},setTimeout(){},clearTimeout(){},confirm:()=>true
  });
  const source=(await readFile(new URL('../public/app.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
  vm.runInContext(source,context);
  await new Promise(resolve=>setImmediate(resolve));
  return {context,nodes,run:script=>vm.runInContext(script,context),snapshot:()=>JSON.parse(memory).lists[id],fail:()=>{failStorage=true;}};
}

test('tap sul volantino, quantità, acquisto, rimozione e riaggiunta mantengono prezzi e stato',async()=>{
  const app=await startApp(), {nodes,run}=app;
  nodes.get('#open-flyer').onclick();
  assert.ok(nodes.get('#page-dialog').open);
  assert.equal(nodes.get('#page-hotspots').children.length,12);
  nodes.get('#page-hotspots').children[0].onclick();
  assert.equal(run('itemsNow().length'),1);
  assert.equal(nodes.get('#estimate-total').textContent,core.money(.74));
  let controls=nodes.get('#items').children[0].children.find(n=>n.className==='item-meta').children[0];
  controls.children[2].onclick();
  assert.equal(run('itemsNow().length'),2);
  assert.equal(nodes.get('#estimate-total').textContent,core.money(1.48));
  controls=nodes.get('#items').children[0].children.find(n=>n.className==='item-meta').children[0];
  controls.children[1].value='4';controls.children[1].onchange();
  assert.equal(run('itemsNow().length'),4);
  assert.equal(nodes.get('#estimate-total').textContent,core.money(2.96));
  nodes.get('#items').children[0].children.find(n=>n.className==='check').onclick();
  assert.equal(nodes.get('#items').children.length,1);
  assert.ok(nodes.get('#items').children[0].className.includes('collapsed'));
  assert.equal(nodes.get('#done-items').children.length,0);
  nodes.get('#items').children[0].children.find(n=>n.className==='item-info').children.find(n=>n.className==='item-toggle').onclick();
  assert.ok(!nodes.get('#items').children[0].className.includes('collapsed'));
  assert.equal(run('itemsNow().filter(i=>i.checked).length'),4);
  assert.equal(nodes.get('#estimate-total').textContent,core.money(2.96));
  assert.equal(nodes.get('#page-hotspots').children[0]['aria-pressed'],'true');
  nodes.get('#page-hotspots').children[0].onclick();
  assert.equal(run('itemsNow().length'),0);
  nodes.get('#page-hotspots').children[0].onclick();
  assert.equal(run('itemsNow().length'),1);
  assert.equal(core.projectItems(app.snapshot().base,app.snapshot().pending).length,1);
  nodes.get('#next-page').onclick();
  assert.equal(nodes.get('#page-position').textContent,'2 / 20');
  assert.equal(nodes.get('#page-hotspots').children.length,39);
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
