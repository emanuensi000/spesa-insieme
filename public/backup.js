// Local backup validation: never execute or trust imported JSON structures.
import {validateItem} from './organizer-core.js';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const record=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
function safeStructure(value,depth=0){
 if(depth>32)throw Error('Il backup contiene dati troppo annidati.');
 if(value&&typeof value==='object')for(const key of Object.keys(value)){
  if(['__proto__','constructor','prototype'].includes(key))throw Error('Il backup contiene proprietà non consentite.');
  safeStructure(value[key],depth+1);
 }
}
function validateData(data){
 for(const key of ['title','note','date','time','place','status','repeat','payer','assignee','space','url','category','priority'])if(own(data,key)&&typeof data[key]!=='string')throw Error('Campo non valido nel backup: '+key);
 if(own(data,'sensitive')&&typeof data.sensitive!=='boolean')throw Error('Visibilità non valida nel backup.');
 if(data.date){const date=new Date(data.date+'T12:00:00Z');if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==data.date)throw Error('Data non valida nel backup.');}
 for(const key of ['shares','refunds'])if(own(data,key)){
  if(!Array.isArray(data[key])||data[key].length>1000||data[key].some(q=>!record(q)||typeof q.person!=='string'||!q.person.trim()||!Number.isSafeInteger(q.cents)||q.cents<0))throw Error('Quote o rimborsi non validi nel backup.');
 }
}
export function validateLocalBackup(value){
 safeStructure(value);
 if(record(value)&&(own(value,'format')||own(value,'schemaVersion'))&&(value.format!=='organaizer-local-backup'||value.schemaVersion!==1))throw Error('Formato o versione del backup non supportati.');
 if(!record(value)||!Array.isArray(value.groups)||!record(value.snapshots)||!record(value.profile)||!record(value.prefs))throw Error('Il file non è un backup OrganAIzer valido.');
 if(value.groups.length>100||Object.keys(value.snapshots).length>100)throw Error('Il backup supera i limiti supportati.');
 const ids=new Set(),groups=[];let count=0;
 for(const g of value.groups){
  if(!record(g)||!uuid.test(g.id)||ids.has(g.id)||typeof g.name!=='string'||!g.name.trim()||g.name.length>100)throw Error('Gruppo non valido nel backup.');
  ids.add(g.id);groups.push({id:g.id,name:g.name.trim(),role:'owner'});
 }
 const snapshots=Object.create(null);
 for(const id of Object.keys(value.snapshots)){
  if(!ids.has(id))throw Error('Il backup contiene gruppi sconosciuti.');
  const s=value.snapshots[id];if(!record(s)||!Array.isArray(s.items)||s.items.length>5000)throw Error('Elementi del gruppo non validi.');
  const items=[];const seen=new Set();
  for(const item of s.items){
   if(++count>10000)throw Error('Troppi elementi nel backup.');
   if(!record(item)||!uuid.test(item.id)||seen.has(item.id)||item.group_id!==id||!record(item.data))throw Error('Elemento non valido nel backup.');
   seen.add(item.id);
   validateData(item.data);
   const data=validateItem(item.kind,item.data);
   if(data.sensitive)throw Error('Un backup locale non può contenere elementi riservati.');
   items.push({id:item.id,group_id:id,kind:item.kind,version:Number.isSafeInteger(item.version)&&item.version>=0?item.version:0,deleted:item.deleted===true,author:'local',data});
  }
  snapshots[id]={items,members:[{id:'local',name:'Tu',role:'owner'}],invites:[]};
 }
 if(ids.size!==Object.keys(snapshots).length)throw Error('Mancano i dati di un gruppo.');
 const name=typeof value.profile.name==='string'?value.profile.name.trim().slice(0,80):'';
 for(const s of Object.values(snapshots))s.members[0].name=name||'Tu';
 const prefs={period:['day','week','month'].includes(value.prefs.period)?value.prefs.period:'week',completed:value.prefs.completed===true,quiet:value.prefs.quiet!==false};
 return {groups,snapshots,pending:[],profile:{name},prefs,active:ids.has(value.active)?value.active:(groups[0]?.id||null)};
}
export function makeLocalBackup(value){return {...value,format:'organaizer-local-backup',schemaVersion:1,exportedAt:new Date().toISOString()};}
