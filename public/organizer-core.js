export const modules = {
 shopping: {title:'Spesa',icon:'basket',hint:'Le cose buone, senza dimenticare nulla',color:'peach'},
 expense: {title:'Casa e pagamenti',icon:'wallet',hint:'Scadenze sotto controllo, pensieri in meno',color:'lavender'},
 task: {title:'Attività e turni',icon:'check',hint:'Un piccolo passo, fatto insieme',color:'sage'},
 event: {title:'Agenda e salute',icon:'calendar',hint:'Il tempo per ciò che conta',color:'butter'}
};
export function dayKey(date=new Date()) { return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(date); }
export function periodBounds(mode, anchor=dayKey()) {
 const start=new Date(anchor+'T12:00:00Z'),end=new Date(start);
 if(mode==='week') { start.setUTCDate(start.getUTCDate()-(start.getUTCDay()+6)%7);end.setTime(start.getTime());end.setUTCDate(end.getUTCDate()+6); }
 if(mode==='month') {start.setUTCDate(1);end.setUTCMonth(end.getUTCMonth()+1,0);}
 return [start.toISOString().slice(0,10),end.toISOString().slice(0,10)];
}
export function inPeriod(item,mode,anchor) { const [a,b]=periodBounds(mode,anchor);return !item.data.date || (item.data.date>=a && item.data.date<=b) || (item.data.date<a && item.data.status!=='done'); }
export function nextDate(date,repeat) {
 if(!date || repeat==='none' || !repeat)return null;
 const d=new Date(date+'T12:00:00Z');if(Number.isNaN(d.getTime()))throw Error('Data non valida');
 if(repeat==='daily')d.setUTCDate(d.getUTCDate()+1);
 else if(repeat==='weekly')d.setUTCDate(d.getUTCDate()+7);
 else {const day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+({monthly:1,bimonthly:2,quarterly:3,yearly:12}[repeat]||1));const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));}
 return d.toISOString().slice(0,10);
}
export function cents(text) { if(!/^\d{1,8}([.,]\d{1,2})?$/.test(String(text)))throw Error('Inserisci un importo positivo con massimo due decimali.');const [a,b='']=String(text).replace(',','.').split('.');return Number(a)*100+Number(b.padEnd(2,'0')); }
export function splitAmount(total,people) { if(!Number.isSafeInteger(total)||total<0||!people.length)throw Error('Ripartizione non valida');return people.map((person,i)=>({person,cents:Math.floor(total/people.length)+(i<total%people.length?1:0)})); }
export function expenseBalance(items) {
 const balances={};let total=0,unpaid=0;
 for(const item of items.filter(x=>x.kind==='expense'&&!x.deleted)) {const d=item.data;if(d.status!=='done'){unpaid+=d.amount||0;continue;}total+=d.amount||0;if(!d.payer)continue;balances[d.payer]=(balances[d.payer]||0)+(d.amount||0);for(const q of d.shares||[])balances[q.person]=(balances[q.person]||0)-q.cents;for(const r of d.refunds||[]){balances[r.person]=(balances[r.person]||0)+r.cents;balances[d.payer]-=r.cents;}}
 return {total,unpaid,balances};
}
export function validateItem(kind,data) {
 if(!['task','expense','event','shopping','project'].includes(kind))throw Error('Tipo non valido');
 if(!data.title?.trim()||data.title.length>160)throw Error('Inserisci un titolo di massimo 160 caratteri.');
 if(data.date&&!/^\d{4}-\d{2}-\d{2}$/.test(data.date))throw Error('Data non valida');
 if(kind==='expense'&&(!Number.isSafeInteger(data.amount)||data.amount<0))throw Error('Importo non valido');
 if(kind==='expense'&&data.shares?.length&&data.shares.reduce((s,q)=>s+q.cents,0)!==data.amount)throw Error('Le quote non corrispondono al totale');
 if(data.sensitive&&kind!=='event')throw Error('Visibilità riservata prevista per gli appuntamenti');
 return {...data,title:data.title.trim()};
}
export function calendarFile(item) {
 const escape=s=>String(s||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');const date=item.data.date?.replaceAll('-','');if(!date)throw Error('Imposta prima una data');
 const end=new Date(item.data.date+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+1);
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//OrganAIzer//IT','BEGIN:VEVENT',`UID:${item.id}@organaizer`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART;VALUE=DATE:${date}`,`DTEND;VALUE=DATE:${end.toISOString().slice(0,10).replaceAll('-','')}`,`SUMMARY:${escape(item.data.title)}`,`DESCRIPTION:${escape(item.data.note)}`,`LOCATION:${escape(item.data.place)}`,'END:VEVENT','END:VCALENDAR',''].join('\r\n');
}
