-- Eseguire nel SQL Editor di un progetto Supabase nuovo.
-- Il frontend usa esclusivamente la publishable key. Mai la service_role.
begin;
create schema if not exists spesa_private;
revoke all on schema spesa_private from public, anon, authenticated;

create table if not exists spesa_private.lists (
  id uuid primary key,
  token_hash bytea not null,
  name text not null check (length(name) between 1 and 80),
  items jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists spesa_private.operations (
  list_id uuid not null references spesa_private.lists(id) on delete cascade,
  op_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (list_id, op_id)
);
alter table spesa_private.lists enable row level security;
alter table spesa_private.operations enable row level security;
revoke all on all tables in schema spesa_private from public, anon, authenticated;

create or replace function public.create_shared_list(p_list_id uuid, p_token text, p_name text)
returns void language plpgsql security definer set search_path = '' as $$
declare stored_hash bytea;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' or p_name is null or length(trim(p_name)) not between 1 and 80 then
    raise exception 'Invalid request' using errcode = '22023';
  end if;
  insert into spesa_private.lists(id, token_hash, name)
    values(p_list_id, pg_catalog.sha256(pg_catalog.convert_to(p_token, 'UTF8')), trim(p_name))
    on conflict (id) do nothing;
  select token_hash into stored_hash from spesa_private.lists where id = p_list_id;
  if stored_hash is distinct from pg_catalog.sha256(pg_catalog.convert_to(p_token, 'UTF8')) then
    raise exception 'Access denied' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.read_shared_list(p_list_id uuid, p_token text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare current_list spesa_private.lists%rowtype;
begin
  select * into current_list from spesa_private.lists where id = p_list_id;
  if not found or p_token is null or p_token !~ '^[0-9a-f]{64}$' or current_list.token_hash is distinct from pg_catalog.sha256(pg_catalog.convert_to(p_token, 'UTF8')) then
    raise exception 'Access denied' using errcode = '42501';
  end if;
  return pg_catalog.jsonb_build_object('name', current_list.name, 'items',
    coalesce((select pg_catalog.jsonb_agg(value) from pg_catalog.jsonb_each(current_list.items)), '[]'::jsonb));
end;
$$;

create or replace function public.apply_list_operation(p_list_id uuid, p_token text, p_operation jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  current_list spesa_private.lists%rowtype;
  operation_id uuid;
  item_id uuid;
  operation_kind text;
  operation_data jsonb;
  item jsonb;
begin
  -- Un lock per lista serializza modifiche concorrenti senza perdere altri prodotti.
  select * into current_list from spesa_private.lists where id = p_list_id for update;
  if not found or p_token is null or p_token !~ '^[0-9a-f]{64}$' or current_list.token_hash is distinct from pg_catalog.sha256(pg_catalog.convert_to(p_token, 'UTF8')) then
    raise exception 'Access denied' using errcode = '42501';
  end if;
  if p_operation is null or pg_catalog.octet_length(p_operation::text) > 4096 then
    raise exception 'Invalid operation' using errcode = '22023';
  end if;
  operation_id := (p_operation->>'op_id')::uuid;
  item_id := (p_operation->>'item_id')::uuid;
  operation_kind := p_operation->>'kind';
  operation_data := p_operation->'data';
  if operation_id is null or item_id is null or operation_kind is null or operation_kind not in ('add','check','delete') or operation_data is null or pg_catalog.jsonb_typeof(operation_data) <> 'object' then
    raise exception 'Invalid operation' using errcode = '22023';
  end if;
  if exists(select 1 from spesa_private.operations where list_id = p_list_id and op_id = operation_id) then
    return public.read_shared_list(p_list_id, p_token);
  end if;
  item := current_list.items->item_id::text;
  if operation_kind = 'add' then
    if operation_data->>'name' is null or length(trim(operation_data->>'name')) not between 1 and 160
      or length(coalesce(operation_data->>'quantity','')) > 40 or length(coalesce(operation_data->>'note','')) > 500 then
      raise exception 'Invalid product' using errcode = '22023';
    end if;
    if operation_data->>'price' is not null and ((operation_data->>'price')::numeric < 0 or (operation_data->>'price')::numeric > 10000) then
      raise exception 'Invalid price' using errcode = '22023';
    end if;
    if item is null then
      if (select count(*) from pg_catalog.jsonb_object_keys(current_list.items)) >= 5000 then
        raise exception 'List capacity reached' using errcode = '22023';
      end if;
      item := pg_catalog.jsonb_build_object('id', item_id, 'name', trim(operation_data->>'name'), 'quantity', coalesce(operation_data->>'quantity',''),
        'note', coalesce(operation_data->>'note',''), 'price', (operation_data->>'price')::numeric, 'checked', false, 'deleted', false,
        'created_at', coalesce((operation_data->>'created_at')::timestamptz, now()));
    end if;
  elsif operation_kind = 'check' then
    if pg_catalog.jsonb_typeof(operation_data->'checked') is distinct from 'boolean' then
      raise exception 'Invalid check' using errcode = '22023';
    end if;
    if item is not null and not (item->>'deleted')::boolean then
      item := item || pg_catalog.jsonb_build_object('checked', operation_data->'checked');
    end if;
  elsif operation_kind = 'delete' and item is not null then
    item := item || '{"deleted":true}'::jsonb;
  end if;
  if item is not null then
    update spesa_private.lists set items = pg_catalog.jsonb_set(items, array[item_id::text], item) where id = p_list_id;
  end if;
  insert into spesa_private.operations(list_id, op_id) values(p_list_id, operation_id);
  return public.read_shared_list(p_list_id, p_token);
end;
$$;

revoke all on function public.create_shared_list(uuid,text,text) from public;
revoke all on function public.read_shared_list(uuid,text) from public;
revoke all on function public.apply_list_operation(uuid,text,jsonb) from public;
grant execute on function public.create_shared_list(uuid,text,text) to anon;
grant execute on function public.read_shared_list(uuid,text) to anon;
grant execute on function public.apply_list_operation(uuid,text,jsonb) to anon;
commit;
