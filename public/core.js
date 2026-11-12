export function createSecret() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, '0')).join('');
}

export function parseLink(hash) {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const id = params.get('list'), token = params.get('key');
  if (!id && !token) return null;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id ?? '') || !/^[0-9a-f]{64}$/.test(token ?? '')) {
    throw new Error('Il link della lista è incompleto o non valido. Chiedi di inviarlo di nuovo.');
  }
  return { id, token };
}

// Replay delle operazioni non confermate sopra l'ultima fotografia del server.
// Una rimozione conserva un tombstone: un aggiornamento ritardato non resuscita l'elemento.
export function projectItems(base = [], operations = []) {
  const items = new Map(base.map(item => [item.id, { ...item }]));
  for (const operation of operations) {
    const { kind, item_id: id, data } = operation;
    const previous = items.get(id);
    if (kind === 'add' && !previous) items.set(id, { ...data, id, checked: false, deleted: false });
    if (kind === 'check' && previous && !previous.deleted) previous.checked = data.checked;
    if (kind === 'delete' && previous) previous.deleted = true;
  }
  return [...items.values()].filter(item => !item.deleted).sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
}

export function romeDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function activeOffers(offers, today = romeDate()) {
  return offers.filter(offer => offer.valid_from <= today && offer.valid_until >= today);
}

export function availableOffers(offers, mode = 'available', today = romeDate()) {
  if (mode === 'all') return offers;
  if (mode === 'today') return activeOffers(offers, today);
  return offers.filter(offer => offer.valid_until >= today);
}

export function safeLocalFlyer(value) {
  return typeof value === 'string' && /^\.\/flyers\/[a-z0-9-]+\/(?:page-\d{2}\.jpg|volantino\.pdf)$/.test(value) ? value : null;
}

export function offerPrice(offer) {
  if (offer.price === null || offer.price === undefined) return offer.discount_percent ? `−${offer.discount_percent}%` : 'Prezzo non indicato';
  return `${money(offer.price)}${offer.size === 'al kg' ? ' / kg' : offer.size === '100 g' ? ' / 100 g' : ''}`;
}

export function money(value) { return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value); }

export function safeSourceUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['ipertriscount.it', 'www.ipertriscount.it'].includes(url.hostname) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

// Le unità restano operazioni indipendenti: compatibili con liste condivise esistenti.
export function groupItems(items) {
  const groups = new Map();
  for (const item of items) {
    const key = JSON.stringify([item.name,item.quantity,item.note,item.price,item.checked]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups.values()];
}

export function matchesOffer(item, offer) {
  const date = value => value.split('-').reverse().join('/');
  return item.name === [offer.brand, offer.name].filter(Boolean).join(' ').trim().slice(0,160)
    && item.price === (offer.price ?? null)
    && (item.note || '').startsWith(`Offerta dal ${date(offer.valid_from)} al ${date(offer.valid_until)} · pag. ${offer.page}`)
    && new RegExp(` · pag\\. ${offer.page}(?: ·|$)`).test(item.note || '');
}

export function cartEstimate(items) {
  const total = list => list.reduce((sum, item) => sum + (Number.isFinite(item.price) ? Math.round(item.price * 100) : 0), 0) / 100;
  return {
    total: total(items),
    remaining: total(items.filter(item => !item.checked)),
    checked: total(items.filter(item => item.checked)),
    unpriced: items.filter(item => !Number.isFinite(item.price)).length
  };
}
