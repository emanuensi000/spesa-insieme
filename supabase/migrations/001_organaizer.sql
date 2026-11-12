-- Additiva: non modifica le liste Spesa preesistenti. Eseguire nel SQL Editor Supabase.
begin;
create schema if not exists organizer_private;
revoke all on schema organizer_private from public,anon,authenticated;
create table if not exists organizer_private.groups(id uuid primary key default gen_random_uuid(),name text not null check(length(name) between 1 and 80),created_at timestamptz not null default now());
create table if not exists organizer_private.members(group_id uuid references organizer_private.groups on delete cascade,user_id uuid not null references auth.users on delete cascade,name text not null check(length(name) between 1 and 80),role text not null check(role in ('owner','admin','member')),primary key(group_id,user_id));
create table if not exists organizer_private.items(id uuid primary key,group_id uuid not null references organizer_private.groups on delete cascade,author uuid not null references auth.users,kind text not null check(kind in ('task','expense','event','shopping','project')),data jsonb not null,version integer not null default 1,deleted boolean not null default false,updated_at timestamptz not null default now());
create table if not exists organizer_private.invites(id uuid primary key default gen_random_uuid(),group_id uuid not null references organizer_private.groups on delete cascade,item_id uuid references organizer_private.items,token_hash bytea not null,permission text not null check(permission in ('read','edit','join')),expires_at timestamptz not null,revoked boolean not null default false,created_by uuid not null references auth.users);
create table if not exists organizer_private.audit(id bigint generated always as identity primary key,group_id uuid not null references organizer_private.groups on delete cascade,actor uuid,action text not null,item_id uuid,created_at timestamptz not null default now());
create index if not exists organizer_items_group on organizer_private.items(group_id);
create index if not exists organizer_members_user on organizer_private.members(user_id);
alter table organizer_private.groups enable row level security;
alter table organizer_private.members enable row level security;
alter table organizer_private.items enable row level security;
alter table organizer_private.invites enable row level security;
alter table organizer_private.audit enable row level security;
revoke all on all tables in schema organizer_private from public,anon,authenticated;

create or replace function organizer_private.role_for(g uuid) returns text language sql stable security definer set search_path='' as $$ select role from organizer_private.members where group_id=g and user_id=auth.uid() $$;
create or replace function organizer_private.can_read(i organizer_private.items) returns boolean language sql stable security definer set search_path='' as $$
 select organizer_private.role_for(i.group_id) is not null and (not coalesce((i.data->>'sensitive')::boolean,false) or i.author=auth.uid() or coalesce(i.data->'readers','[]'::jsonb) ? auth.uid()::text)
$$;
create or replace function organizer_private.validate_data(k text,d jsonb) returns void language plpgsql set search_path='' as $$
declare q jsonb; sum_cents bigint:=0; quota bigint; refunded bigint;
begin
 if d is null or jsonb_typeof(d)<>'object' or octet_length(d::text)>32768 or length(trim(coalesce(d->>'title',''))) not between 1 and 160 or length(coalesce(d->>'note',''))>4000 or coalesce(d->>'status','open') not in ('open','progress','done','cancelled') then raise exception 'Dati non validi' using errcode='22023'; end if;
 if coalesce(d->>'date','')<>'' then perform (d->>'date')::date;end if;
 if coalesce(d->>'repeat','none') not in ('none','daily','weekly','monthly','bimonthly','quarterly','yearly') then raise exception 'Ricorrenza non valida';end if;
 if coalesce((d->>'sensitive')::boolean,false) and k<>'event' then raise exception 'Visibilità non valida';end if;
 if jsonb_typeof(coalesce(d->'readers','[]'::jsonb))<>'array' then raise exception 'Permessi non validi';end if;
 if k='expense' then
  if d->>'amount' is null or (d->>'amount')!~ '^\d{1,10}$' or (d->>'amount')::bigint>9999999999 then raise exception 'Importo non valido';end if;
  if jsonb_typeof(coalesce(d->'shares','[]'::jsonb))<>'array' or jsonb_typeof(coalesce(d->'refunds','[]'::jsonb))<>'array' then raise exception 'Quote non valide';end if;
  for q in select value from jsonb_array_elements(coalesce(d->'shares','[]'::jsonb)) loop
   if (q->>'cents') is null or (q->>'cents')!~ '^\d{1,10}$' or length(trim(coalesce(q->>'person',''))) not between 1 and 80 then raise exception 'Quota non valida';end if;
   sum_cents:=sum_cents+(q->>'cents')::bigint;
  end loop;
  if jsonb_array_length(coalesce(d->'shares','[]'::jsonb))>0 and sum_cents<>(d->>'amount')::bigint then raise exception 'Totale quote errato';end if;
  for q in select value from jsonb_array_elements(coalesce(d->'refunds','[]'::jsonb)) loop
   if (q->>'cents') is null or (q->>'cents')!~ '^\d{1,10}$' then raise exception 'Rimborso non valido';end if;
   select coalesce(sum((value->>'cents')::bigint),0) into quota from jsonb_array_elements(coalesce(d->'shares','[]'::jsonb)) where value->>'person'=q->>'person';
   select coalesce(sum((value->>'cents')::bigint),0) into refunded from jsonb_array_elements(coalesce(d->'refunds','[]'::jsonb)) where value->>'person'=q->>'person';
   if quota=0 or refunded>quota or q->>'person'=d->>'payer' then raise exception 'Rimborso superiore alla quota';end if;
  end loop;
 end if;
end $$;

create or replace function public.organizer_groups() returns jsonb language sql security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',g.id,'name',g.name,'role',m.role,'memberName',m.name) order by g.created_at),'[]'::jsonb) from organizer_private.groups g join organizer_private.members m on m.group_id=g.id where m.user_id=auth.uid()
$$;
create or replace function public.organizer_create_group(p_name text,p_member_name text,p_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Accesso richiesto' using errcode='42501';end if;
 if length(trim(p_name)) not between 1 and 80 or length(trim(p_member_name)) not between 1 and 80 then raise exception 'Nome non valido';end if;
 if exists(select 1 from organizer_private.groups where id=p_id) then
  if organizer_private.role_for(p_id)='owner' then return p_id;else raise exception 'Accesso negato';end if;
 end if;
 insert into organizer_private.groups(id,name) values(p_id,trim(p_name));
 insert into organizer_private.members values(p_id,auth.uid(),trim(p_member_name),'owner');return p_id;
end $$;
create or replace function public.organizer_snapshot(p_group uuid) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if organizer_private.role_for(p_group) is null then raise exception 'Accesso negato' using errcode='42501';end if;
 return jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(i)) from organizer_private.items i where i.group_id=p_group and organizer_private.can_read(i)),'[]'::jsonb),'members',coalesce((select jsonb_agg(jsonb_build_object('id',user_id,'name',name,'role',role)) from organizer_private.members where group_id=p_group),'[]'::jsonb),'invites',case when organizer_private.role_for(p_group) in ('owner','admin') then coalesce((select jsonb_agg(jsonb_build_object('id',id,'item_id',item_id,'permission',permission,'expires_at',expires_at,'revoked',revoked)) from organizer_private.invites where group_id=p_group),'[]'::jsonb) else '[]'::jsonb end);
end $$;
create or replace function public.organizer_save(p_group uuid,p_id uuid,p_kind text,p_data jsonb,p_version integer,p_deleted boolean default false) returns jsonb language plpgsql security definer set search_path='' as $$
declare i organizer_private.items; result organizer_private.items;
begin
 if organizer_private.role_for(p_group) is null then raise exception 'Accesso negato' using errcode='42501';end if;
 perform organizer_private.validate_data(p_kind,p_data);
 -- Serialize inserts as well as updates for retries using the same resource ID.
 perform 1 from organizer_private.groups where id=p_group for update;
 select * into i from organizer_private.items where id=p_id for update;
 if found then
  if i.kind<>p_kind then raise exception 'Il tipo non può essere cambiato';end if;
  if i.group_id<>p_group or not organizer_private.can_read(i) then raise exception 'Accesso negato' using errcode='42501';end if;
  if coalesce((i.data->>'sensitive')::boolean,false) and i.author<>auth.uid() then raise exception 'Solo l’autore modifica un appuntamento riservato' using errcode='42501';end if;
  if i.data=p_data and i.deleted=p_deleted and i.kind=p_kind then return to_jsonb(i);end if;
  if i.version<>p_version then raise exception 'Conflitto: ricarica prima di modificare' using errcode='40001';end if;
  update organizer_private.items set data=p_data,deleted=p_deleted,version=version+1,updated_at=now() where id=p_id returning * into result;
 else
  if p_version<>0 then raise exception 'Elemento non trovato';end if;
  insert into organizer_private.items(id,group_id,author,kind,data,deleted) values(p_id,p_group,auth.uid(),p_kind,p_data,p_deleted) returning * into result;
 end if;
 insert into organizer_private.audit(group_id,actor,action,item_id) values(p_group,auth.uid(),case when p_deleted then 'delete' else 'save' end,p_id);
 return to_jsonb(result);
end $$;
create or replace function public.organizer_invite(p_group uuid,p_item uuid,p_permission text,p_token text,p_days integer default 7) returns uuid language plpgsql security definer set search_path='' as $$
declare i organizer_private.items; result uuid;
begin
 if organizer_private.role_for(p_group) not in ('owner','admin') or organizer_private.role_for(p_group) is null then raise exception 'Accesso negato' using errcode='42501';end if;
 if p_token is null or p_token !~ '^[0-9a-f]{64}$' or p_days not between 1 and 30 then raise exception 'Invito non valido';end if;
 if p_item is null then
  if p_permission<>'join' then raise exception 'Permesso non valido';end if;
 else
  select * into i from organizer_private.items where id=p_item and group_id=p_group and not deleted;
  if not found or coalesce((i.data->>'sensitive')::boolean,false) or p_permission not in ('read','edit') or (p_permission='edit' and i.kind not in ('task','project')) then raise exception 'Condivisione non consentita';end if;
 end if;
 insert into organizer_private.invites(group_id,item_id,token_hash,permission,expires_at,created_by) values(p_group,p_item,sha256(convert_to(p_token,'UTF8')),p_permission,now()+make_interval(days=>p_days),auth.uid()) returning id into result;return result;
end $$;
create or replace function public.organizer_read_invite(p_id uuid,p_token text) returns jsonb language plpgsql security definer set search_path='' as $$
declare v organizer_private.invites;i organizer_private.items;
begin
 select * into v from organizer_private.invites where id=p_id and not revoked and expires_at>now();
 if not found or p_token is null or p_token!~'^[0-9a-f]{64}$' or v.token_hash is distinct from sha256(convert_to(p_token,'UTF8')) then raise exception 'Invito scaduto, revocato o non valido' using errcode='42501';end if;
 if v.item_id is not null then
  select * into i from organizer_private.items where id=v.item_id and not deleted;
  if not found or coalesce((i.data->>'sensitive')::boolean,false) then raise exception 'Risorsa non disponibile';end if;
 end if;
 return jsonb_build_object('permission',v.permission,'groupName',(select name from organizer_private.groups where id=v.group_id),'item',case when v.item_id is null then null else jsonb_build_object('id',i.id,'kind',i.kind,'data',i.data,'version',i.version) end);
end $$;
create or replace function public.organizer_guest_complete(p_id uuid,p_token text,p_version integer,p_done boolean) returns jsonb language plpgsql security definer set search_path='' as $$
declare v organizer_private.invites;i organizer_private.items;
begin
 perform public.organizer_read_invite(p_id,p_token);
 select * into v from organizer_private.invites where id=p_id for update;
 if v.revoked or v.expires_at<=now() or v.permission<>'edit' then raise exception 'Accesso negato' using errcode='42501';end if;
 select * into i from organizer_private.items where id=v.item_id for update;
 if i.kind not in ('task','project') or coalesce((i.data->>'sensitive')::boolean,false) or i.deleted then raise exception 'Accesso negato';end if;
 if i.version<>p_version then raise exception 'Conflitto: ricarica' using errcode='40001';end if;
 update organizer_private.items set data=jsonb_set(data,'{status}',to_jsonb(case when p_done then 'done'::text else 'open'::text end)),version=version+1,updated_at=now() where id=i.id;
 insert into organizer_private.audit(group_id,action,item_id) values(v.group_id,'guest_complete',i.id);
 return public.organizer_read_invite(p_id,p_token);
end $$;
create or replace function public.organizer_join(p_id uuid,p_token text,p_name text) returns uuid language plpgsql security definer set search_path='' as $$
declare v organizer_private.invites;
begin
 if auth.uid() is null then raise exception 'Accesso richiesto';end if;
 perform public.organizer_read_invite(p_id,p_token);
 select * into v from organizer_private.invites where id=p_id for update;
 if v.revoked or v.expires_at<=now() or v.permission<>'join' or length(trim(p_name)) not between 1 and 80 then raise exception 'Invito non valido';end if;
 insert into organizer_private.members values(v.group_id,auth.uid(),trim(p_name),'member') on conflict do nothing;
 return v.group_id;
end $$;
create or replace function public.organizer_revoke(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare g uuid;
begin
 select group_id into g from organizer_private.invites where id=p_id;
 if organizer_private.role_for(g) is null or organizer_private.role_for(g) not in ('owner','admin') then raise exception 'Accesso negato';end if;
 update organizer_private.invites set revoked=true where id=p_id;
end $$;
create or replace function public.organizer_member(p_group uuid,p_user uuid,p_role text) returns void language plpgsql security definer set search_path='' as $$
declare target_member_role text;
begin
 perform 1 from organizer_private.groups where id=p_group for update;
 select role into target_member_role from organizer_private.members where group_id=p_group and user_id=p_user;
 if target_member_role is null then raise exception 'Membro non trovato';end if;
 if p_role='leave' and p_user=auth.uid() then null;
 elsif organizer_private.role_for(p_group)<>'owner' or organizer_private.role_for(p_group) is null then raise exception 'Solo il proprietario gestisce i ruoli';end if;
 if target_member_role='owner' and p_role<>'owner' and (select count(*) from organizer_private.members where group_id=p_group and role='owner')=1 then raise exception 'Nomina prima un altro proprietario';end if;
 if p_role in ('remove','leave') then delete from organizer_private.members where group_id=p_group and user_id=p_user;
 elsif p_role in ('owner','admin','member') then update organizer_private.members set role=p_role where group_id=p_group and user_id=p_user;
 else raise exception 'Ruolo non valido';end if;
end $$;

revoke all on all functions in schema organizer_private from public,anon,authenticated;
revoke all on function public.organizer_groups(),public.organizer_create_group(text,text,uuid),public.organizer_snapshot(uuid),public.organizer_save(uuid,uuid,text,jsonb,integer,boolean),public.organizer_invite(uuid,uuid,text,text,integer),public.organizer_read_invite(uuid,text),public.organizer_guest_complete(uuid,text,integer,boolean),public.organizer_join(uuid,text,text),public.organizer_revoke(uuid),public.organizer_member(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.organizer_groups(),public.organizer_create_group(text,text,uuid),public.organizer_snapshot(uuid),public.organizer_save(uuid,uuid,text,jsonb,integer,boolean),public.organizer_invite(uuid,uuid,text,text,integer),public.organizer_join(uuid,text,text),public.organizer_revoke(uuid),public.organizer_member(uuid,uuid,text) to authenticated;
grant execute on function public.organizer_read_invite(uuid,text),public.organizer_guest_complete(uuid,text,integer,boolean) to anon,authenticated;
notify pgrst,'reload schema';
commit;
