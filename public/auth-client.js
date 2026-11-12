export function normalizePhone(value) {
  const phone=String(value).trim().replace(/[\s().-]/g,'').replace(/^00/,'+');
  if(!/^\+[1-9]\d{7,14}$/.test(phone))throw Error('Inserisci il numero completo di prefisso, per esempio +39 333 1234567.');
  return phone;
}

function authError(data,status) {
  const code=data?.code||data?.error_code||data?.error;
  const messages={
    otp_expired:'Il codice è errato o scaduto. Controllalo oppure richiedine uno nuovo.',
    invalid_credentials:'Il codice non è valido. Controlla il numero e riprova.',
    sms_send_failed:'Non è stato possibile inviare l’SMS. Riprova più tardi.',
    phone_provider_disabled:'L’accesso con telefono non è ancora disponibile.',
    provider_disabled:'Questo metodo di accesso non è ancora disponibile.',
    signup_disabled:'Le nuove registrazioni non sono disponibili.',
    captcha_failed:'La verifica di sicurezza non è riuscita. Riprova.',
    bad_code_verifier:'Il tentativo di accesso è scaduto. Riparti da questo browser.',
    flow_state_expired:'Il tentativo di accesso è scaduto. Riparti da questo browser.',
    flow_state_not_found:'Il tentativo di accesso non è più valido. Riprova.',
    refresh_token_not_found:'La sessione è scaduta. Accedi di nuovo.',
    refresh_token_already_used:'La sessione è scaduta. Accedi di nuovo.'
  };
  const error=Error(status===429?'Troppi tentativi. Attendi prima di richiedere un altro codice.':messages[code]||'Accesso non riuscito. Riprova; se il problema continua, contatta chi gestisce l’app.');
  error.status=status;error.code=code;return error;
}

function browserStorage(name){try{return globalThis[name];}catch{return undefined;}}

export function createAuthClient({config={},storage=browserStorage('localStorage'),legacyStorage=browserStorage('sessionStorage'),
  fetchImpl=(...args)=>fetch(...args),locationImpl=globalThis.location,historyImpl=globalThis.history,
  cryptoImpl=globalThis.crypto,locks=globalThis.navigator?.locks,events=globalThis.window,now=()=>Date.now(),isOnline=()=>globalThis.navigator?.onLine!==false}={}) {
  const base=config.supabaseUrl?.replace(/\/$/,'');
  const key=`organaizer:auth:${base?new URL(base).hostname:'local'}`;
  const oauthKey=key+':oauth',phoneKey=key+':phone',listeners=new Set();
  let refreshPromise=null,settingsCache=null,revision=0;
  const read=name=>{try{return JSON.parse(storage?.getItem(name)||'null');}catch{return null;}};
  const write=(name,value)=>{try{if(!storage)throw Error();storage.setItem(name,JSON.stringify(value));}catch{throw Error('Per accedere, consenti al browser di salvare i dati del sito.');}};
  const remove=name=>{try{storage?.removeItem(name);}catch{}};
  const notify=user=>listeners.forEach(listener=>listener(user?.id||null));
  function validSession(value){return value&&typeof value.access_token==='string'&&typeof value.refresh_token==='string'&&typeof value.user?.id==='string'&&Number.isFinite(value.expires_at);}
  function loadSession(){
    const saved=read(key);if(validSession(saved))return saved;
    let legacy;try{legacy=JSON.parse(legacyStorage?.getItem('organaizer:session')||'null');}catch{return null;}
    if(!validSession(legacy))return null;
    write(key,legacy);legacyStorage.removeItem('organaizer:session');return legacy;
  }
  function save(data){
    const expiresAt=Number.isFinite(data.expires_at)?data.expires_at*1000:now()+Number(data.expires_in)*1000;
    const session={access_token:data.access_token,refresh_token:data.refresh_token,user:data.user,expires_at:expiresAt};
    if(!validSession(session))throw Error('Il servizio non ha restituito una sessione valida. Riprova l’accesso.');
    write(key,session);try{legacyStorage?.removeItem('organaizer:session');}catch{}return session.user;
  }
  function clear(){revision++;remove(key);try{legacyStorage?.removeItem('organaizer:session');}catch{}notify(null);}
  async function request(path,body,token,method='POST'){
    if(!base||!config.supabasePublishableKey)throw Error('Il servizio di accesso non è configurato.');
    let response;
    try{response=await fetchImpl(base+path,{method,headers:{apikey:config.supabasePublishableKey,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{}),cache:'no-store',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(15000)});}
    catch{throw Error('Connessione non disponibile. Riprova quando torna la rete.');}
    const data=await response.json().catch(()=>({}));
    if(!response.ok){
      if(path.startsWith('/rest/')){const error=Error(data.message||'Operazione non riuscita. Riprova.');error.status=response.status;throw error;}
      const error=authError(data,response.status),seconds=Number(response.headers?.get('Retry-After'));
      if(Number.isFinite(seconds)&&seconds>0)error.retryAfter=seconds;throw error;
    }
    return data;
  }
  async function currentSession(){
    const initial=loadSession();if(!initial)return null;
    if(initial.expires_at>now()+60000)return initial;
    if(!refreshPromise){
      const refresh=async()=>{
        const session=loadSession(),generation=revision;if(!session)return null;
        if(session.expires_at>now()+60000)return session;
        try{const data=await request('/auth/v1/token?grant_type=refresh_token',{refresh_token:session.refresh_token});if(generation!==revision||loadSession()?.refresh_token!==session.refresh_token)return loadSession();save(data);return loadSession();}
        catch(error){if((error.status===400||error.status===401)&&generation===revision&&loadSession()?.refresh_token===session.refresh_token)clear();throw error;}
      };
      refreshPromise=(locks?.request?locks.request(key+':refresh',refresh):refresh()).finally(()=>{refreshPromise=null;});
    }
    return refreshPromise;
  }
  function returnHash(hash){
    const p=new URLSearchParams(String(hash||'').replace(/^#/,'')),uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if(uuid.test(p.get('invite')||'')&&/^[0-9a-f]{64}$/.test(p.get('token')||''))return '#'+new URLSearchParams({invite:p.get('invite'),token:p.get('token')});
    if(uuid.test(p.get('list')||'')&&/^[0-9a-f]{64}$/.test(p.get('key')||''))return '#'+new URLSearchParams({list:p.get('list'),key:p.get('key')});
    return '';
  }
  function restoreReturn(pending){
    const target=new URL('./',locationImpl.href);
    if(['home','profile','settings'].includes(pending?.screen))target.searchParams.set('screen',pending.screen);
    target.hash=returnHash(pending?.hash);historyImpl.replaceState(null,'',target.pathname+target.search+target.hash);
  }
  events?.addEventListener('storage',event=>{if(event.key===key){revision++;const session=read(key);notify(validSession(session)?session.user:null);}});
  const client={
    async settings({force=false}={}){if(!settingsCache||force){const data=await request('/auth/v1/settings',null,null,'GET');settingsCache=data.external||{};}return {...settingsCache};},
    async user(){return (isOnline()?await currentSession():loadSession())?.user||null;},
    async token(){return (await currentSession())?.access_token;},
    onSessionChange(listener){listeners.add(listener);return ()=>listeners.delete(listener);},
    async oauth(provider){
      if(!['google','facebook'].includes(provider))throw Error('Metodo di accesso non supportato.');
      if(!(await client.settings({force:true}))[provider])throw Error('Questo metodo di accesso non è ancora disponibile.');
      const existing=read(oauthKey);if(existing&&now()-existing.startedAt<15000)throw Error('Un accesso è già in corso. Attendi qualche secondo prima di riprovare.');
      const encode=bytes=>btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
      const verifier=encode(cryptoImpl.getRandomValues(new Uint8Array(48))),challenge=encode(new Uint8Array(await cryptoImpl.subtle.digest('SHA-256',new TextEncoder().encode(verifier))));
      const here=new URL(locationImpl.href),redirect=new URL('./',here);
      write(oauthKey,{verifier,startedAt:now(),hash:returnHash(here.hash),screen:here.searchParams.get('screen')});
      try{locationImpl.assign(base+'/auth/v1/authorize?'+new URLSearchParams({provider,redirect_to:redirect.href,code_challenge:challenge,code_challenge_method:'s256',...(provider==='google'?{prompt:'select_account'}:{})}));}
      catch(error){remove(oauthKey);throw error;}
    },
    async callback(){
      const url=new URL(locationImpl.href),params=url.searchParams,fragment=new URLSearchParams(url.hash.slice(1)),failure=params.get('error')||fragment.get('error');
      if(!params.has('code')&&!failure)return false;
      const pending=read(oauthKey);restoreReturn(pending);
      if(failure){remove(oauthKey);throw Error('Accesso annullato o rifiutato. Puoi riprovare o continuare senza account.');}
      if(!pending?.verifier||!Number.isFinite(pending.startedAt)||now()-pending.startedAt>15*60000||pending.startedAt>now()+60000){remove(oauthKey);throw Error('Il tentativo di accesso è scaduto. Riparti da questo browser.');}
      try{save(await request('/auth/v1/token?grant_type=pkce',{auth_code:params.get('code'),code_verifier:pending.verifier}));return true;}
      finally{remove(oauthKey);}
    },
    phoneChallenge(){const challenge=read(phoneKey);return challenge&&now()-challenge.sentAt<3600000?challenge:null;},
    async sendCode(value){
      const phone=normalizePhone(value),previous=read(phoneKey);
      if(previous?.nextSendAt>now())throw Error(`Attendi ${Math.ceil((previous.nextSendAt-now())/1000)} secondi prima di richiedere un altro codice.`);
      if(!(await client.settings({force:true})).phone)throw Error('L’accesso con telefono non è ancora disponibile.');
      try{await request('/auth/v1/otp',{phone,create_user:true,channel:'sms'});}
      catch(error){if(error.status===429)write(phoneKey,{...previous,nextSendAt:now()+Math.max(60,error.retryAfter||0)*1000});throw error;}
      const challenge={phone,sentAt:now(),nextSendAt:now()+60000};write(phoneKey,challenge);return challenge;
    },
    async verify(value,code){
      const phone=normalizePhone(value),token=String(code).trim(),pending=client.phoneChallenge();
      if(!pending||pending.phone!==phone)throw Error('Richiedi un codice per questo numero prima di verificarlo.');
      if(!/^\d{6,8}$/.test(token))throw Error('Inserisci il codice numerico ricevuto via SMS.');
      const user=save(await request('/auth/v1/verify',{phone,token,type:'sms'}));remove(phoneKey);return user;
    },
    async logout(){
      revision++;
      const session=loadSession();
      try{if(session)await request('/auth/v1/logout?scope=local',{},session.access_token);}catch{/* Logout locale anche offline. */}
      finally{clear();remove(oauthKey);remove(phoneKey);}
    },
    async rpc(name,args={}){const token=await client.token();try{return await request('/rest/v1/rpc/'+name,args,token||(config.supabasePublishableKey?.startsWith('eyJ')?config.supabasePublishableKey:null));}catch(error){if(error.status===401&&token&&loadSession()?.access_token===token)clear();throw error;}}
  };
  return client;
}
