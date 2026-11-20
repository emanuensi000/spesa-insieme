import config from './config.js';
import {auth} from './auth.js';
import {groupShoppingReferences,publishGroupList} from './shopping-groups.js';
import { createSecret, parseLink, projectItems, activeOffers, availableOffers, romeDate, money, offerPrice, safeSourceUrl, safeLocalFlyer, groupItems, matchesOffer, cartEstimate } from './core.js';
import {shoppingOwner, validPhoto, shoppingFingerprint, createReceipt} from './shopping-history.js';

const $ = selector => document.querySelector(selector);
const configured = Boolean(config.supabaseUrl && config.supabasePublishableKey);
const cacheKey = 'organaizer:v1';
// Compatibilità con le liste e la coda offline salvate prima della rinomina.
const legacyCacheKey = 'spesa-insieme:v1';
let database = { active: null, lists: {} }, link = null, state = null;
let busy = false, catalog = { offers: [], flyers: [] }, currentTab = 'list', installPrompt = null;
let toastTimer, blocked = false;
let offerLimit = 24, openPage = null;
let archivedOffers = [], closing = false;
const expandedItems = new Set();
function itemsNow() { return state ? projectItems(state.base, state.pending) : []; }
function offerItems(offer) { return itemsNow().filter(item => matchesOffer(item, offer)); }
function isSelected(offer) { return offerItems(offer).length > 0; }
function itemOffer(item) { return [...(catalog.offers||[]),...archivedOffers].find(o => matchesOffer(item, o)); }
function photoFor(item) { const offer=itemOffer(item);return validPhoto(item.photo)||validPhoto(offer&&{path:offer.local_page,region:offer.region}); }
function toggleOffer(offer) {
  const existing = offerItems(offer);
  if (existing.length) { enqueueMany(existing.map(item => ({kind:'delete', item_id:item.id, data:{}}))); }
  else if (!addItem(offer.name,offer.size,offer)) return;
}
function productPhoto(offer) {
  if (!offer?.region) return null;
  const source = safeLocalFlyer(offer.local_page) || safeLocalFlyer(catalog.flyers?.[0]?.local_pages?.[offer.page-1]);
  if (!source) return null;
  const frame = document.createElement('span'); frame.className = 'product-photo';
  const img = document.createElement('img'); img.src = source; img.alt = `${offer.brand} ${offer.name}`; img.loading = 'lazy';
  const [x,y,w,h] = offer.region;
  frame.style.aspectRatio = `${w} / ${h}`;
  img.style.width = `${100/w}%`; img.style.left = `${-x/w*100}%`; img.style.top = `${-y/h*100}%`; img.style.height = `${100/h}%`;
  frame.append(img); return frame;
}

function toast(message) {
  $('#toast').textContent = message; $('#toast').hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4000);
}
function notice(message, error = false) {
  $('#notice').hidden = !message; $('#notice').textContent = message; $('#notice').classList.toggle('error', error);
}
function persist() {
  try { localStorage.setItem(cacheKey, JSON.stringify(database)); }
  catch { throw new Error('Il telefono non riesce a salvare le modifiche. Libera spazio o abilita la memoria del browser.'); }
}
function setLink(next) {
  if(link?.id!==next.id)blocked=false;
  draftList=false;link = next; database.active = next;
  state = database.lists[next.id];
  if (!state) database.lists[next.id] = state = { name: 'La spesa condivisa', base: [], pending: [], created: false, loaded: false, localOnly: !configured, token: next.token, historyOwner:shoppingOwner(globalThis.sessionStorage) };
  if (state.token !== next.token) throw new Error('Chiave diversa da quella salvata per questa lista. Apri il link in una finestra privata per verificarlo.');
  // Il frammento non viene inviato all'hosting e non compare nei referrer.
  location.hash = new URLSearchParams({ list: next.id, key: next.token }).toString();
  persist(); render(); renderOffers();
}
let sharedGroup=null,groupRows=[],availableGroups=[],groupLoading=false,groupPromise=null,cyclePromise=null;
let draftList=false,creating=false,groupReady=false,accountUser=null,explicitLink=false;
let accountOwner=shoppingOwner(globalThis.sessionStorage);
function listChoices(){
  const choices=new Map(groupRows.map(ref=>[ref.id,{id:ref.id,name:ref.title}]));
  for(const [id,list] of Object.entries(database.lists)){
    if(sharedGroup){if(list.groupPublication?.groupId===sharedGroup.id||(!list.groupId&&list.historyOwner===accountOwner))choices.set(id,{id,name:list.name});}
    else if(!accountUser&&(list.historyOwner||'organaizer:local')===accountOwner)choices.set(id,{id,name:list.name});
  }
  if(link&&!choices.has(link.id))choices.set(link.id,{id:link.id,name:'Da link · '+state.name});
  return [...choices.values()];
}
function renderListPicker(){
  const slider=$('#shopping-lists'),choices=listChoices(),signature=JSON.stringify(choices);
  const focused=document.activeElement?.dataset?.listId;
  if(slider.dataset.signature!==signature){
    slider.dataset.signature=signature;
    slider.replaceChildren(...choices.map(choice=>{
      const button=document.createElement('button');button.type='button';button.className='list-chip';
      button.dataset.listId=choice.id;button.textContent=choice.name;
      button.onclick=()=>chooseList(choice.id);
      button.onkeydown=event=>{
        const keys=['ArrowLeft','ArrowRight','Home','End'];if(!keys.includes(event.key))return;
        event.preventDefault();const buttons=Array.from(slider.children),index=buttons.indexOf(button);
        const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:Math.max(0,Math.min(buttons.length-1,index+(event.key==='ArrowRight'?1:-1)));
        buttons[next]?.focus();buttons[next]?.scrollIntoView?.({block:'nearest',inline:'nearest',behavior:'instant'});
      };return button;
    }));
    if(focused)Array.from(slider.children).find(button=>button.dataset.listId===focused)?.focus();
  }
  for(const button of slider.children){
    const selected=!draftList&&button.dataset.listId===link?.id;
    button.setAttribute('aria-pressed',String(selected));button.setAttribute('aria-disabled',String(busy||closing||groupLoading||creating));
    if(selected&&slider.dataset.active!==link.id)button.scrollIntoView?.({block:'nearest',inline:'nearest',behavior:'instant'});
  }
  slider.dataset.active=draftList?'':link?.id||'';
  $('#lists-empty').hidden=choices.length>0;
  $('#another-list').disabled=busy||closing||groupLoading||creating;
  $('#create-submit').disabled=busy||closing||groupLoading||creating;
  $('#cancel-create').hidden=!link;$('#shopping-group-label').hidden=!availableGroups.length;
  $('#shopping-group').disabled=busy||closing||groupLoading||creating;
  $('#share-with-group').hidden=!sharedGroup||!link||groupRows.some(ref=>ref.id===link.id)||!!state?.groupPublication;
  $('#share-with-group').disabled=busy||closing||groupLoading||creating;
  $('#rename-shopping').hidden=!sharedGroup||!link||!groupRows.some(ref=>ref.id===link.id)||!!state?.closure;
  $('#rename-shopping').disabled=busy||closing||groupLoading||creating;
}
function clearActiveList(){link=null;state=null;database.active=null;blocked=false;const url=new URL(location.href);url.hash='';history.replaceState(null,'',url.pathname+url.search);persist();}
async function groupLists(){
  if(groupPromise)return groupPromise;
  groupPromise=(async()=>{
    if(!configured||globalThis.sessionStorage?.getItem('organaizer:mode')==='local'){groupReady=true;renderListPicker();return;}
    groupLoading=true;renderListPicker();
    try{
      const user=await auth.user();accountUser=user;
      if(!user){sharedGroup=null;groupRows=[];availableGroups=[];accountOwner='organaizer:local';groupReady=true;return;}
      accountOwner='organaizer:user:'+user.id;sessionStorage.setItem('organaizer:shopping-owner',accountOwner);
      const groups=await auth.rpc('organizer_groups');availableGroups=groups;
      const saved=JSON.parse(localStorage.getItem(accountOwner)||'{}');
      const requested=new URLSearchParams(location.search||'').get('group');
      sharedGroup=groups.find(g=>g.id===requested)||groups.find(g=>g.id===sharedGroup?.id)||groups.find(g=>g.id===saved.active)||groups[0]||null;
      const select=$('#shopping-group');select.replaceChildren();
      for(const group of groups){const option=document.createElement('option');option.value=group.id;option.textContent=group.name;select.append(option);}
      select.value=sharedGroup?.id||'';
      const snapshot=sharedGroup?await auth.rpc('organizer_snapshot',{p_group:sharedGroup.id}):{items:[]};
      groupRows=groupShoppingReferences(snapshot.items,location.href);
      for(const ref of groupRows){
        if(!database.lists[ref.id])database.lists[ref.id]={name:ref.title,base:[],pending:[],created:true,loaded:false,localOnly:false,token:ref.token,historyOwner:accountOwner};
        const savedList=database.lists[ref.id];
        if(savedList.token!==ref.token)continue;
        savedList.groupId=sharedGroup.id;savedList.groupTitle=ref.title;savedList.historyOwner=accountOwner;
        if(!savedList.groupPublication)savedList.name=ref.title;
      }
      groupReady=true;persist();
      const pendingHere=!!state?.groupPublication&&state.groupPublication.groupId===sharedGroup?.id;
      if(!busy&&!closing&&!draftList&&!explicitLink&&(!link||(!groupRows.some(ref=>ref.id===link.id)&&!pendingHere))){
        if(groupRows.length)setLink({id:groupRows[0].id,token:groupRows[0].token});else if(link)clearActiveList();
      }
    }finally{groupLoading=false;render();}
  })().finally(()=>{groupPromise=null;});
  return groupPromise;
}
async function refreshLists(){
  if(cyclePromise)return cyclePromise;
  if(busy||closing||creating)return;
  cyclePromise=(async()=>{
    let discoveryError;
    try{await groupLists();}catch(error){discoveryError=error;}
    await sync();
    for(const [id,list] of Object.entries(database.lists)){
      if(id!==link?.id&&list.historyOwner===accountOwner&&(list.pending.length||list.groupPublication||list.closure?.pending||list.creating))await sync({id,token:list.token});
    }
    if(discoveryError)notice(discoveryError.message||'Non è stato possibile aggiornare le liste del gruppo.',true);
  })().finally(()=>{cyclePromise=null;});
  return cyclePromise;
}
function chooseList(id){if(busy||closing||groupLoading||creating)return;if(!database.lists[id])return;explicitLink=!groupRows.some(ref=>ref.id===id);setLink({id,token:database.lists[id].token});void sync();}
$('#shopping-group').onchange=event=>{
  if(busy||closing||groupLoading||creating){renderListPicker();return;}
  const chosen=event.target.value;if(!availableGroups.some(group=>group.id===chosen))return;
  const url=new URL(location.href);url.searchParams.set('group',chosen);url.hash='';history.replaceState(null,'',url.pathname+url.search);
  explicitLink=false;draftList=false;clearActiveList();void refreshLists();
};
function newList(){if(busy||closing||groupLoading||creating)return;draftList=true;render();$('#list-name').focus();}
$('#another-list').onclick=newList;
$('#cancel-create').onclick=()=>{draftList=false;render();};
$('#rename-shopping').onclick=async()=>{
  if(busy||groupLoading||closing||!sharedGroup)return;
  const name=prompt('Nome della lista',state.name)?.trim();if(!name)return;if(name.length>80){toast('Il nome può avere al massimo 80 caratteri.');return;}
  creating=true;renderListPicker();
  try{const snapshot=await auth.rpc('organizer_snapshot',{p_group:sharedGroup.id}),ref=groupShoppingReferences(snapshot.items,location.href).find(ref=>ref.id===link.id);if(!ref)throw Error('La lista non è più presente nel gruppo.');await auth.rpc('organizer_save',{p_group:sharedGroup.id,p_id:ref.resourceId,p_kind:'shopping',p_data:{...ref.data,title:name},p_version:ref.version,p_deleted:false});await groupLists();toast('Nome aggiornato per il gruppo.');}catch(error){notice(error.message,true);}finally{creating=false;render();}
};
$('#share-with-group').onclick=async()=>{
  if(busy||groupLoading||closing||!sharedGroup||!link||!confirm('Condividere questa lista con '+sharedGroup.name+'?'))return;
  const previous=structuredClone(state);
  try{
    if(state.localOnly){const products=itemsNow();state.pending=products.flatMap(item=>[{op_id:crypto.randomUUID(),item_id:item.id,kind:'add',data:{name:item.name,quantity:item.quantity||'',note:item.note||'',price:item.price??null,created_at:item.created_at}},...(item.checked?[{op_id:crypto.randomUUID(),item_id:item.id,kind:'check',data:{checked:true}}]:[])]);state.base=[];state.localOnly=false;state.creating=true;state.created=false;}
    state.groupPublication={groupId:sharedGroup.id,resourceId:crypto.randomUUID(),name:state.name,href:location.href};
    try{persist();}catch(error){database.lists[link.id]=state=previous;throw error;}
    explicitLink=false;render();await sync();await groupLists();
  }catch(error){notice(error.message,true);render();}
};
async function rpc(name, args) {
  const headers = { 'Content-Type': 'application/json', apikey: config.supabasePublishableKey };
  // Le nuove publishable key non sono JWT; l'header Bearer serve solo per le anon key legacy.
  if (config.supabasePublishableKey.startsWith('eyJ')) headers.Authorization = `Bearer ${config.supabasePublishableKey}`;
  const response = await fetch(`${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/${name}`, {
    method: 'POST', headers, body: JSON.stringify(args), signal: AbortSignal.timeout(15000), cache: 'no-store', referrerPolicy: 'no-referrer'
  });
  if (!response.ok) {
    const error = new Error(response.status === 401 || response.status === 403 ? 'Accesso rifiutato: controlla il link e la configurazione del servizio.' : 'Connessione non riuscita. Le modifiche restano sul telefono.');
    error.status = response.status;
    try{error.code=(await response.json()).code;}catch{}
    throw error;
  }
  return response.status === 204 ? null : response.json();
}
function render() {
  renderListPicker();
  $('#welcome').hidden = Boolean(link)&&!draftList; $('#workspace').hidden = !link||draftList;
  if (!link) return;
  $('#list-title').textContent = state.name;
  $('#share').disabled = !configured || state.localOnly || !state.created || !state.loaded;
  const items = projectItems(state.base, state.pending);
  const closed=!!state.closure;
  $('#new-shopping').disabled=busy||closing||blocked;
  $('#add-form').hidden=closed;$('#close-shopping').hidden=closed||!items.length;
  $('#close-shopping').disabled=blocked||busy||closing||!state.loaded;
  $('#closed-shopping').hidden=!closed;
  $('#closed-description').textContent=closed?`Spesa del ${state.closure.receipt.date.split('-').reverse().join('/')} · Totale ${money(state.closure.receipt.amount_cents/100)}. ${state.closure.pending?'Chiusura salvata sul dispositivo, in attesa di sincronizzazione.':'Archiviata nello storico del Profilo.'}`:'';
  const remaining = items.filter(item => !item.checked), done = items.filter(item => item.checked);
  $('#list-count').textContent = remaining.length;
  $('#remaining').textContent = `${remaining.length} ${remaining.length === 1 ? 'prodotto' : 'prodotti'}`;
  $('#done-count').textContent = done.length;
  $('#empty').hidden = items.length > 0;
  $('#done-section').hidden = true;
  $('#clear-done').hidden = closed || done.length === 0;
  renderItems($('#items'), items); $('#done-items').replaceChildren();
  const estimate = cartEstimate(items);
  $('#list-total').hidden = !items.length;
  $('#estimate-total').textContent = money(estimate.total);
  $('#estimate-detail').textContent = `Da acquistare ${money(estimate.remaining)} · Già nel carrello ${money(estimate.checked)}`;
  $('#estimate-note').textContent = `${estimate.unpriced ? `${estimate.unpriced} ${estimate.unpriced === 1 ? 'unità senza prezzo esclusa' : 'unità senza prezzo escluse'}. ` : ''}Stima ai prezzi annotati del volantino. Per i prodotti a peso: quantità in kg o etti; verifica peso, validità e condizioni in negozio.`;

}
function renderItems(container, items) {
  const signature = JSON.stringify([items.map(i=>[i.id,i.name,i.quantity,i.note,i.price,i.checked]),[...expandedItems],!!state.closure,catalog.offers.length]);
  if (container.dataset.renderSignature === signature) return;
  container.dataset.renderSignature = signature;
  const previous = new Map(Array.from(container.children, row => [row.dataset.itemId, {rect:row.getBoundingClientRect?.(), checked:row.dataset.checked, moving:row.dataset.moving === 'true'}]));
  const focusedId = document.activeElement?.classList?.contains('check') ? document.activeElement.closest('.item')?.dataset.itemId : null;
  const groups = groupItems(items).sort((a,b) => Number(a[0].checked) - Number(b[0].checked));
  const reordered = groups.some(group => previous.has(group[0].id) && previous.get(group[0].id).checked !== String(group[0].checked));
  const animateReorder = reordered && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  container.replaceChildren(...groups.map(group => {
    const item = group[0];
    const li = document.createElement('li'); li.className = `item${item.checked ? ' checked' : ''}${item.checked && !expandedItems.has(item.id) ? ' collapsed' : ''}`;
    li.dataset.itemId = item.id; li.dataset.checked = String(item.checked);
    const old = previous.get(item.id);
    if (item.checked && li.animate && !expandedItems.has(item.id) && (animateReorder && old?.checked === 'false' || old?.moving)) {
      li.className = 'item checked is-reordering'; li.dataset.moving = 'true';
    }
    const check = document.createElement('button'); check.className = 'check'; check.textContent = item.checked ? '✓' : '';
    check.disabled=!!state.closure;
    check.setAttribute('aria-label', `${item.checked ? 'Da acquistare' : 'Segna acquistato'}: ${item.name}`);
    check.setAttribute('aria-pressed', String(item.checked));
    check.onclick = () => { expandedItems.delete(item.id); enqueueMany(group.map(unit => ({kind:'check',item_id:unit.id,data:{checked:!item.checked}}))); };
    const info = document.createElement('div'); info.className = 'item-info';
    const name = document.createElement('span'); name.className = 'item-name'; name.textContent = item.name; info.append(name);
    const detail = document.createElement('span'); detail.className = 'item-detail'; detail.textContent = [item.quantity, item.price != null ? `${money(item.price)} per ${itemOffer(item)?.size === 'al kg' ? 'kg' : itemOffer(item)?.size === '100 g' ? 'etto' : 'pezzo'}` : '', item.note].filter(Boolean).join(' · '); info.append(detail);
    const savedPhoto=photoFor(item),photo = productPhoto(savedPhoto?{name:item.name,brand:'',local_page:savedPhoto.path,region:savedPhoto.region}:itemOffer(item)); if (photo) li.append(photo); else { const placeholder = document.createElement('span'); placeholder.className = 'item-placeholder'; placeholder.textContent = '✳'; placeholder.setAttribute('aria-hidden','true'); li.append(placeholder); } li.append(info);
    const controls = document.createElement('div'); controls.className = 'quantity-controls';
    const minus = document.createElement('button'); minus.textContent = '−'; minus.setAttribute('aria-label', `Diminuisci quantità di ${item.name}`); minus.disabled = group.length <= 1; minus.onclick = () => enqueue('delete', group.at(-1).id, {});
    const amount = document.createElement('input'); amount.type = 'number'; amount.min = '1'; amount.max = '99'; amount.step = '1'; amount.value = group.length; amount.inputMode = 'numeric'; amount.setAttribute('aria-label', `Quantità di ${item.name}`);
    const copyUnit = () => { const id = crypto.randomUUID(); return [{kind:'add',item_id:id,data:{name:item.name,quantity:item.quantity,note:item.note,price:item.price,created_at:new Date().toISOString()}}, ...(item.checked ? [{kind:'check',item_id:id,data:{checked:true}}] : [])]; };
    const setAmount = value => {
      if (!Number.isInteger(value) || value < 1 || value > 99) { amount.value = group.length; toast('Inserisci una quantità intera da 1 a 99.'); return; }
      const operations = value < group.length ? group.slice(value).map(unit => ({kind:'delete',item_id:unit.id,data:{}})) : Array.from({length:value-group.length},copyUnit).flat();
      if (operations.length && !enqueueMany(operations)) amount.value = group.length;
    };
    amount.onchange = () => setAmount(Number(amount.value));
    amount.onkeydown = event => { if (event.key === 'Enter') { event.preventDefault(); amount.blur(); } };
    const plus = document.createElement('button'); plus.textContent = '+'; plus.setAttribute('aria-label', `Aumenta quantità di ${item.name}`); plus.disabled = group.length >= 99; plus.onclick = () => setAmount(group.length+1);
    controls.append(minus,amount,plus); const unit = document.createElement('span'); unit.className = 'quantity-unit'; unit.textContent = itemOffer(item)?.size === 'al kg' ? 'kg' : itemOffer(item)?.size === '100 g' ? 'etti' : 'pezzi'; controls.append(unit);
    const meta = document.createElement('div'); meta.className = 'item-meta'; meta.append(controls); li.append(meta);
    if (item.price !== null && item.price !== undefined) { const price = document.createElement('span'); price.className = 'price-tag'; price.textContent = money(item.price * group.length); meta.append(price); }
    const remove = document.createElement('button'); remove.className = 'delete'; remove.textContent = '×'; remove.setAttribute('aria-label', `Rimuovi ${item.name}`); remove.onclick = () => { enqueueMany(group.map(unit => ({kind:'delete',item_id:unit.id,data:{}}))); }; meta.append(remove);
    if (item.checked) {
      const reopen = document.createElement('button'); reopen.className = 'item-toggle'; reopen.textContent = expandedItems.has(item.id) ? 'Riduci' : 'Apri'; reopen.setAttribute('aria-expanded',String(expandedItems.has(item.id))); reopen.setAttribute('aria-label',`${expandedItems.has(item.id) ? 'Riduci' : 'Apri'} ${item.name}`);
      reopen.onclick = () => { if (expandedItems.has(item.id)) expandedItems.delete(item.id); else expandedItems.add(item.id); render(); }; info.append(reopen);
      const summary = document.createElement('span'); summary.className = 'item-summary'; summary.textContent = `${group.length} ${unit.textContent}${item.price != null ? ` · ${money(item.price * group.length)}` : ''}`; info.append(summary);
    }
    if(state.closure){minus.disabled=true;plus.disabled=true;amount.disabled=true;remove.hidden=true;}
    li.append(check);
    return li;
  }));
  for (const row of container.children) {
    const old = previous.get(row.dataset.itemId), before = old?.rect;
    if (!before || !row.animate || !(animateReorder || old?.moving)) continue;
    const after = row.getBoundingClientRect();
    if (!after.width) continue;
    const dx = before.left-after.left, dy = before.top-after.top;
    const distance = Math.hypot(dx,dy);
    const moving = row.dataset.moving === 'true';
    // Solo traslazione della card intera: nessuna scala, dissolvenza o salto.
    const movement = distance >= 1 ? row.animate([
      {transform:`translate(${dx}px, ${dy}px)`}, {transform:'translate(0, 0)'}
    ], {duration:distance / .9,easing:'linear'}) : null;
    if (moving) {
      const settle = () => {
        if (!row.isConnected) return;
        const height = row.getBoundingClientRect().height;
        row.dataset.moving = 'false'; row.classList.remove('is-reordering'); row.classList.add('collapsed');
        const compactHeight = row.getBoundingClientRect().height;
        if (Math.abs(height-compactHeight) < 1) return;
        // Si compatta soltanto dopo l'arrivo. L'altezza muove il layout senza deformare il testo.
        row.style.overflow = 'hidden';
        const resize = row.animate([{height:`${height}px`},{height:`${compactHeight}px`}],{duration:220,easing:'ease-out'});
        resize.finished.catch(()=>{}).then(()=>{row.style.overflow='';});
      };
      if (movement) movement.finished.then(settle,()=>{}); else settle();
    }
  }
  if (focusedId) Array.from(container.children).find(row => row.dataset.itemId === focusedId)?.querySelector('.check')?.focus({preventScroll:true});
}
function enqueue(kind, item_id, data) { return enqueueMany([{kind, item_id, data}]); }
function enqueueMany(operations) {
  if(state?.closure){toast('Questa spesa è chiusa. Crea una nuova lista per altri acquisti.');return false;}
  if (!state || blocked || (!state.loaded && !state.created)) { toast('Attendi il caricamento della lista prima di modificarla.'); return false; }
  if (state.pending.length + operations.length > 500) { toast('Troppe modifiche in attesa. Ricollegati per sincronizzarle.'); return false; }
  const previous = state.pending;
  state.pending = [...previous, ...operations.map(operation => ({...operation,op_id:crypto.randomUUID()}))];
  try { persist(); } catch (error) { state.pending = previous; toast(error.message); return false; }
  render(); renderOffers(); if ($('#page-dialog').open) renderPageProducts(); void sync(); return true;
}

function addItem(name, quantity = '', offer = null) {
  if(typeof name!=='string'||!name.trim()||(!offer&&name.trim().length>160)){toast('Inserisci un nome prodotto da 1 a 160 caratteri.');return false;}
  const date = value => value.split('-').reverse().join('/');
  const title = offer ? [offer.brand, name].filter(Boolean).join(' ') : name;
  const note = offer ? `Offerta dal ${date(offer.valid_from)} al ${date(offer.valid_until)} · pag. ${offer.page}${offer.discount_percent ? ` · sconto ${offer.discount_percent}%` : ''}${offer.conditions ? ` · ${offer.conditions}` : ''}` : '';
  return enqueue('add', crypto.randomUUID(), { name: title.trim().slice(0,160), quantity: quantity.trim(), note: note.slice(0,500), price: offer?.price ?? null, created_at: new Date().toISOString() });
}
async function sync(target=link) {
  const list=target&&database.lists[target.id];
  if (!list || list.localOnly || !configured || busy || !navigator.onLine || (blocked&&target.id===link?.id)) return;
  busy = true;renderListPicker();
  let sharingError='';
  try {
    const credentials = { p_list_id: target.id, p_token: target.token };
    if (!list.created && list.creating) {
      await rpc('create_shared_list', { ...credentials, p_name: list.name });
      list.created = true; list.loaded = true; delete list.creating; persist();
    }
    if(list.groupPublication){
      try{await publishGroupList({list,id:target.id,token:target.token,publish:args=>auth.rpc('organizer_save',args),snapshot:groupId=>auth.rpc('organizer_snapshot',{p_group:groupId}),persist});}
      catch(error){sharingError='La lista è salvata, ma la condivisione con il gruppo non è riuscita. Verrà ritentata: '+error.message;}
    }
    // Acquisisce prima i permessi; non invia modifiche ad un link non verificato.
    if (!list.loaded) {
      const snapshot = await rpc('read_shared_list', credentials);
      receiveSnapshot(snapshot,list); list.created = true; list.loaded = true; persist();
    }
    let count = 0;
    while (list.pending.length && count++ < 50) {
      const operation = list.pending[0];
      let snapshot;
      try { snapshot = await rpc('apply_list_operation', { ...credentials, p_operation: operation }); }
      catch(error){const latest=await rpc('read_shared_list',credentials).catch(()=>null);if(latest?.receipt){receiveSnapshot(latest,list);persist();notice('La spesa è stata chiusa da un partecipante. Le modifiche non accettate restano conservate sul dispositivo.',true);return;}throw error;}
      const previousBase = list.base;
      list.base = snapshot.items; list.pending.shift();
      try { persist(); } catch (error) { list.base = previousBase; list.pending.unshift(operation); throw error; }
    }
    const snapshot = await rpc('read_shared_list', credentials);
    receiveSnapshot(snapshot,list); persist(); notice(sharingError,!!sharingError);
    if(list.closure?.pending){
      const closure=list.closure;
      try{
        const closed=await rpc('close_shared_list',{...credentials,p_expected:closure.expected,p_amount:closure.receipt.amount_cents,p_date:closure.receipt.date,p_photos:Object.fromEntries(closure.receipt.items.filter(i=>i.photo).map(i=>[i.id,i.photo]))});
        receiveSnapshot(closed,list);persist();
      }catch(error){
        const latest=await rpc('read_shared_list',credentials).catch(()=>null);
        if(latest?.receipt){receiveSnapshot(latest,list);persist();}
        else if(error.code==='40001'||error.status===409){delete list.closure;if(latest)receiveSnapshot(latest,list);persist();notice('La lista è cambiata su un altro dispositivo. Controlla i prodotti e conferma di nuovo la chiusura.',true);}
        else notice(error.status===404?'Chiusura e storico salvati su questo dispositivo. La sincronizzazione della chiusura richiede l’attivazione del database aggiornato.':'Chiusura salvata sul dispositivo; la sincronizzazione verrà ritentata al ritorno della connessione.',true);
      }
    }
  } catch (error) {
    if ((error.status === 401 || error.status === 403)&&target.id===link?.id) blocked = true;
    notice(error.message || 'Connessione assente. Le modifiche restano sul telefono.', true);
  } finally { busy = false; render(); renderOffers(); if ($('#page-dialog').open) renderPageProducts(); }
}
function receiveSnapshot(snapshot,list=state){
  list.base=snapshot.items;list.name=list.groupTitle||snapshot.name;
  if(snapshot.receipt){if(list.pending.length)list.rejected=[...(list.rejected||[]),...list.pending];list.pending=[];list.closure={receipt:snapshot.receipt,pending:false};}
}
function renderOffers() {
  const todayOffers = activeOffers(catalog.offers ?? []);
  const pool = availableOffers(catalog.offers ?? [], $('#offer-validity').value);
  const query = $('#offer-search').value.trim().toLocaleLowerCase('it');
  const category = $('#offer-category').value;
  const page = $('#offer-page').value;
  const filtered = pool.filter(o => (!category || o.category === category) && (!page || o.page === Number(page)) && `${o.name} ${o.brand} ${o.size}`.toLocaleLowerCase('it').includes(query));
  $('#offers').replaceChildren(...filtered.slice(0,offerLimit).map(offer => {
    const card = document.createElement('article'); card.className = `offer-card${isSelected(offer) ? ' is-selected' : ''}`;
    const photo = productPhoto(offer); if (photo) card.append(photo);
    const today = romeDate();
    const validity = offer.valid_from > today ? `Dal ${offer.valid_from.split('-').reverse().join('/')}` : offer.valid_until < today ? 'Offerta scaduta' : 'In corso';
    const badge = document.createElement('span'); badge.className = `validity-badge${offer.valid_from > today ? ' upcoming' : offer.valid_until < today ? ' expired' : ''}`; badge.textContent = validity; card.append(badge);
    for (const [tag, value, cls] of [['span', offer.category, 'eyebrow'], ['h3', offer.name, ''], ['p', [offer.brand, offer.size].filter(Boolean).join(' · '), ''], ['strong', offerPrice(offer), ''], ['p', `${offer.unit_price || ''}${offer.unit_price ? ' · ' : ''}Fino al ${offer.valid_until.split('-').reverse().join('/')}`, '']]) {
      const element = document.createElement(tag); element.textContent = value; element.className = cls; card.append(element);
    }
    if (offer.conditions) { const conditions = document.createElement('p'); conditions.textContent = offer.conditions; card.append(conditions); }
    const source = document.createElement('button'); source.className = 'source-button'; source.textContent = `Vedi sul volantino · pag. ${offer.page}`; source.onclick = () => showPage(offer.page); card.append(source);
    const button = document.createElement('button'); button.className = 'secondary'; button.textContent = isSelected(offer) ? '✓ Nella lista · rimuovi' : '+ Aggiungi alla lista'; button.setAttribute('aria-pressed',String(isSelected(offer))); button.onclick = () => toggleOffer(offer);
    button.disabled=!!state?.closure;
    card.onclick = event => { if (!event.target.closest('button')) toggleOffer(offer); }; card.append(button);
    return card;
  }));
  $('#no-offers').hidden = filtered.length > 0;
  $('#offer-results').textContent = `${filtered.length} offerte trovate · ${Math.min(offerLimit,filtered.length)} mostrate`;
  $('#more-offers').hidden = filtered.length <= offerLimit;

  const total = catalog.offers?.length || 0;
  const upcoming = (catalog.offers ?? []).filter(o => o.valid_from > romeDate()).length;
  $('#catalog-status').textContent = total ? `${total} offerte trascritte · ${todayOffers.length} valide oggi${upcoming ? ` · ${upcoming} in arrivo` : ''}. ${catalog.completeness === 'reviewed' ? 'Lette tutte le 20 pagine; varianti della stessa offerta raggruppate.' : 'Catalogo parziale: consulta anche il volantino.'} Le condizioni e i prezzi originali restano verificabili aprendo la pagina.` : 'Il catalogo prodotti è ancora da compilare. Le pagine originali sono disponibili qui sotto; i prodotti verranno mostrati dopo l’importazione del CSV.';
}

function showPage(page) {
  const total = catalog.flyers?.[0]?.pages?.length || 0;
  if (page < 1 || page > total) return;
  openPage = page;
  $('#previous-page').disabled = page === 1; $('#next-page').disabled = page === total;
  $('#page-position').textContent = `${page} / ${total}`;
  $('#page-jump').value = String(page);
  const flyer = catalog.flyers?.[0];
  const source = safeLocalFlyer(flyer?.local_pages?.[page-1]) || safeSourceUrl(flyer?.pages?.[page-1]);
  if (!source) return;
  $('#page-title').textContent = `Volantino · pagina ${page}`;
  $('#page-image').src = source; $('#page-image').alt = `Pagina originale ${page}`;
  renderPageProducts();
  $('#page-dialog').scrollTop = 0;
  if (!$('#page-dialog').open) $('#page-dialog').showModal();
}
function renderPageProducts() {
  const products = (catalog.offers ?? []).filter(o => o.page === openPage);
  $('#page-hotspots').replaceChildren(...products.filter(o => o.region).map(offer => {
    const button = document.createElement('button'); button.className = `product-hotspot${isSelected(offer) ? ' selected' : ''}`;
    const [x,y,w,h] = offer.region; Object.assign(button.style,{left:`${x*100}%`,top:`${y*100}%`,width:`${w*100}%`,height:`${h*100}%`});
    button.setAttribute('aria-label',`${isSelected(offer) ? 'Rimuovi' : 'Aggiungi'} ${offer.brand} ${offer.name} · ${offerPrice(offer)}`); button.setAttribute('aria-pressed',String(isSelected(offer)));
    button.title = `${offer.brand} ${offer.name} · ${offerPrice(offer)}`; button.textContent = isSelected(offer) ? '✓' : '+'; button.onclick = () => toggleOffer(offer); return button;
  }));
  $('#page-products').replaceChildren(...products.map(offer => {
    const label = document.createElement('label'); label.className = 'page-product';
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = isSelected(offer);
    input.onchange = () => toggleOffer(offer);
    input.disabled=!!state?.closure;
    const text = document.createElement('span'); text.textContent = `${offer.brand} ${offer.name} · ${offer.size}`.trim();
    const price = document.createElement('strong'); price.textContent = offerPrice(offer);
    label.append(input,text,price); return label;
  }));
  if (!products.length) { const note = document.createElement('p'); note.textContent = 'Questa pagina contiene iniziative e condizioni del punto vendita, senza altri prodotti da aggiungere.'; $('#page-products').append(note); }

}
async function loadCatalog() {
  try {
    const response = await fetch('./data/offers.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(); catalog = await response.json();
    try{const archive=await fetch('./data/archived-offers.json');if(archive.ok)archivedOffers=(await archive.json()).offers||[];}catch{}
    const categories = [...new Set((catalog.offers ?? []).map(o => o.category))].sort();
    for (const category of categories) { const option = document.createElement('option'); option.value = category; option.textContent = category; $('#offer-category').append(option); }
    renderOffers(); render();
    const flyer = catalog.flyers?.[0];
    if (!flyer) { $('#flyer-note').textContent = 'Volantino non ancora acquisito. Usa il collegamento al sito ufficiale.'; return; }
    $('#open-flyer').disabled = false;
    $('#flyer-note').textContent = `${flyer.pages.length} pagine${flyer.local_pages ? ' scaricate nel progetto e disponibili offline' : ''} · ${flyer.valid_from ? `validità ${flyer.valid_from.split('-').reverse().join('/')} – ${flyer.valid_until.split('-').reverse().join('/')}` : 'verifica la validità sulla copertina'}. Tocca una pagina per aprirla e scegliere i prodotti.`;
    $('#flyer-link').href = safeSourceUrl(flyer.url) || 'https://www.ipertriscount.it/volantini'; $('#flyer-link').hidden = false;
    const pdf = safeLocalFlyer(flyer.local_pdf); if (pdf) { $('#pdf-link').href = pdf; $('#pdf-link').hidden = false; }
    $('#flyer-pages').replaceChildren(...flyer.pages.map((url, index) => {
      const source = safeLocalFlyer(flyer.local_pages?.[index]) || safeSourceUrl(url); if (!source) return document.createTextNode('');
      const option = document.createElement('option'); option.value = String(index+1); option.textContent = `Pagina ${index+1}`; $('#offer-page').append(option);
      const jump = option.cloneNode(true); $('#page-jump').append(jump);
      const a = document.createElement('button'); a.className = 'flyer-page'; a.onclick = () => showPage(index+1);
      const img = document.createElement('img'); img.src = source; img.alt = `Volantino originale, pagina ${index + 1}`; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
      const label = document.createElement('span'); label.textContent = `Pagina ${index + 1} · scegli prodotti`; a.append(img, label); return a;
    }));
    $('#promotions').replaceChildren(...(catalog.promotions ?? []).map(promotion => {
      const article = document.createElement('article'); article.className = 'promotion';
      const title = document.createElement('h3'); title.textContent = promotion.title;
      const text = document.createElement('p'); text.textContent = promotion.text;
      const button = document.createElement('button'); button.className = 'source-button'; button.textContent = `Leggi le condizioni · pagina ${promotion.page}`; button.onclick = () => showPage(promotion.page);
      article.append(title,text,button); return article;
    }));
  } catch { $('#catalog-status').textContent = 'Impossibile caricare le offerte. Riprova quando torna la connessione.'; $('#flyer-note').textContent = 'Il volantino è disponibile sul sito ufficiale.'; }
}

$('#create-form').onsubmit=async event=>{
  event.preventDefault();const name=$('#list-name').value.trim();if(!name||creating||busy||closing||groupLoading)return;
  creating=true;renderListPicker();
  try{
    await groupLists();
    if(accountUser&&!sharedGroup)throw Error('Crea un gruppo dalla Home prima di aggiungere una lista condivisa.');
    if(configured&&!groupReady)throw Error('Non è stato possibile verificare il gruppo. Riprova.');
    const next={id:crypto.randomUUID(),token:createSecret()},localOnly=!configured||globalThis.sessionStorage?.getItem('organaizer:mode')==='local';
    const publication=sharedGroup?{groupId:sharedGroup.id,resourceId:crypto.randomUUID(),name,href:location.href}:null;
    database.lists[next.id]={name,base:[],pending:[],created:localOnly,creating:!localOnly,loaded:localOnly,localOnly,token:next.token,historyOwner:accountOwner,...(publication?{groupId:sharedGroup.id,groupPublication:publication}:{})};
    explicitLink=false;setLink(next);await sync();await groupLists();
  }catch(error){notice(error.message,true);}finally{creating=false;render();}
};
$('#close-shopping').onclick=()=>{
  const products=itemsNow(),purchased=products.filter(i=>i.checked),estimate=cartEstimate(purchased);
  if(!purchased.length){toast('Spunta almeno un prodotto acquistato prima di chiudere la spesa.');return;}
  $('#checkout-amount').value=estimate.total.toFixed(2);$('#checkout-date').value=romeDate();$('#checkout-date').max=romeDate();
  $('#checkout-description').textContent=`${purchased.length} unità acquistate; ${products.length-purchased.length} non acquistate, conservate nel dettaglio ed escluse dalla stima.${estimate.unpriced?` ${estimate.unpriced} unità senza prezzo: inserisci il totale dello scontrino.`:''}`;
  $('#checkout-error').hidden=true;$('#checkout-dialog').showModal();
};
$('#checkout-form').onsubmit=async event=>{
  event.preventDefault();if(closing||!state||state.closure)return;closing=true;$('#confirm-checkout').disabled=true;
  try{
    if(blocked)throw Error('Ricarica la pagina prima di chiudere la spesa.');
    const products=itemsNow(),receipt=createReceipt({id:link.id,name:state.name,items:products,amount:$('#checkout-amount').value,date:$('#checkout-date').value,photoFor});
    const previous=state.closure;
    state.closure={receipt,expected:shoppingFingerprint(products),pending:!state.localOnly&&configured};
    if(!state.historyOwner)state.historyOwner=shoppingOwner(globalThis.sessionStorage);
    try{persist();}catch(error){state.closure=previous;throw error;}
    $('#checkout-dialog').close();render();renderOffers();await sync();toast(state.closure?'Spesa salvata nello storico.':'Controlla le modifiche prima di chiudere.');
  }catch(error){$('#checkout-error').textContent=error.message;$('#checkout-error').hidden=false;}
  finally{closing=false;$('#confirm-checkout').disabled=false;render();}
};
$('#new-shopping').onclick=newList;
$('#add-form').onsubmit = event => { event.preventDefault(); const input = $('#product-name'); if (input.value.trim() && addItem(input.value, $('#quantity').value)) { input.value = ''; $('#quantity').value = ''; input.focus(); } };
$('#clear-done').onclick = () => { const done = projectItems(state.base, state.pending).filter(i => i.checked); if (confirm(`Rimuovere ${done.length} prodotti acquistati?`)) enqueueMany(done.map(i => ({kind:'delete',item_id:i.id,data:{}}))); };
for (const tab of document.querySelectorAll('[data-tab]')) tab.onclick = () => {
  currentTab = tab.dataset.tab;
  for (const other of document.querySelectorAll('[data-tab]')) { const selected = other === tab; other.classList.toggle('selected', selected); other.setAttribute('aria-pressed', String(selected)); }
  $('#list-panel').hidden = currentTab !== 'list'; $('#offers-panel').hidden = currentTab !== 'offers';
};
$('#offer-search').oninput = () => { offerLimit = 24; renderOffers(); };
for (const id of ['#offer-category','#offer-validity','#offer-page']) $(id).onchange = () => { offerLimit = 24; renderOffers(); };
$('#more-offers').onclick = () => { offerLimit += 24; renderOffers(); };
$('#previous-page').onclick = () => showPage(openPage-1);
$('#next-page').onclick = () => showPage(openPage+1);
$('#page-jump').onchange = event => showPage(Number(event.target.value));
$('#open-flyer').onclick = () => showPage(openPage || 1);
$('#page-dialog').addEventListener('keydown', event => { if (!event.target.closest('input,select,textarea') && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) { event.preventDefault(); showPage(openPage + (event.key === 'ArrowLeft' ? -1 : 1)); } });
const pageCanvas = $('#page-canvas');
let pageTouch = null, blockPageTap = false;
const pageIsZoomed = () => (window.visualViewport?.scale ?? 1) > 1.01;
// A zoom attivo entrambi gli assi sono affidati al browser. A scala normale
// il gesto orizzontale resta disponibile per sfogliare le pagine.
const updatePageZoom = () => pageCanvas.classList.toggle('is-zoomed', pageIsZoomed());
window.visualViewport?.addEventListener('resize', updatePageZoom);
updatePageZoom();
pageCanvas.addEventListener('touchstart', event => {
  if (event.touches.length !== 1) { pageTouch = null; blockPageTap = true; return; }
  const touch = event.touches[0];
  pageTouch = {x:touch.clientX, y:touch.clientY, time:event.timeStamp, canSwipe:!pageIsZoomed()};
  blockPageTap = false;
}, {passive:true});
pageCanvas.addEventListener('touchmove', event => {
  if (event.touches.length !== 1) { pageTouch = null; blockPageTap = true; return; }
  if (!pageTouch) return;
  const touch = event.touches[0];
  if (Math.hypot(touch.clientX-pageTouch.x, touch.clientY-pageTouch.y) > 10) blockPageTap = true;
  if (pageIsZoomed()) pageTouch.canSwipe = false;
}, {passive:true});
pageCanvas.addEventListener('touchend', event => {
  if (!pageTouch) return;
  const start = pageTouch; pageTouch = null;
  const touch = event.changedTouches[0];
  const dx = touch.clientX-start.x, dy = touch.clientY-start.y;
  if (event.touches.length || event.timeStamp-start.time > 350 || Math.hypot(dx,dy) > 10) blockPageTap = true;
  if (!event.touches.length && start.canSwipe && !pageIsZoomed() && Math.abs(dx)>60 && Math.abs(dx)>Math.abs(dy)*1.5) {
    blockPageTap = true; showPage(openPage+(dx<0?1:-1));
  }
}, {passive:true});
pageCanvas.addEventListener('touchcancel', () => { pageTouch = null; blockPageTap = true; }, {passive:true});
pageCanvas.addEventListener('contextmenu', event => { event.preventDefault(); blockPageTap = true; });
pageCanvas.addEventListener('pointerdown', event => { if (event.pointerType === 'mouse') blockPageTap = false; });
pageCanvas.addEventListener('click', event => {
  // I click da tastiera e tecnologie assistive rimangono disponibili.
  if (event.detail !== 0 && blockPageTap) { event.preventDefault(); event.stopImmediatePropagation(); }
}, true);
$('#share').onclick = () => { $('#share-url').value = location.href; $('#native-share').hidden = !navigator.share; $('#share-dialog').showModal(); };
$('#copy-link').onclick = async () => { try { await navigator.clipboard.writeText(location.href); toast('Link copiato'); } catch { $('#share-url').select(); toast('Seleziona e copia il link'); } };
$('#native-share').onclick = async () => { try { await navigator.share({ title: state.name, text: 'Organizziamo la spesa con OrganAIzer', url: location.href }); } catch (error) { if (error.name !== 'AbortError') toast('Invio non riuscito. Puoi copiare il link.'); } };
$('#help').onclick = () => $('#info-dialog').showModal();
for (const close of document.querySelectorAll('dialog .close')) close.onclick = () => close.closest('dialog').close();
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; $('#install').hidden = false; });
$('#install').onclick = async () => { if (installPrompt) { await installPrompt.prompt(); installPrompt = null; $('#install').hidden = true; } };
window.addEventListener('online', () => { render(); void refreshLists(); }); window.addEventListener('offline', render);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { renderOffers(); void refreshLists(); } });
// Ogni scheda ha un solo writer della propria coda. Evita che due schede si sovrascrivano.
window.addEventListener('storage', event => { if (event.key === cacheKey || event.key === legacyCacheKey) { notice('La lista è stata aggiornata in un’altra scheda. Ricarica questa pagina per continuare.', true); blocked = true; render(); } });
window.addEventListener('hashchange', () => { try { const next = parseLink(location.hash); if (next && (next.id !== link?.id || next.token !== link?.token)) location.reload(); } catch (error) { notice(error.message, true); } });
try {
  let stored = localStorage.getItem(cacheKey);
  if (stored === null) {
    const legacy = localStorage.getItem(legacyCacheKey);
    if (legacy !== null) {
      // Prima valida, poi copia. Conserva l’originale anche se la memoria è piena.
      JSON.parse(legacy);
      localStorage.setItem(cacheKey, legacy);
      stored = legacy;
    }
  }
  database = JSON.parse(stored || 'null') || database;
  const fromLink=parseLink(location.hash);explicitLink=!!fromLink;
  const next = fromLink || database.active;
  if (next) setLink(next); else render();
  if (!configured) notice('Anteprima locale: la lista resta su questo telefono. Per la condivisione occorre collegare Supabase.');
} catch (error) { notice(error.message, true); $('#welcome').hidden = false; }
void loadCatalog();
setInterval(() => { if (!document.hidden&&!closing) void refreshLists(); }, 30000);

import './pwa-update.js';

void refreshLists();
