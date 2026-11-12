import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

test('il service worker non conserva gli URL contenenti codici o errori OAuth',async()=>{
  const handlers={},cached=[],source=await readFile(new URL('../public/sw.js',import.meta.url),'utf8');
  const cache={addAll:async()=>{},put:async request=>cached.push(request.url),match:async()=>({ok:true,type:'basic'})};
  const context=vm.createContext({URL,Response,__FLYER_ASSETS__:[],self:{location:new URL('https://example.github.io/spesa-insieme/sw.js'),addEventListener:(name,handler)=>handlers[name]=handler},caches:{open:async()=>cache},fetch:async()=>({ok:true,type:'basic',clone(){return this;}})});
  vm.runInContext(source,context);
  for(const query of ['?code=one-time-code','?error=access_denied','']){
    let completion;
    handlers.fetch({request:{method:'GET',url:'https://example.github.io/spesa-insieme/'+query,mode:'navigate'},respondWith:promise=>{completion=promise;}});
    await completion;
  }
  assert.deepEqual(cached,['https://example.github.io/spesa-insieme/']);
});
