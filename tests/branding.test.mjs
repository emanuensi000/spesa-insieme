import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import sharp from 'sharp';

test('icone installabili e Apple generate dallo stesso SVG del logo, senza divergenze',async()=>{
 await import('../scripts/build.mjs');
 const svg=await readFile(new URL('../public/icons/icon.svg',import.meta.url));
 const manifest=JSON.parse(await readFile(new URL('../dist/manifest.webmanifest',import.meta.url)));
 for(const icon of manifest.icons){
  const size=Number(icon.sizes.split('x')[0]);
  let expected=sharp(svg).resize(size,size);
  if(icon.purpose==='maskable')expected=expected.flatten({background:'#244b3b'});
  const path=new URL('../dist/'+icon.src,import.meta.url);
  assert.deepEqual(await sharp(await readFile(path)).ensureAlpha().raw().toBuffer(),await expected.ensureAlpha().raw().toBuffer());
 }
 const apple=sharp(await readFile(new URL('../dist/icons/apple-touch-icon.png',import.meta.url)));
 const meta=await apple.metadata();assert.equal(meta.width,180);assert.equal(meta.height,180);assert.equal(meta.hasAlpha,false);
 for(const name of ['index.html','shopping.html']){
  const html=await readFile(new URL('../dist/'+name,import.meta.url),'utf8');
  assert.match(html,/<img class="brand-icon" src="\.\/icons\/icon.svg"/);
  assert.match(html,/rel="apple-touch-icon" href="\.\/icons\/apple-touch-icon.png"/);
 }
 const worker=await readFile(new URL('../dist/sw.js',import.meta.url),'utf8');
 for(const name of ['icon.svg','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'])assert.ok(worker.includes('./icons/'+name));
});
