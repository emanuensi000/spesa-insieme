import config from './config.js';
const sessionKey='organaizer:session';
let session=null;
try {session=JSON.parse(sessionStorage.getItem(sessionKey)||'null');}catch{sessionStorage.removeItem(sessionKey);}
const base=config.supabaseUrl?.replace(/\/$/,'');
const b64=bytes=>btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
async function request(path,body,token,method='POST') {
 if(!base)throw Error('Il servizio di accesso non è configurato.');
 const response=await fetch(base+path,{method,headers:{apikey:config.supabasePublishableKey,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{}),cache:'no-store',signal:AbortSignal.timeout(15000)});
 const data=await response.json().catch(()=>({}));
 if(!response.ok) {const error=Error(response.status===429?'Troppi tentativi. Attendi prima di riprovare.':data.msg||data.message||data.error_description||'Accesso non riuscito. Riprova.');error.status=response.status;throw error;}
 return data;
}
function save(data) {session={...data,expires_at:Date.now()+data.expires_in*1000};sessionStorage.setItem(sessionKey,JSON.stringify(session));return session.user;}
export const auth={
 async settings(){return (await request('/auth/v1/settings',null,null,'GET')).external||{};},
 async user(){if(!session)return null;if(session.expires_at<Date.now()+60000){try{save(await request('/auth/v1/token?grant_type=refresh_token',{refresh_token:session.refresh_token}));}catch(e){if(e.status===400||e.status===401){session=null;sessionStorage.removeItem(sessionKey);}throw e;}}return session.user;},
 async token(){await this.user();return session?.access_token;},
 async oauth(provider){
  const verifier=b64(crypto.getRandomValues(new Uint8Array(48)));sessionStorage.setItem('organaizer:pkce',verifier);
  const challenge=b64(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))));
  const redirect=new URL('./',location.href);sessionStorage.setItem('organaizer:return',location.hash);
  location.assign(base+'/auth/v1/authorize?'+new URLSearchParams({provider,redirect_to:redirect.href,code_challenge:challenge,code_challenge_method:'s256'}));
 },
 async callback(){
  const params=new URLSearchParams(location.search);if(params.get('error')){history.replaceState(null,'','./');throw Error('Accesso annullato o rifiutato.');}
  if(!params.has('code'))return;
  const code=params.get('code'),verifier=sessionStorage.getItem('organaizer:pkce');history.replaceState(null,'','./'+(sessionStorage.getItem('organaizer:return')||''));
  if(!verifier)throw Error('La sessione di accesso è scaduta. Riprova da questo browser.');
  try{return save(await request('/auth/v1/token?grant_type=pkce',{auth_code:code,code_verifier:verifier}));}finally{sessionStorage.removeItem('organaizer:pkce');sessionStorage.removeItem('organaizer:return');}
 },
 async sendCode(phone){if(!/^\+[1-9]\d{7,14}$/.test(phone))throw Error('Usa il prefisso internazionale, per esempio +39.');return request('/auth/v1/otp',{phone,create_user:true});},
 async verify(phone,token){if(!/^\d{6,8}$/.test(token))throw Error('Controlla il codice ricevuto.');return save(await request('/auth/v1/verify',{phone,token,type:'sms'}));},
 async logout(){try{if(session)await request('/auth/v1/logout',{},session.access_token);}finally{session=null;sessionStorage.removeItem(sessionKey);sessionStorage.removeItem('organaizer:pkce');}},
 async rpc(name,args={}) {const token=await this.token();return request('/rest/v1/rpc/'+name,args,token|| (config.supabasePublishableKey?.startsWith('eyJ')?config.supabasePublishableKey:null));}
};
