import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {createAuthClient,normalizePhone} from '../public/auth-client.js';
const config={supabaseUrl:'https://project.supabase.co',supabasePublishableKey:'sb_publishable_test'};
const key='organaizer:auth:project.supabase.co';
const id='11111111-1111-4111-8111-111111111111',invite='22222222-2222-4222-8222-222222222222';
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k),map};};
const session=(user=id)=>({access_token:'access-'+user,refresh_token:'refresh-'+user,expires_in:3600,user:{id:user,email:'test@example.com'}});
function setup(overrides={}){
  const storage=overrides.storage||memory(),legacyStorage=memory(),calls=[],state={now:1000000};
  const locationImpl={href:'https://example.github.io/spesa-insieme/',assign(url){this.assigned=url;}};
  const historyImpl={replaceState(_a,_b,url){this.last=url;locationImpl.href=new URL(url,locationImpl.href).href;}};
  const fetchImpl=async(url,options)=>{calls.push({url,options,body:options.body?JSON.parse(options.body):null});return new Response(JSON.stringify(url.endsWith('/settings')?{external:{google:true,facebook:true,phone:true}}:session()),{status:200});};
  const options={config,storage,legacyStorage,locationImpl,historyImpl,fetchImpl,cryptoImpl:webcrypto,now:()=>state.now,locks:null,events:null,...overrides};
  const client=createAuthClient(options);
  return {client,storage,legacyStorage,locationImpl,historyImpl,calls,state,options};
}

test('normalizzazione telefono conserva il prefisso e non indovina il paese',()=>{
  assert.equal(normalizePhone('0039 (333) 123-4567'),'+393331234567');
  assert.throws(()=>normalizePhone('3331234567'),/prefisso/);
  assert.throws(()=>normalizePhone('+00abc'),/prefisso/);
});

for(const provider of ['google','facebook'])test(`OAuth ${provider}: PKCE, percorso Pages e destinazione invito`,async()=>{
  const a=setup();a.locationImpl.href+=`?screen=settings#invite=${invite}&token=${'a'.repeat(64)}`;
  await a.client.oauth(provider);
  const url=new URL(a.locationImpl.assigned),pending=JSON.parse(a.storage.getItem(key+':oauth'));
  assert.equal(url.origin,'https://project.supabase.co');
  assert.equal(url.searchParams.get('provider'),provider);
  assert.equal(url.searchParams.get('redirect_to'),'https://example.github.io/spesa-insieme/');
  assert.equal(url.searchParams.get('code_challenge_method'),'s256');
  assert.equal(url.searchParams.get('code_challenge'),Buffer.from(await webcrypto.subtle.digest('SHA-256',new TextEncoder().encode(pending.verifier))).toString('base64url'));
  // Simula il ritorno su una nuova scheda con localStorage condiviso.
  a.locationImpl.href='https://example.github.io/spesa-insieme/?code=one-time-code';
  const next=createAuthClient(a.options);await next.callback();
  assert.equal((await next.user()).id,id);
  assert.equal(a.historyImpl.last,`/spesa-insieme/?screen=settings#invite=${invite}&token=${'a'.repeat(64)}`);
  assert.equal(a.storage.getItem(key+':oauth'),null);
  assert.ok(!a.historyImpl.last.includes('code='));
});

test('OAuth annullato ripulisce il callback, conserva l’invito e non espone errori del provider',async()=>{
  const a=setup();a.locationImpl.href+=`#invite=${invite}&token=${'a'.repeat(64)}`;
  await a.client.oauth('google');a.locationImpl.href='https://example.github.io/spesa-insieme/?error=access_denied&error_description=SECRET';
  await assert.rejects(a.client.callback(),/annullato/);
  assert.ok(a.historyImpl.last.includes('#invite='));assert.ok(!a.historyImpl.last.includes('SECRET'));
  assert.equal(await a.client.user(),null);
});

test('callback senza verifier o scaduto non scambia il codice e non redirige all’esterno',async()=>{
  const a=setup();a.locationImpl.href+='?code=test';
  await assert.rejects(a.client.callback(),/scaduto/);assert.equal(a.calls.length,0);
  a.storage.setItem(key+':oauth',JSON.stringify({verifier:'old',startedAt:a.state.now-16*60000,hash:'https://evil.example',screen:'//evil.example'}));
  a.locationImpl.href='https://example.github.io/spesa-insieme/?code=test';
  await assert.rejects(a.client.callback(),/scaduto/);assert.equal(a.historyImpl.last,'/spesa-insieme/');
});

test('provider disabilitato non avvia OAuth e non salva un verifier',async()=>{
  const a=setup({fetchImpl:async()=>new Response(JSON.stringify({external:{}}))});
  await assert.rejects(a.client.oauth('google'),/non è ancora disponibile/);
  assert.equal(a.storage.getItem(key+':oauth'),null);assert.equal(a.locationImpl.assigned,undefined);
});

test('OTP: invio, cooldown persistente, numero verificato e sessione dopo riapertura',async()=>{
  const a=setup();await a.client.sendCode('0039 333 1234567');
  assert.equal(a.calls.at(-1).body.phone,'+393331234567');
  const reopened=createAuthClient(a.options);
  await assert.rejects(reopened.sendCode('+393331234567'),/Attendi/);
  await assert.rejects(reopened.verify('+393339999999','123456'),/Richiedi/);
  await reopened.verify('+393331234567','123456');
  assert.equal(a.calls.at(-1).body.type,'sms');assert.equal(a.storage.getItem(key+':phone'),null);
  assert.equal((await createAuthClient(a.options).user()).id,id);
});

test('OTP errato/scaduto non apre una sessione e mantiene disponibile il reinvio',async()=>{
  const a=setup({fetchImpl:async url=>new Response(JSON.stringify(url.endsWith('/settings')?{external:{phone:true}}:url.endsWith('/verify')?{code:'otp_expired',message:'internal secret'}:{}),{status:url.endsWith('/verify')?403:200})});
  await a.client.sendCode('+393331234567');await assert.rejects(a.client.verify('+393331234567','123456'),/errato o scaduto/);
  assert.equal(await a.client.user(),null);assert.ok(a.client.phoneChallenge());
});

test('rate limit SMS impedisce reinvii anche dopo reload e non inventa un invio riuscito',async()=>{
  const a=setup({fetchImpl:async url=>new Response(JSON.stringify(url.endsWith('/settings')?{external:{phone:true}}:{code:'over_sms_send_rate_limit'}),{status:url.endsWith('/settings')?200:429,headers:{'Retry-After':'120'}})});
  await assert.rejects(a.client.sendCode('+393331234567'),/Troppi tentativi/);
  assert.equal(a.client.phoneChallenge(),null);
  await assert.rejects(createAuthClient(a.options).sendCode('+393331234567'),/120 secondi/);
});

test('sessione migrata dalla scheda e rinnovo concorrente usano un solo refresh token',async()=>{
  const a=setup();a.legacyStorage.setItem('organaizer:session',JSON.stringify({...session(),expires_at:a.state.now-1}));
  const [one,two]=await Promise.all([a.client.user(),a.client.token()]);
  assert.equal(one.id,id);assert.equal(two,'access-'+id);
  assert.equal(a.calls.length,1);assert.equal(a.legacyStorage.getItem('organaizer:session'),null);
  assert.ok(a.storage.getItem(key));
});

test('refresh scaduto pulisce l’identità, ma un errore di rete conserva la sessione per riprovare',async()=>{
  for(const network of [false,true]){
    const a=setup({fetchImpl:async()=>{if(network)throw Error('offline');return new Response(JSON.stringify({code:'refresh_token_not_found'}),{status:400});}});
    a.storage.setItem(key,JSON.stringify({...session(),expires_at:a.state.now-1}));
    let expired=false;a.client.onSessionChange(()=>expired=true);
    await assert.rejects(a.client.token());
    assert.equal(Boolean(a.storage.getItem(key)),network);assert.equal(expired,!network);
  }
});

test('logout offline pulisce la sessione e un refresh tardivo non la ricrea',async()=>{
  let release;const a=setup({fetchImpl:async url=>{if(url.includes('refresh_token'))return new Promise(resolve=>{release=()=>resolve(new Response(JSON.stringify(session())));});throw Error('offline');}});
  a.storage.setItem(key,JSON.stringify({...session(),expires_at:a.state.now-1}));
  const refreshing=a.client.token();await new Promise(resolve=>setImmediate(resolve));
  await a.client.logout();release();await refreshing;
  assert.equal(a.storage.getItem(key),null);assert.equal(await a.client.user(),null);
});

test('memoria bloccata non produce un accesso che verrà perso silenziosamente',async()=>{
  const a=setup({storage:{getItem:()=>null,setItem(){throw Error('blocked');},removeItem(){}}});
  await assert.rejects(a.client.oauth('google'),/consenti al browser/);assert.equal(a.locationImpl.assigned,undefined);
});

test('offline si riapre solo l’identità già salvata senza creare una nuova autenticazione',async()=>{
  const a=setup({isOnline:()=>false});a.storage.setItem(key,JSON.stringify({...session(),expires_at:a.state.now-1}));
  assert.equal((await a.client.user()).id,id);assert.equal(a.calls.length,0);
});

test('una RPC che rifiuta il JWT chiude la sessione; un link ospite rifiutato non crea identità',async()=>{
  const a=setup({fetchImpl:async()=>new Response(JSON.stringify({message:'JWT invalid'}),{status:401})});
  a.storage.setItem(key,JSON.stringify({...session(),expires_at:a.state.now+3600000}));
  await assert.rejects(a.client.rpc('organizer_groups'));
  assert.equal(await a.client.user(),null);
  await assert.rejects(a.client.rpc('organizer_read_invite',{p_id:invite,p_token:'a'.repeat(64)}));
  assert.equal(await a.client.user(),null);
});
