import {romeDate, cartEstimate, safeLocalFlyer} from './core.js';

export const shoppingKey = 'organaizer:v1';
export function shoppingDatabase(storage) {
  const data = JSON.parse(storage.getItem(shoppingKey) || storage.getItem('spesa-insieme:v1') || '{"active":null,"lists":{}}');
  if (!data || !data.lists || typeof data.lists !== 'object') throw Error('Le liste salvate non sono leggibili.');
  return data;
}
export function shoppingOwner(storage) {
  return storage?.getItem('organaizer:shopping-owner') || 'organaizer:local';
}
export function validPhoto(photo) {
  if (!photo || !safeLocalFlyer(photo.path) || !photo.path.endsWith('.jpg') || !Array.isArray(photo.region) || photo.region.length !== 4) return null;
  const [x,y,w,h] = photo.region;
  return [x,y,w,h].every(Number.isFinite) && x>=0 && y>=0 && w>0 && h>0 && x+w<=1.000001 && y+h<=1.000001 ? {path:photo.path,region:[x,y,w,h]} : null;
}
export function shoppingFingerprint(items) {
  return items.filter(i=>!i.deleted).map(i=>({id:i.id,name:i.name,quantity:i.quantity||'',note:i.note||'',price:i.price??null,checked:!!i.checked})).sort((a,b)=>a.id.localeCompare(b.id));
}
export function receiptAmount(value) {
  if (!/^\d{1,7}([.,]\d{1,2})?$/.test(String(value))) throw Error('Inserisci il totale con massimo due decimali.');
  const [euros,decimals=''] = String(value).replace(',','.').split('.');
  const amount = Number(euros)*100 + Number(decimals.padEnd(2,'0'));
  if (amount>100000000) throw Error('Il totale supera il limite di 1.000.000 €.');
  return amount;
}
export function createReceipt({id,name,items,amount,date=romeDate(),now=new Date().toISOString(),photoFor=()=>null}) {
  const purchased=items.filter(i=>i.checked&&!i.deleted);
  if (!purchased.length) throw Error('Spunta almeno un prodotto acquistato prima di chiudere la spesa.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date+'T12:00:00Z')) || new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date || date>romeDate()) throw Error('Scegli una data valida, non successiva a oggi.');
  const estimate=cartEstimate(purchased);
  return {id,name,date,closed_at:now,amount_cents:receiptAmount(amount),estimate_cents:Math.round(estimate.total*100),unpriced:estimate.unpriced,
    items:items.filter(i=>!i.deleted).map(i=>({...i,photo:validPhoto(i.photo)||validPhoto(photoFor(i))}))};
}
export function shoppingReceipts(database,{owner='organaizer:local',listIds=[]}={}) {
  const allowed=new Set(listIds);
  return Object.entries(database.lists).filter(([id,list])=>list.closure?.receipt&&((list.historyOwner||'organaizer:local')===owner||allowed.has(id)))
    .map(([id,list])=>({...list.closure.receipt,id,pending:!!list.closure.pending,localOnly:!!list.localOnly}))
    .sort((a,b)=>b.date.localeCompare(a.date)||b.closed_at.localeCompare(a.closed_at));
}
export function spendingSummary(receipts,month=romeDate().slice(0,7)) {
  const selected=receipts.filter(r=>!month||r.date.startsWith(month));
  const total=selected.reduce((sum,r)=>sum+r.amount_cents,0);
  const anchor=month||romeDate().slice(0,7), months=[];
  for(let delta=5;delta>=0;delta--){const d=new Date(anchor+'-01T12:00:00Z');d.setUTCMonth(d.getUTCMonth()-delta);const key=d.toISOString().slice(0,7);months.push({month:key,total:receipts.filter(r=>r.date.startsWith(key)).reduce((sum,r)=>sum+r.amount_cents,0)});}
  return {receipts:selected,total,count:selected.length,average:selected.length?Math.round(total/selected.length):0,months};
}
