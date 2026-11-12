export function setupLogin({auth,onAccount,onLocal,onGuest,message,toast,hasInvitation}) {
  const $=selector=>document.querySelector(selector);
  const providers=['google','facebook','phone'];
  let settings={},working=false,phone='';
  function error(text=''){$('#login-error').textContent=text;$('#login-error').hidden=!text;}
  function controls(){
    for(const provider of providers)$('#login-'+provider).disabled=working||!settings[provider];
    for(const id of ['#local-login','#guest-login','#retry-providers','#verify-otp','#change-phone','#resume-login'])$(id).disabled=working;
    $('#login-screen').setAttribute('aria-busy',String(working));
    cooldown();
  }
  function cooldown(){
    const pending=auth.phoneChallenge(),seconds=Math.max(0,Math.ceil(((pending?.nextSendAt||0)-Date.now())/1000));
    $('#send-otp').disabled=working||seconds>0||!settings.phone;
    $('#send-otp').textContent=pending?'Invia un nuovo codice SMS':'Invia codice SMS';
    $('#sms-wait').textContent=seconds?`Puoi richiedere un altro codice fra ${seconds} secondi.`:'';
    $('#sms-wait').hidden=!seconds;
  }
  async function action(callback){
    if(working)return;
    working=true;error();controls();
    try{await callback();}catch(e){error(e.message||'Accesso non riuscito. Riprova.');}
    finally{working=false;controls();}
  }
  function showChallenge(pending){
    if(!pending?.phone)return;
    phone=pending.phone;$('#phone-number').value=phone;$('#phone-number').disabled=true;
    $('#phone-form').hidden=false;$('#otp-form').hidden=false;
    $('#otp-destination').textContent=`Inserisci il codice inviato a ${phone}.`;
    $('#otp-code').value='';cooldown();
  }
  async function refreshProviders(){
    $('#provider-status').textContent='Controllo dei metodi di accesso…';
    try{
      settings=await auth.settings({force:true});
      const active=providers.filter(p=>settings[p]);
      $('#provider-status').textContent=active.length?'Scegli come accedere.':'Gli accessi con account non sono ancora disponibili. Puoi continuare sul dispositivo o aprire un invito.';
      for(const p of providers){const label=$('#login-'+p).querySelector('small');label.textContent=settings[p]?'':'Non ancora disponibile';label.hidden=!!settings[p];}
      if(settings.phone)showChallenge(auth.phoneChallenge());
      else {$('#phone-form').hidden=true;$('#otp-form').hidden=true;}
    }catch(e){
      settings={};$('#provider-status').textContent=navigator.onLine?'Non riesco a verificare i metodi di accesso. Riprova.':'Sei offline. Per accedere serve una connessione.';
      for(const p of providers){const label=$('#login-'+p).querySelector('small');label.hidden=false;label.textContent='Al momento non disponibile';}
    }
    controls();
  }
  for(const provider of ['google','facebook'])$('#login-'+provider).onclick=()=>action(()=>auth.oauth(provider));
  $('#login-phone').onclick=()=>{error();$('#phone-form').hidden=false;$('#phone-number').focus();};
  $('#phone-form').onsubmit=event=>{event.preventDefault();void action(async()=>{
    const pending=await auth.sendCode($('#phone-number').value);showChallenge(pending);$('#otp-code').focus();toast('Codice inviato via SMS.');
  });};
  $('#otp-form').onsubmit=event=>{event.preventDefault();void action(async()=>{
    await auth.verify(phone,$('#otp-code').value);await onAccount();
  });};
  $('#change-phone').onclick=()=>{error();phone='';$('#otp-form').hidden=true;$('#phone-number').disabled=false;$('#phone-number').focus();};
  $('#local-login').onclick=()=>action(onLocal);
  $('#guest-login').hidden=!hasInvitation;$('#guest-description').hidden=!hasInvitation;
  $('#guest-login').onclick=()=>action(async()=>{try{await onGuest();}catch(e){message(e.message);throw e;}});
  $('#retry-providers').onclick=()=>action(refreshProviders);
  $('#resume-login').onclick=()=>action(async()=>{await onAccount();$('#resume-login').hidden=true;});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)cooldown();});
  window.addEventListener('online',()=>{void refreshProviders();});
  setInterval(()=>{if(!$('#phone-form').hidden&&!document.hidden)cooldown();},1000);
  return {refreshProviders};
}
