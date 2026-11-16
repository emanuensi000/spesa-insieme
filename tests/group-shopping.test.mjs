import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {groupShoppingReferences,publishGroupList} from '../public/shopping-groups.js';

const alice='11111111-1111-4111-8111-111111111111',bob='22222222-2222-4222-8222-222222222222';
const outsider='33333333-3333-4333-8333-333333333333',group='44444444-4444-4444-8444-444444444444';
const href='https://example.test/spesa-insieme/shopping.html?group='+group;
const reference=(id,token)=>({kind:'shopping',id:crypto.randomUUID(),version:1,data:{title:'Spesa',url:'./shopping.html#'+new URLSearchParams({list:id,key:token})}});

test('i riferimenti accettano solo liste valide della stessa applicazione',()=>{
  const good=reference(crypto.randomUUID(),'a'.repeat(64));
  const items=[good,{...good,deleted:true},{...good,kind:'task'},{...good,data:{url:'https://other.test/shopping.html'+new URL(good.data.url,href).hash}},{...good,data:{url:'./profile.html'+new URL(good.data.url,href).hash}},{...good,data:{url:'./shopping.html#list=broken'}}];
  assert.equal(groupShoppingReferences(items,href).length,1);
  assert.equal(groupShoppingReferences([good,good],href).length,1);
});

test('due membri scoprono più liste e condividono modifiche; una risposta persa non duplica la lista',async()=>{
  const db=new PGlite();
  try{
    await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`);
    for(const file of ['schema.sql','migrations/001_organaizer.sql','migrations/002_shopping_history.sql'])await db.exec(await readFile(new URL('../supabase/'+file,import.meta.url),'utf8'));
    await db.query('insert into auth.users values($1),($2),($3)',[alice,bob,outsider]);
    async function as(user){await db.exec('reset role;set role authenticated;');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]);}
    async function call(name,args=[]){return (await db.query(`select public.${name}(${args.map((_,i)=>'$'+(i+1)).join(',')}) result`,args)).rows[0].result;}
    await as(alice);await call('organizer_create_group',['Casa','Anna',group]);
    const invitation=await call('organizer_invite',[group,null,'join','f'.repeat(64),7]);
    await as(bob);await call('organizer_join',[invitation,'f'.repeat(64),'Luca']);
    const lists=[];
    for(const name of ['Settimanale','Festa']){
      // La lista è creata dal client anonimo, il riferimento di gruppo con la sessione.
      const id=crypto.randomUUID(),token=crypto.randomUUID().replaceAll('-','').repeat(2);
      await db.exec('reset role;set role anon;');await call('create_shared_list',[id,token,name]);
      await as(alice);
      const list={created:true,groupPublication:{groupId:group,resourceId:crypto.randomUUID(),name,href}};
      let attempts=0;
      const options={list,id,token,snapshot:()=>call('organizer_snapshot',[group]),persist(){},publish:async p=>{
        attempts++;await call('organizer_save',[p.p_group,p.p_id,p.p_kind,p.p_data,p.p_version,p.p_deleted]);
        throw Error('Risposta persa dopo il salvataggio');
      }};
      await assert.rejects(()=>publishGroupList(options),/Risposta persa/);
      assert.ok(list.groupPublication);
      assert.equal(await publishGroupList(options),true);
      assert.equal(attempts,1);assert.equal(list.groupPublication,undefined);assert.equal(list.groupId,group);
      lists.push({id,token});
    }
    await as(bob);
    const refs=groupShoppingReferences((await call('organizer_snapshot',[group])).items,href);
    assert.equal(refs.length,2);
    const [first,second]=lists,product=crypto.randomUUID();
    await call('apply_list_operation',[first.id,first.token,{op_id:crypto.randomUUID(),item_id:product,kind:'add',data:{name:'Latte',quantity:'1 l',price:1.2}}]);
    await as(alice);
    assert.equal((await call('read_shared_list',[first.id,first.token])).items[0].name,'Latte');
    await call('apply_list_operation',[first.id,first.token,{op_id:crypto.randomUUID(),item_id:product,kind:'check',data:{checked:true}}]);
    await as(bob);
    assert.equal((await call('read_shared_list',[first.id,first.token])).items[0].checked,true);
    assert.equal((await call('read_shared_list',[second.id,second.token])).items.length,0);
    await assert.rejects(()=>call('read_shared_list',[second.id,first.token]),/Access denied/);
    const ref=refs.find(r=>r.id===first.id);
    await call('organizer_save',[group,ref.resourceId,'shopping',{...ref.data,title:'Weekend'},ref.version,false]);
    await as(alice);
    assert.equal(groupShoppingReferences((await call('organizer_snapshot',[group])).items,href).find(r=>r.id===first.id).title,'Weekend');
    await as(outsider);await assert.rejects(()=>call('organizer_snapshot',[group]),/Accesso negato/);
  }finally{await db.close();}
});
