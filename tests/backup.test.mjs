import test from 'node:test';
import assert from 'node:assert/strict';
import {validateLocalBackup,makeLocalBackup} from '../public/backup.js';
const id='ab12cd34-1234-4567-89ab-cdef12345678',itemId='db12cd34-1234-4567-89ab-cdef12345678';
const valid=()=>({groups:[{id,name:'Famiglia'}],snapshots:{[id]:{items:[{id:itemId,group_id:id,kind:'task',data:{title:'Portare il pane'}}]}},profile:{name:'Test'},prefs:{period:'week'}});
test('backup roundtrip locale e normalizzazione autorizzazioni',()=>{
 const result=validateLocalBackup(makeLocalBackup(valid()));
 assert.equal(result.groups[0].role,'owner');assert.equal(result.snapshots[id].items[0].data.title,'Portare il pane');assert.deepEqual(result.pending,[]);
});
test('backup rigetta strutture non valide e gruppo fasullo',()=>{
 assert.throws(()=>validateLocalBackup({}));
 const x=valid();x.snapshots[id].items[0].group_id='fake';assert.throws(()=>validateLocalBackup(x));
});
test('backup rigetta elementi non sicuri',()=>{
 const x=valid();x.snapshots[id].items[0].data.sensitive=true;assert.throws(()=>validateLocalBackup(x));
});

test('backup rifiuta formati e versioni sconosciuti ma accetta gli export precedenti',()=>{
 assert.ok(validateLocalBackup(valid()));
 for(const extra of [{format:'other',schemaVersion:1},{format:'organaizer-local-backup',schemaVersion:2},{schemaVersion:1}])assert.throws(()=>validateLocalBackup({...valid(),...extra}));
 assert.equal(makeLocalBackup({...valid(),format:'other',schemaVersion:99}).schemaVersion,1);
});

test('backup rifiuta proprietà pericolose anche annidate e profondità eccessive',()=>{
 const x=valid();x.snapshots[id].items[0].data.extra=JSON.parse('{"__proto__":{"polluted":true}}');
 assert.throws(()=>validateLocalBackup(x));assert.equal({}.polluted,undefined);
 const y=valid();let nested=y.profile;for(let i=0;i<40;i++)nested=nested.child={};
 assert.throws(()=>validateLocalBackup(y));
});

test('backup rifiuta campi e rimborsi che renderebbero inutilizzabili i moduli',()=>{
 for(const change of [{title:123},{note:{}},{date:'2026-02-30'},{shares:'wrong'},{refunds:[{person:'Anna',cents:-1}]}]){
  const x=valid();Object.assign(x.snapshots[id].items[0].data,change);assert.throws(()=>validateLocalBackup(x));
 }
});

test('backup conserva pagamenti validi e rifiuta gruppi duplicati o incompleti',()=>{
 const x=valid();Object.assign(x.snapshots[id].items[0],{kind:'expense',data:{title:'Luce',amount:1200,payer:'Anna',shares:[{person:'Anna',cents:1200}],refunds:[]}});
 assert.equal(validateLocalBackup(x).snapshots[id].items[0].data.amount,1200);
 x.groups.push(x.groups[0]);assert.throws(()=>validateLocalBackup(x));
 const y=valid();delete y.snapshots[id];assert.throws(()=>validateLocalBackup(y));
});
