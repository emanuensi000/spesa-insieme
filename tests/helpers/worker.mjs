import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const origin='https://example.github.io/spesa-insieme/';
export async function worker({offline=false,cacheControl='',redirected=false,entries=[]}={}){
 const handlers={},stored=new Map(entries),writes=[],requests=[];
 const response={ok:true,type:'basic',redirected,headers:new Headers({'cache-control':cacheControl}),clone(){return this;}};
 const key=request=>request.url||String(request);
 const cache={put:async(request,value)=>{writes.push(key(request));stored.set(key(request),value);},match:async request=>stored.get(key(request))};
 const context=vm.createContext({URL,Response,__FLYER_ASSETS__:['./flyers/test/page-01.jpg'],self:{location:new URL(origin+'sw.js'),addEventListener:(name,handler)=>handlers[name]=handler},caches:{open:async()=>cache},fetch:async request=>{requests.push(key(request));if(offline)throw Error('Offline');return response;}});
 vm.runInContext(await readFile(new URL('../../public/sw.js',import.meta.url),'utf8'),context);
 return {writes,requests,async get(path,{navigate=false,headers={}}={}){
  let completion;
  handlers.fetch({request:{method:'GET',url:new URL(path,origin).href,mode:navigate?'navigate':'cors',headers:new Headers(headers)},respondWith:promise=>{completion=promise;}});
  return completion;
 }};
}

