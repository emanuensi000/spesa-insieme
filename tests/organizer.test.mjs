import test from 'node:test';
import assert from 'node:assert/strict';
import {dayKey,periodBounds,inPeriod,nextDate,cents,splitAmount,expenseBalance,validateItem,calendarFile} from '../public/organizer-core.js';

test('periodi e arretrati rispettano settimane e mesi, mantenendo visibili i non programmati',()=>{
 assert.deepEqual(periodBounds('week','2026-11-12'),['2026-11-09','2026-11-15']);
 assert.deepEqual(periodBounds('month','2026-12-31'),['2026-12-01','2026-12-31']);
 assert.equal(dayKey(new Date('2026-11-11T23:30:00Z')),'2026-11-12');
 assert.equal(inPeriod({data:{date:'2026-11-01',status:'open'}},'day','2026-11-12'),true);
 assert.equal(inPeriod({data:{date:'2026-11-01',status:'done'}},'day','2026-11-12'),false);
 assert.equal(inPeriod({data:{}},'month','2026-11-12'),true);
});
test('ricorrenze attraversano fine anno, mesi corti e anno bisestile',()=>{
 assert.equal(nextDate('2026-12-31','daily'),'2027-01-01');
 assert.equal(nextDate('2026-01-31','monthly'),'2026-02-28');
 assert.equal(nextDate('2024-02-29','yearly'),'2025-02-28');
 assert.equal(nextDate('2026-11-12','weekly'),'2026-11-19');
 assert.equal(nextDate('2026-11-12','none'),null);
});
test('denaro e quote vengono calcolati in centesimi senza perdere arrotondamenti',()=>{
 assert.equal(cents('120,01'),12001);assert.equal(cents('0.1'),10);
 assert.deepEqual(splitAmount(100,['Anna','Luca','Mia']).map(q=>q.cents),[34,33,33]);
 assert.throws(()=>cents('1.005'));assert.throws(()=>cents('-1'));
});
test('rimborsi estinguono i saldi senza duplicare le spese',()=>{
 const data={title:'Bolletta',amount:12000,payer:'Anna',shares:splitAmount(12000,['Anna','Luca']),status:'done'};
 const items=[{kind:'expense',data}];
 assert.deepEqual(expenseBalance(items),{total:12000,unpaid:0,balances:{Anna:6000,Luca:-6000}});
 data.refunds=[{person:'Luca',cents:6000}];
 assert.deepEqual(expenseBalance(items),{total:12000,unpaid:0,balances:{Anna:0,Luca:0}});
 data.status='open';assert.equal(expenseBalance(items).unpaid,12000);
});
test('validazione e calendario non accettano titoli vuoti o quote incoerenti',()=>{
 assert.throws(()=>validateItem('task',{title:'  '}));
 assert.throws(()=>validateItem('expense',{title:'Bolletta',amount:100,shares:[{cents:99}]}));
 const ics=calendarFile({id:'abc',data:{title:'Visita, controllo',date:'2026-12-31',note:'Una riga\nUn’altra'}});
 assert.ok(ics.includes('DTEND;VALUE=DATE:20270101'));
 assert.ok(ics.includes('SUMMARY:Visita\\, controllo'));
 assert.ok(ics.includes('Una riga\\nUn’altra'));
});
