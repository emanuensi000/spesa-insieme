import test from 'node:test';
import assert from 'node:assert/strict';

const origin='https://example.github.io/spesa-insieme/';
import {worker} from './helpers/worker.mjs';

test('le navigazioni, inclusi OAuth e inviti, non vengono mai salvate in cache',async()=>{
 const w=await worker();
 for(const path of ['?code=one-time-code','?error=access_denied','?invite=private','shopping.html?group=private',''])await w.get(path,{navigate:true});
 assert.deepEqual(w.writes,[]);
});

test('offline ogni navigazione usa la propria shell senza perdere il modulo Spesa',async()=>{
 const home={page:'home'},shopping={page:'shopping'};
 const w=await worker({offline:true,entries:[[origin+'index.html',home],[origin+'shopping.html',shopping]]});
 assert.equal(await w.get('?code=secret',{navigate:true}),home);
 assert.equal(await w.get('shopping.html?group=secret',{navigate:true}),shopping);
 assert.deepEqual(w.writes,[]);
});

test('risposte dinamiche, query e richieste autenticate non sono intercettate',async()=>{
 const w=await worker();
 for(const path of ['rest/v1/rpc/organizer_snapshot','unknown.json','app.js?token=secret','index.html?code=secret'])assert.equal(await w.get(path),undefined);
 assert.equal(await w.get('app.js',{headers:{Authorization:'Bearer test'}}),undefined);
 assert.deepEqual(w.requests,[]);
});

test('la cache statica conserva una build coerente e salva i volantini consultati',async()=>{
 const w=await worker();
 await w.get('app.js');await w.get('app.js');await w.get('flyers/test/page-01.jpg');
 assert.deepEqual(w.requests,[origin+'app.js',origin+'flyers/test/page-01.jpg']);
 assert.deepEqual(w.writes,w.requests);
});

test('no-store, private e redirect non vengono memorizzati neppure per risorse statiche',async()=>{
 for(const options of [{cacheControl:'max-age=0, no-store'},{cacheControl:'private, max-age=60'},{redirected:true}]){
  const w=await worker(options);await w.get('app.js');assert.deepEqual(w.writes,[]);
 }
});
