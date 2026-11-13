import test from 'node:test';
import assert from 'node:assert/strict';
import {createReceipt,spendingSummary,shoppingReceipts,shoppingFingerprint,validPhoto,receiptAmount} from '../public/shopping-history.js';
const items=[{id:'b',name:'Latte',quantity:'1 l',price:1.1,checked:true},{id:'a',name:'Pane',price:2.2,checked:true},{id:'c',name:'Sale',price:4,checked:false},{id:'d',name:'Extra',price:null,checked:true}];
const create=changes=>createReceipt({id:'list',name:'Spesa',items,amount:'4,35',date:'2026-11-13',...changes});
test('lo scontrino usa i centesimi, distingue totale reale e stima e conserva i non acquistati',()=>{
 const receipt=create();assert.equal(receipt.amount_cents,435);assert.equal(receipt.estimate_cents,330);assert.equal(receipt.unpriced,1);assert.equal(receipt.items.length,4);
 assert.throws(()=>create({items:items.filter(i=>!i.checked)}));
 for(const amount of ['-2','NaN','1.005','1e4','1000000.01'])assert.throws(()=>receiptAmount(amount));
 assert.equal(receiptAmount('0'),0);assert.throws(()=>create({date:'2026-02-30'}));
 assert.deepEqual(shoppingFingerprint(items).map(i=>i.id),['a','b','c','d']);
});
test('statistiche per mese e andamento passano fra anni e non includono liste aperte',()=>{
 const receipts=[create({id:'one',amount:'10',date:'2026-01-05'}),create({id:'two',amount:'20,50',date:'2026-01-31'}),create({id:'three',amount:'100',date:'2025-12-31'})];
 const stats=spendingSummary(receipts,'2026-01');assert.equal(stats.total,3050);assert.equal(stats.average,1525);assert.equal(stats.count,2);assert.equal(stats.months[0].month,'2025-08');assert.equal(stats.months[4].total,10000);
 assert.equal(spendingSummary(receipts,'').total,13050);
 const db={lists:{one:{closure:{receipt:receipts[0]}},open:{base:items},other:{historyOwner:'organaizer:user:bob',closure:{receipt:receipts[1]}}}};
 assert.equal(shoppingReceipts(db).length,1);assert.equal(shoppingReceipts(db,{owner:'organaizer:user:bob'}).length,1);
 assert.equal(shoppingReceipts(db,{owner:'organaizer:user:alice',listIds:['one']}).length,1);
});
test('foto storiche conservate e contenuti remoti non sicuri rifiutati',()=>{
 const photo={path:'./flyers/946-20261102/page-02.jpg',region:[.1,.2,.3,.4]};
 const receipt=create({photoFor:()=>photo});assert.deepEqual(receipt.items[0].photo,photo);
 assert.equal(validPhoto({...photo,path:'https://example.com/tracker.jpg'}),null);
 assert.equal(validPhoto({...photo,region:[.9,0,.5,1]}),null);
 assert.equal(validPhoto({...photo,region:[0,0,NaN,1]}),null);
 items[0].name='Cambiato';assert.equal(receipt.items[0].name,'Latte');
});
