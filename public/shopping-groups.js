import {parseLink} from './core.js';

// Un riferimento di gruppo deve puntare al modulo di questa stessa app.
export function shoppingReference(item,href){
  if(item.kind!=='shopping'||item.deleted||!item.data?.url)return null;
  try{
    const url=new URL(item.data.url,href),target=new URL('./shopping.html',href);
    if(url.origin!==target.origin||url.pathname!==target.pathname)return null;
    const ref=parseLink(url.hash);return ref?{...ref,resourceId:item.id,title:item.data.title,version:item.version,data:item.data}:null;
  }catch{return null;}
}

export function groupShoppingReferences(items,href){
  const refs=new Map();
  for(const item of items||[]){const ref=shoppingReference(item,href);if(ref)refs.set(ref.id,ref);}
  return [...refs.values()];
}

// La pubblicazione ha una propria identità stabile, indipendente dagli item della spesa.
// Una risposta persa o una connessione interrotta non deve creare liste diverse.
export async function publishGroupList({list,id,token,publish,snapshot,persist}){
  const pending=list.groupPublication;if(!pending)return false;
  if(!list.created)throw Error('La lista deve essere salvata prima di condividerla.');
  const existing=groupShoppingReferences((await snapshot(pending.groupId)).items,pending.href).find(ref=>ref.id===id&&ref.token===token);
  if(!existing)await publish({p_group:pending.groupId,p_id:pending.resourceId,p_kind:'shopping',p_data:{title:pending.name,status:'open',url:'./shopping.html#'+new URLSearchParams({list:id,key:token})},p_version:0,p_deleted:false});
  list.groupId=pending.groupId;delete list.groupPublication;
  try{persist();}catch(error){list.groupPublication=pending;throw error;}
  return true;
}
