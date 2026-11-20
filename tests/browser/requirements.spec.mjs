import {test, expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

const group='11111111-1111-4111-8111-111111111111',item='22222222-2222-4222-8222-222222222222';
const backup=()=>({groups:[{id:group,name:'Casa dal backup'}],snapshots:{[group]:{items:[{id:item,group_id:group,kind:'task',data:{title:'Attività ripristinata',status:'open'}}]}},profile:{name:'Anna'},prefs:{period:'month',completed:true,quiet:false},active:group});
async function local(page){
 await page.route('**/config.js',route=>route.fulfill({contentType:'text/javascript',body:'export default {};'}));
 await page.clock.install({time:new Date('2026-11-20T12:00:00Z')});
 await page.goto('/');await page.getByRole('button',{name:'Continua senza account'}).click();
}
async function settings(page){await page.locator('[data-view=settings]').click();}
async function upload(page,value=backup()){
 await page.locator('#import-file').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))});
}

test('FUN-401 — slider liste: selezione, persistenza, tastiera, overflow e testo sicuro',async({page},testInfo)=>{
 await local(page);await page.goto('/shopping.html');
 const names=['Spesa settimanale','Cena con amici','<b>Casa</b>','Weekend fuori porta','Prodotti per la dispensa','Pranzo in ufficio'];
 for(let i=0;i<names.length;i++){
  if(i)await page.getByRole('button',{name:'+ Nuova lista',exact:true}).click();
  await page.getByLabel('Nome della lista').fill(names[i]);await page.getByRole('button',{name:'Crea la lista'}).click();
 }
 const slider=page.getByRole('group',{name:'Scegli la lista della spesa'}),chips=slider.getByRole('button');
 await expect(chips).toHaveCount(names.length);
 await expect(page.locator('select#shopping-lists')).toHaveCount(0);
 await expect(slider.getByRole('button',{name:names[5],exact:true})).toHaveAttribute('aria-pressed','true');
 expect(await slider.evaluate(node=>node.scrollWidth>node.clientWidth)).toBe(true);
 const first=slider.getByRole('button',{name:names[0],exact:true});await first.focus();
 await page.keyboard.press('End');await expect(chips.last()).toBeFocused();
 await page.keyboard.press('Home');await expect(first).toBeFocused();
 await page.keyboard.press('ArrowRight');await expect(chips.nth(1)).toBeFocused();
 await page.keyboard.press('Enter');await expect(page.getByRole('heading',{name:names[1],exact:true})).toBeVisible();
 await expect(chips.nth(1)).toHaveAttribute('aria-pressed','true');
 await chips.nth(1).focus();await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
 await expect(chips.nth(1)).toBeFocused();
 await page.getByRole('textbox',{name:'Prodotto',exact:true}).fill('Pane per cena');await page.getByRole('button',{name:'Aggiungi prodotto',exact:true}).click();
 await chips.nth(2).click();await expect(slider.locator('b')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Segna acquistato: Pane per cena'})).toHaveCount(0);
 await chips.nth(1).click();await page.reload();
 await expect(page.getByRole('heading',{name:names[1],exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Segna acquistato: Pane per cena'})).toBeVisible();
 const selected=page.locator('.list-chip[aria-pressed=true]');await expect(selected).toBeInViewport();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:testInfo.outputPath('slider.png'),fullPage:true});
});

test('FUN-380 ROB-180 — anteprima gruppi e annullamento senza modifiche',async({page})=>{
 await local(page);await settings(page);
 const before=await page.evaluate(()=>localStorage.getItem('organaizer:local'));
 await upload(page);
 const dialog=page.getByRole('dialog',{name:'Controlla il tuo backup.'});await expect(dialog).toBeVisible();
 await expect(page.locator('#backup-current')).toContainText('Il mio spazio');
 await expect(page.locator('#backup-incoming')).toHaveText('Casa dal backup');
 await expect(page.locator('#backup-summary')).toContainText('1 gruppi e 1 elementi');
 await dialog.getByRole('button',{name:'Annulla',exact:true}).click();
 expect(await page.evaluate(()=>localStorage.getItem('organaizer:local'))).toBe(before);
});

test('ROB-179 — cambio sessione durante lettura interrompe importazione',async({page})=>{
 await local(page);await settings(page);
 const before=await page.evaluate(()=>localStorage.getItem('organaizer:local'));
 await page.evaluate(()=>{File.prototype.text=function(){return new Promise(resolve=>{window.finishBackupRead=resolve;});};});
 await upload(page);await expect.poll(()=>page.evaluate(()=>typeof window.finishBackupRead)).toBe('function');
 await page.locator('[data-view=profile]').click();
 await page.locator('#logout').click();
 await page.evaluate(value=>window.finishBackupRead(JSON.stringify(value)),backup());
 await expect(page.locator('#app-message')).toContainText('La sessione è cambiata');
 await expect(page.locator('#backup-preview-dialog')).not.toBeVisible();
 expect(await page.evaluate(()=>localStorage.getItem('organaizer:local'))).toBe(before);
});

test('FUN-372 FUN-373 FUN-374 FUN-375 FUN-376 FUN-377 — ripristino completo e limiti espliciti',async({page})=>{
 await local(page);await settings(page);await upload(page);
 const dialog=page.getByRole('dialog',{name:'Controlla il tuo backup.'});
 await expect(dialog).toContainText('Lo storico della spesa non sarà importato.');
 await dialog.getByRole('button',{name:'Conferma e sostituisci'}).click();
 await expect(page.locator('#organizer-toast')).toHaveText('Backup locale ripristinato.');
 await expect(page.locator('#group-select')).toHaveValue(group);
 await page.reload();await page.locator('[data-view=profile]').click();
 await expect(page.locator('#profile-name')).toHaveValue('Anna');
 await settings(page);await expect(page.locator('#default-period')).toHaveValue('month');
 await expect(page.locator('#show-completed')).toBeChecked();await expect(page.locator('#quiet-mode')).not.toBeChecked();
 await page.locator('[data-view=home]').click();await page.getByRole('button',{name:/Attività e turni/}).click();
 await expect(page.getByRole('heading',{name:'Attività ripristinata'})).toBeVisible();
});

test('FUN-159 — ripristino preferenze predefinite persistente',async({page})=>{
 await local(page);await settings(page);
 await page.locator('#default-period').selectOption('month');await page.locator('#show-completed').check();await page.locator('#quiet-mode').uncheck();
 await page.getByRole('button',{name:'Salva preferenze',exact:true}).click();
 await page.getByRole('button',{name:'Ripristina preferenze predefinite'}).click();
 await page.reload();await settings(page);
 await expect(page.locator('#default-period')).toHaveValue('week');await expect(page.locator('#show-completed')).not.toBeChecked();await expect(page.locator('#quiet-mode')).toBeChecked();
});

test('quota esaurita nel ripristino: errore nel dialogo e archivio precedente intatto',async({page})=>{
 await local(page);await settings(page);await upload(page);
 const before=await page.evaluate(()=>localStorage.getItem('organaizer:local'));
 await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='organaizer:local')throw new DOMException('Quota exceeded','QuotaExceededError');return original.call(this,key,value);};});
 const dialog=page.getByRole('dialog',{name:'Controlla il tuo backup.'});await dialog.getByRole('button',{name:'Conferma e sostituisci'}).click();
 await expect(dialog.getByRole('alert')).toContainText('Memoria del dispositivo piena');
 expect(await page.evaluate(()=>localStorage.getItem('organaizer:local'))).toBe(before);
 await dialog.getByRole('button',{name:'Annulla',exact:true}).click();
 await expect(page.locator('#default-period')).toHaveValue('week');
});

for(const [id,repeat] of [['FUN-181','daily'],['FUN-182','weekly'],['FUN-183','monthly'],['FUN-184','bimonthly'],['FUN-185','quarterly'],['FUN-186','yearly'],['FUN-187','none']])test(`${id} — ricorrenza ${repeat} salvata e riaperta`,async({page})=>{
 await local(page);await page.getByRole('button',{name:'Aggiungi un impegno',exact:true}).click();
 await page.getByLabel('Titolo',{exact:true}).fill('Attività ricorrente');await page.locator('#entry-date').fill('2026-11-20');
 // Per rimuovere la ricorrenza partiamo da un elemento giornaliero già salvato.
 await page.locator('#entry-repeat').selectOption(repeat==='none'?'daily':repeat);
 await page.getByRole('button',{name:'Salva nel vostro spazio'}).click();
 await page.getByRole('button',{name:/Attività e turni/}).click();await page.getByRole('button',{name:'Modifica',exact:true}).click();
 if(repeat==='none'){
  await page.locator('#entry-repeat').selectOption('none');await page.getByRole('button',{name:'Salva nel vostro spazio'}).click();
  await page.getByRole('button',{name:'Modifica',exact:true}).click();
 }
 await expect(page.locator('#entry-repeat')).toHaveValue(repeat);
 await page.keyboard.press('Escape');await page.reload();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('organaizer:local')));
 expect(saved.snapshots[saved.active].items[0].data.repeat).toBe(repeat);
});

for(const [id,period,count] of [['FUN-126','day',3],['FUN-127','week',4],['FUN-128','month',5],['FUN-132','day',3],['FUN-133','day',3]])test(`${id} — filtro home ${period}, non programmati e arretrati`,async({page})=>{
 await local(page);
 await page.evaluate(()=>{
  const db=JSON.parse(localStorage.getItem('organaizer:local')),g=db.active;
  db.snapshots[g].items=['2026-11-01','2026-11-20','2026-11-21','2026-11-25','2026-12-25',''].map((date,i)=>({id:crypto.randomUUID(),group_id:g,kind:'task',data:{title:'Attività '+i,date,status:'open'}}));
  localStorage.setItem('organaizer:local',JSON.stringify(db));
 });
 await page.reload();await page.locator(`[data-period=${period}]`).click();
 await expect(page.getByRole('button',{name:/Attività e turni/}).locator('.card-metric')).toHaveText(`${count} attività`);
});

test('FUN-353 FUN-354 FUN-355 FUN-356 FUN-358 — statistiche e dettaglio visibili',async({page})=>{
 await local(page);
 await page.evaluate(()=>{
  const id=crypto.randomUUID();localStorage.setItem('organaizer:v1',JSON.stringify({active:null,lists:{[id]:{historyOwner:'organaizer:local',closure:{receipt:{id,name:'Spesa statistica',date:'2026-11-19',closed_at:'2026-11-19T12:00:00Z',amount_cents:1234,estimate_cents:1000,unpriced:0,items:[{id:'one',name:'Pane',price:10,quantity:'1 kg',checked:true}]}}}}}));
 });
 await page.locator('[data-view=profile]').click();
 const blocks=page.locator('#spending-summary .summary-block');
 await expect(blocks.nth(0)).toContainText('12,34');await expect(blocks.nth(1).locator('strong')).toHaveText('1');await expect(blocks.nth(2)).toContainText('12,34');
 await expect(page.locator('#spending-chart > li')).toHaveCount(6);
 await page.locator('#shopping-history button').first().click();
 await expect(page.getByRole('dialog',{name:'Spesa statistica'})).toContainText('Totale pagato 12,34');
 await expect(page.locator('#receipt-meta')).toContainText('Stima prodotti acquistati 10,00');
});

test('FUN-286 FUN-295 FUN-296 FUN-297 — raggruppamento e stima mostrati nel carrello',async({page})=>{
 await local(page);
 await page.evaluate(()=>{
  const id=crypto.randomUUID(),token='a'.repeat(64);
  const base=[{name:'Pane',price:.1,checked:true},{name:'Pane',price:.1,checked:true},{name:'Sale',price:.2,checked:false},{name:'Extra',price:null,checked:true}].map((p,i)=>({...p,id:crypto.randomUUID(),quantity:'1 kg',note:'',created_at:`2026-11-20T10:00:0${i}Z`}));
  localStorage.setItem('organaizer:v1',JSON.stringify({active:{id,token},lists:{[id]:{name:'Carrello test',base,pending:[],token,loaded:true,created:true,localOnly:true,historyOwner:'organaizer:local'}}}));
 });
 await page.goto('/shopping.html');await expect(page.locator('#items > li')).toHaveCount(3);
 await expect(page.locator('#estimate-total')).toContainText('0,40');
 await expect(page.locator('#estimate-detail')).toContainText('Da acquistare 0,20');await expect(page.locator('#estimate-detail')).toContainText('Già nel carrello 0,20');
 await expect(page.locator('#estimate-note')).toContainText('1 unità senza prezzo esclusa');
 await expect(page.locator('#estimate-note')).toBeVisible();
 await page.getByRole('button',{name:'Apri Pane',exact:true}).click();await expect(page.getByRole('spinbutton',{name:'Quantità di Pane'})).toHaveValue('2');
});

test('FUN-306 FUN-307 FUN-308 FUN-311 FUN-313 — filtri e prezzi catalogo nella UI',async({page})=>{
 await local(page);
 const catalog=JSON.parse(await readFile(new URL('../../public/data/offers.json',import.meta.url),'utf8'));
 const sample=catalog.offers[0];
 catalog.offers=[
  {...sample,name:'Prodotto corrente',brand:'Marca',price:2,size:'al kg',valid_from:'2026-11-01',valid_until:'2026-11-20'},
  {...sample,name:'Prodotto futuro',brand:'Marca',price:null,discount_percent:20,valid_from:'2026-11-21',valid_until:'2026-11-30'},
  {...sample,name:'Prodotto scaduto',brand:'Marca',price:1,valid_from:'2026-10-01',valid_until:'2026-10-31'}
 ];
 await page.route('**/data/offers.json',route=>route.fulfill({contentType:'application/json',body:JSON.stringify(catalog)}));
 await page.goto('/shopping.html');await page.getByRole('button',{name:'Crea la lista'}).click();
 await page.locator('[data-tab=offers]').click();
 await page.locator('#offer-validity').selectOption('today');await expect(page.locator('#offers .offer-card')).toHaveCount(1);
 await expect(page.locator('#offers')).toContainText('Prodotto corrente');await expect(page.locator('#offers')).toContainText('/ kg');
 await page.locator('#offer-validity').selectOption('available');await expect(page.locator('#offers .offer-card')).toHaveCount(2);
 await expect(page.locator('#offers')).toContainText('Prodotto futuro');await expect(page.locator('#offers')).toContainText('−20%');
 await page.locator('#offer-validity').selectOption('all');await expect(page.locator('#offers .offer-card')).toHaveCount(3);await expect(page.locator('#offers')).toContainText('Prodotto scaduto');
});
