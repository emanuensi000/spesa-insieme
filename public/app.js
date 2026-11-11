import config from './config.js';
import { createSecret, parseLink, projectItems, activeOffers, availableOffers, romeDate, money, offerPrice, safeSourceUrl, safeLocalFlyer } from './core.js';

const $ = selector => document.querySelector(selector);
const configured = Boolean(config.supabaseUrl && config.supabasePublishableKey);
const cacheKey = 'spesa-insieme:v1';
let database = { active: null, lists: {} }, link = null, state = null;
let busy = false, catalog = { offers: [], flyers: [] }, currentTab = 'list', installPrompt = null;
let toastTimer, blocked = false;
let offerLimit = 24, selectedOffers = new Set(), openPage = null;
try { selectedOffers = new Set(JSON.parse(localStorage.getItem('spesa-insieme:selection') || '[]')); } catch { /* Selezione non disponibile: parte vuota. */ }

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
  link = next; database.active = next;
  state = database.lists[next.id];
  if (!state) database.lists[next.id] = state = { name: 'La spesa condivisa', base: [], pending: [], created: false, loaded: false, localOnly: !configured, token: next.token };
  if (state.token !== next.token) throw new Error('Chiave diversa da quella salvata per questa lista. Apri il link in una finestra privata per verificarlo.');
  // Il frammento non viene inviato all'hosting e non compare nei referrer.
  location.hash = new URLSearchParams({ list: next.id, key: next.token }).toString();
  persist(); render();
}
async function rpc(name, args) {
  const headers = { 'Content-Type': 'application/json', apikey: config.supabasePublishableKey };
  // Le nuove publishable key non sono JWT; l'header Bearer serve solo per le anon key legacy.
  if (config.supabasePublishableKey.startsWith('eyJ')) headers.Authorization = `Bearer ${config.supabasePublishableKey}`;
  const response = await fetch(`${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/${name}`, {
    method: 'POST', headers, body: JSON.stringify(args), signal: AbortSignal.timeout(15000), cache: 'no-store', referrerPolicy: 'no-referrer'
  });
  if (!response.ok) {
    const error = new Error(response.status === 401 || response.status === 403 ? 'Accesso rifiutato: controlla il link e la configurazione del servizio.' : 'Sincronizzazione non riuscita. Le modifiche restano sul telefono.');
    error.status = response.status; throw error;
  }
  return response.status === 204 ? null : response.json();
}
function statusText() {
  if (state.localOnly) return 'Solo su questo telefono · configura Supabase per condividere';
  if (blocked) return 'Accesso rifiutato · controlla il link';
  if (!navigator.onLine) return `Offline · ${state.pending.length ? `${state.pending.length} modifiche da inviare` : 'lista salvata sul telefono'}`;
  if (busy || state.pending.length) return `Sincronizzazione${state.pending.length ? ` · ${state.pending.length} modifiche da inviare` : '…'}`;
  return state.loaded ? 'Lista condivisa · aggiornamento ogni 4 secondi' : 'Connessione alla lista…';
}
function render() {
  $('#welcome').hidden = Boolean(link); $('#workspace').hidden = !link;
  if (!link) return;
  $('#list-title').textContent = state.name;
  $('#sync-status').textContent = statusText();
  $('#share').disabled = !configured || state.localOnly || !state.created || !state.loaded;
  const items = projectItems(state.base, state.pending);
  const remaining = items.filter(item => !item.checked), done = items.filter(item => item.checked);
  $('#list-count').textContent = remaining.length;
  $('#remaining').textContent = `${remaining.length} ${remaining.length === 1 ? 'prodotto' : 'prodotti'}`;
  $('#done-count').textContent = done.length;
  $('#empty').hidden = remaining.length > 0;
  $('#done-section').hidden = done.length === 0;
  renderItems($('#items'), remaining); renderItems($('#done-items'), done);
}
function renderItems(container, items) {
  container.replaceChildren(...items.map(item => {
    const li = document.createElement('li'); li.className = `item${item.checked ? ' checked' : ''}`;
    const check = document.createElement('button'); check.className = 'check'; check.textContent = item.checked ? '✓' : '';
    check.setAttribute('aria-label', `${item.checked ? 'Da acquistare' : 'Segna acquistato'}: ${item.name}`);
    check.setAttribute('aria-pressed', String(item.checked));
    check.onclick = () => enqueue('check', item.id, { checked: !item.checked });
    const info = document.createElement('div'); info.className = 'item-info';
    const name = document.createElement('span'); name.className = 'item-name'; name.textContent = item.name; info.append(name);
    const detail = document.createElement('span'); detail.className = 'item-detail'; detail.textContent = [item.quantity, item.note].filter(Boolean).join(' · '); info.append(detail);
    li.append(check, info);
    if (item.price !== null && item.price !== undefined) { const price = document.createElement('span'); price.className = 'price-tag'; price.textContent = money(item.price); li.append(price); }
    const remove = document.createElement('button'); remove.className = 'delete'; remove.textContent = '×'; remove.setAttribute('aria-label', `Rimuovi ${item.name}`); remove.onclick = () => enqueue('delete', item.id, {}); li.append(remove);
    return li;
  }));
}
function enqueue(kind, item_id, data) {
  if (!state || blocked || (!state.loaded && !state.created)) { toast('Attendi il caricamento della lista prima di modificarla.'); return false; }
  if (state.pending.length >= 500) { toast('Troppe modifiche in attesa. Ricollegati per sincronizzarle.'); return false; }
  const operation = { op_id: crypto.randomUUID(), kind, item_id, data };
  state.pending.push(operation);
  try { persist(); } catch (error) { state.pending.pop(); toast(error.message); return false; }
  render(); void sync(); return true;
}
function addItem(name, quantity = '', offer = null) {
  const date = value => value.split('-').reverse().join('/');
  const title = offer ? [offer.brand, name].filter(Boolean).join(' ') : name;
  const note = offer ? `Offerta dal ${date(offer.valid_from)} al ${date(offer.valid_until)} · pag. ${offer.page}${offer.discount_percent ? ` · sconto ${offer.discount_percent}%` : ''}${offer.conditions ? ` · ${offer.conditions}` : ''}` : '';
  return enqueue('add', crypto.randomUUID(), { name: title.trim().slice(0,160), quantity: quantity.trim(), note: note.slice(0,500), price: offer?.price ?? null, created_at: new Date().toISOString() });
}
async function sync() {
  if (!state || state.localOnly || !configured || busy || !navigator.onLine || blocked) return;
  busy = true; $('#sync-status').textContent = statusText();
  try {
    const credentials = { p_list_id: link.id, p_token: link.token };
    if (!state.created && state.creating) {
      await rpc('create_shared_list', { ...credentials, p_name: state.name });
      state.created = true; state.loaded = true; delete state.creating; persist();
    }
    // Acquisisce prima i permessi; non invia modifiche ad un link non verificato.
    if (!state.loaded) {
      const snapshot = await rpc('read_shared_list', credentials);
      state.name = snapshot.name; state.base = snapshot.items; state.created = true; state.loaded = true; persist();
    }
    let count = 0;
    while (state.pending.length && count++ < 50) {
      const operation = state.pending[0];
      const snapshot = await rpc('apply_list_operation', { ...credentials, p_operation: operation });
      const previousBase = state.base;
      state.base = snapshot.items; state.pending.shift();
      try { persist(); } catch (error) { state.base = previousBase; state.pending.unshift(operation); throw error; }
    }
    const snapshot = await rpc('read_shared_list', credentials);
    state.base = snapshot.items; state.name = snapshot.name; persist(); notice('');
  } catch (error) {
    if (error.status === 401 || error.status === 403) blocked = true;
    notice(error.message || 'Connessione assente. Le modifiche restano sul telefono.', true);
  } finally { busy = false; render(); }
}
function renderOffers() {
  const todayOffers = activeOffers(catalog.offers ?? []);
  const pool = availableOffers(catalog.offers ?? [], $('#offer-validity').value);
  const query = $('#offer-search').value.trim().toLocaleLowerCase('it');
  const category = $('#offer-category').value;
  const page = $('#offer-page').value;
  const filtered = pool.filter(o => (!category || o.category === category) && (!page || o.page === Number(page)) && `${o.name} ${o.brand} ${o.size}`.toLocaleLowerCase('it').includes(query));
  $('#offers').replaceChildren(...filtered.slice(0,offerLimit).map(offer => {
    const card = document.createElement('article'); card.className = `offer-card${selectedOffers.has(offer.id) ? ' is-selected' : ''}`;
    const selection = document.createElement('label'); selection.className = 'offer-select';
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = selectedOffers.has(offer.id); checkbox.setAttribute('aria-label', `Seleziona ${offer.brand} ${offer.name}`);
    checkbox.onchange = () => { toggleSelection(offer.id, checkbox.checked); card.classList.toggle('is-selected',checkbox.checked); };
    selection.append(checkbox, document.createTextNode('Scegli per la lista')); card.append(selection);
    const today = romeDate();
    const validity = offer.valid_from > today ? `Dal ${offer.valid_from.split('-').reverse().join('/')}` : offer.valid_until < today ? 'Offerta scaduta' : 'In corso';
    const badge = document.createElement('span'); badge.className = `validity-badge${offer.valid_from > today ? ' upcoming' : offer.valid_until < today ? ' expired' : ''}`; badge.textContent = validity; card.append(badge);
    for (const [tag, value, cls] of [['span', offer.category, 'eyebrow'], ['h3', offer.name, ''], ['p', [offer.brand, offer.size].filter(Boolean).join(' · '), ''], ['strong', offerPrice(offer), ''], ['p', `${offer.unit_price || ''}${offer.unit_price ? ' · ' : ''}Fino al ${offer.valid_until.split('-').reverse().join('/')}`, '']]) {
      const element = document.createElement(tag); element.textContent = value; element.className = cls; card.append(element);
    }
    if (offer.conditions) { const conditions = document.createElement('p'); conditions.textContent = offer.conditions; card.append(conditions); }
    const source = document.createElement('button'); source.className = 'source-button'; source.textContent = `Vedi sul volantino · pag. ${offer.page}`; source.onclick = () => showPage(offer.page); card.append(source);
    const button = document.createElement('button'); button.className = 'secondary'; button.textContent = '+ Aggiungi alla lista'; button.onclick = () => { if (addItem(offer.name, offer.size, offer)) toast('Aggiunto alla lista'); }; card.append(button);
    return card;
  }));
  $('#no-offers').hidden = filtered.length > 0;
  $('#offer-results').textContent = `${filtered.length} offerte trovate · ${Math.min(offerLimit,filtered.length)} mostrate`;
  $('#more-offers').hidden = filtered.length <= offerLimit;
  renderSelection();
  const total = catalog.offers?.length || 0;
  const upcoming = (catalog.offers ?? []).filter(o => o.valid_from > romeDate()).length;
  $('#catalog-status').textContent = total ? `${total} offerte trascritte · ${todayOffers.length} valide oggi${upcoming ? ` · ${upcoming} in arrivo` : ''}. ${catalog.completeness === 'reviewed' ? 'Lette tutte le 20 pagine; varianti della stessa offerta raggruppate.' : 'Catalogo parziale: consulta anche il volantino.'} Le condizioni e i prezzi originali restano verificabili aprendo la pagina.` : 'Il catalogo prodotti è ancora da compilare. Le pagine originali sono disponibili qui sotto; i prodotti verranno mostrati dopo l’importazione del CSV.';
}

function toggleSelection(id, checked) {
  if (checked) selectedOffers.add(id); else selectedOffers.delete(id);
  try { localStorage.setItem('spesa-insieme:selection',JSON.stringify([...selectedOffers])); } catch { toast('La selezione resterà disponibile solo in questa pagina.'); }
  renderSelection();
}
function renderSelection() {
  const count = (catalog.offers ?? []).filter(o => selectedOffers.has(o.id)).length;
  $('#selection-bar').hidden = count === 0;
  $('#selected-count').textContent = `${count} ${count === 1 ? 'prodotto scelto' : 'prodotti scelti'}`;
  $('#add-selected').textContent = `Aggiungi ${count} alla lista`;
  $('#page-add-selected').textContent = count ? `Aggiungi ${count} selezionati alla lista` : 'Seleziona i prodotti della pagina';
  $('#page-add-selected').disabled = !count;
}
function addSelected() {
  let added = 0;
  for (const offer of (catalog.offers ?? []).filter(o => selectedOffers.has(o.id))) {
    if (!addItem(offer.name,offer.size,offer)) break;
    toggleSelection(offer.id,false); added++;
  }
  if (added) toast(`${added} prodotti aggiunti alla lista`);
  renderOffers();
  if ($('#page-dialog').open) renderPageProducts();
}
function showPage(page) {
  openPage = page;
  const flyer = catalog.flyers?.[0];
  const source = safeLocalFlyer(flyer?.local_pages?.[page-1]) || safeSourceUrl(flyer?.pages?.[page-1]);
  if (!source) return;
  $('#page-title').textContent = `Volantino · pagina ${page}`;
  $('#page-image').src = source; $('#page-image').alt = `Pagina originale ${page}`;
  renderPageProducts();
  if (!$('#page-dialog').open) $('#page-dialog').showModal();
}
function renderPageProducts() {
  const products = (catalog.offers ?? []).filter(o => o.page === openPage);
  $('#page-products').replaceChildren(...products.map(offer => {
    const label = document.createElement('label'); label.className = 'page-product';
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = selectedOffers.has(offer.id);
    input.onchange = () => { toggleSelection(offer.id,input.checked); renderOffers(); };
    const text = document.createElement('span'); text.textContent = `${offer.brand} ${offer.name} · ${offer.size}`.trim();
    const price = document.createElement('strong'); price.textContent = offerPrice(offer);
    label.append(input,text,price); return label;
  }));
  if (!products.length) { const note = document.createElement('p'); note.textContent = 'Questa pagina contiene iniziative e condizioni del punto vendita, senza altri prodotti da aggiungere.'; $('#page-products').append(note); }
  renderSelection();
}
async function loadCatalog() {
  try {
    const response = await fetch('./data/offers.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(); catalog = await response.json();
    const categories = [...new Set((catalog.offers ?? []).map(o => o.category))].sort();
    for (const category of categories) { const option = document.createElement('option'); option.value = category; option.textContent = category; $('#offer-category').append(option); }
    renderOffers();
    const flyer = catalog.flyers?.[0];
    if (!flyer) { $('#flyer-note').textContent = 'Volantino non ancora acquisito. Usa il collegamento al sito ufficiale.'; return; }
    $('#flyer-note').textContent = `${flyer.pages.length} pagine${flyer.local_pages ? ' scaricate nel progetto e disponibili offline' : ''} · ${flyer.valid_from ? `validità ${flyer.valid_from.split('-').reverse().join('/')} – ${flyer.valid_until.split('-').reverse().join('/')}` : 'verifica la validità sulla copertina'}. Tocca una pagina per aprirla e scegliere i prodotti.`;
    $('#flyer-link').href = safeSourceUrl(flyer.url) || 'https://www.ipertriscount.it/volantini'; $('#flyer-link').hidden = false;
    const pdf = safeLocalFlyer(flyer.local_pdf); if (pdf) { $('#pdf-link').href = pdf; $('#pdf-link').hidden = false; }
    $('#flyer-pages').replaceChildren(...flyer.pages.map((url, index) => {
      const source = safeLocalFlyer(flyer.local_pages?.[index]) || safeSourceUrl(url); if (!source) return document.createTextNode('');
      const option = document.createElement('option'); option.value = String(index+1); option.textContent = `Pagina ${index+1}`; $('#offer-page').append(option);
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

$('#create-form').onsubmit = async event => {
  event.preventDefault(); const name = $('#list-name').value.trim(); if (!name) return;
  try {
    const next = { id: crypto.randomUUID(), token: createSecret() };
    database.lists[next.id] = { name, base: [], pending: [], created: !configured, creating: configured, loaded: !configured, localOnly: !configured, token: next.token };
    setLink(next); await sync();
  } catch (error) { notice(error.message, true); }
};
$('#add-form').onsubmit = event => { event.preventDefault(); const input = $('#product-name'); if (input.value.trim() && addItem(input.value, $('#quantity').value)) { input.value = ''; $('#quantity').value = ''; input.focus(); } };
$('#clear-done').onclick = () => { const done = projectItems(state.base, state.pending).filter(i => i.checked); if (confirm(`Rimuovere ${done.length} prodotti acquistati?`)) done.forEach(i => enqueue('delete', i.id, {})); };
for (const tab of document.querySelectorAll('[data-tab]')) tab.onclick = () => {
  currentTab = tab.dataset.tab;
  for (const other of document.querySelectorAll('[data-tab]')) { const selected = other === tab; other.classList.toggle('selected', selected); other.setAttribute('aria-pressed', String(selected)); }
  $('#list-panel').hidden = currentTab !== 'list'; $('#offers-panel').hidden = currentTab !== 'offers';
};
$('#offer-search').oninput = () => { offerLimit = 24; renderOffers(); };
for (const id of ['#offer-category','#offer-validity','#offer-page']) $(id).onchange = () => { offerLimit = 24; renderOffers(); };
$('#more-offers').onclick = () => { offerLimit += 24; renderOffers(); };
$('#clear-selection').onclick = () => { selectedOffers.clear(); try { localStorage.removeItem('spesa-insieme:selection'); } catch {} renderOffers(); if ($('#page-dialog').open) renderPageProducts(); };
$('#add-selected').onclick = addSelected; $('#page-add-selected').onclick = addSelected;
$('#share').onclick = () => { $('#share-url').value = location.href; $('#native-share').hidden = !navigator.share; $('#share-dialog').showModal(); };
$('#copy-link').onclick = async () => { try { await navigator.clipboard.writeText(location.href); toast('Link copiato'); } catch { $('#share-url').select(); toast('Seleziona e copia il link'); } };
$('#native-share').onclick = async () => { try { await navigator.share({ title: state.name, text: 'Facciamo la spesa insieme', url: location.href }); } catch (error) { if (error.name !== 'AbortError') toast('Invio non riuscito. Puoi copiare il link.'); } };
$('#help').onclick = () => $('#info-dialog').showModal();
for (const close of document.querySelectorAll('dialog .close')) close.onclick = () => close.closest('dialog').close();
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; $('#install').hidden = false; });
$('#install').onclick = async () => { if (installPrompt) { await installPrompt.prompt(); installPrompt = null; $('#install').hidden = true; } };
window.addEventListener('online', () => { render(); void sync(); }); window.addEventListener('offline', render);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { renderOffers(); void sync(); } });
// Ogni scheda ha un solo writer della propria coda. Evita che due schede si sovrascrivano.
window.addEventListener('storage', event => { if (event.key === cacheKey) { notice('La lista è stata aggiornata in un’altra scheda. Ricarica questa pagina per continuare.', true); blocked = true; render(); } });
window.addEventListener('hashchange', () => { try { const next = parseLink(location.hash); if (next && (next.id !== link?.id || next.token !== link?.token)) location.reload(); } catch (error) { notice(error.message, true); } });
try {
  database = JSON.parse(localStorage.getItem(cacheKey) || 'null') || database;
  const next = parseLink(location.hash) || database.active;
  if (next) setLink(next); else render();
  if (!configured) notice('Anteprima locale: la lista resta su questo telefono. Per la condivisione occorre collegare Supabase.');
  void sync();
} catch (error) { notice(error.message, true); $('#welcome').hidden = false; }
void loadCatalog();
setInterval(() => { if (!document.hidden) void sync(); }, 4000);
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) navigator.serviceWorker.register('./sw.js').catch(() => toast('Installazione offline non disponibile su questo browser.'));
