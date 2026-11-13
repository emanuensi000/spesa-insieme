-- Storico Spesa: migrazione additiva, compatibile con i vecchi link e client.
begin;
alter table spesa_private.lists add column if not exists closed_receipt jsonb;

create or replace function public.read_shared_list(p_list_id uuid, p_token text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare current_list spesa_private.lists%rowtype;
begin
  select * into current_list from spesa_private.lists where id = p_list_id;
  if not found or p_token is null or p_token !~ '^[0-9a-f]{64}$' or current_list.token_hash is distinct from pg_catalog.sha256(pg_catalog.convert_to(p_token, 'UTF8')) then
    raise exception 'Access denied' using errcode = '42501';
  end if;
  return pg_catalog.jsonb_build_object('name', current_list.name, 'items',
    coalesce((select pg_catalog.jsonb_agg(value) from pg_catalog.jsonb_each(current_list.items)), '[]'::jsonb),
    'receipt', current_list.closed_receipt);
end;
$$;

create or replace function public.close_shared_list(p_list_id uuid, p_token text, p_expected jsonb, p_amount integer, p_date date, p_photos jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  current_list spesa_private.lists%rowtype;
  expected jsonb;
  receipt_items jsonb;
  photo jsonb;
  box jsonb;
  estimated bigint;
  unpriced integer;
begin
  select * into current_list from spesa_private.lists where id = p_list_id for update;
  if not found or p_token is null or p_token !~ '^[0-9a-f]{64}$' or current_list.token_hash is distinct from pg_catalog.sha256(pg_catalog.convert_to(p_token, 'UTF8')) then
    raise exception 'Access denied' using errcode = '42501';
  end if;
  -- Il primo partecipante che chiude stabilisce lo scontrino definitivo.
  if current_list.closed_receipt is not null then return public.read_shared_list(p_list_id,p_token); end if;
  if p_amount is null or p_amount < 0 or p_amount > 100000000 or p_date is null or p_date > (now() at time zone 'Europe/Rome')::date
    or p_expected is null or pg_catalog.jsonb_typeof(p_expected) <> 'array'
    or p_photos is null or pg_catalog.jsonb_typeof(p_photos) <> 'object' or pg_catalog.octet_length(p_photos::text)>2000000 then
    raise exception 'Invalid receipt' using errcode = '22023';
  end if;
  select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('id',value->'id','name',value->'name',
    'quantity',coalesce(value->>'quantity',''),'note',coalesce(value->>'note',''),'price',value->'price','checked',value->'checked') order by value->>'id'),'[]'::jsonb)
    into expected from pg_catalog.jsonb_each(current_list.items) where not (value->>'deleted')::boolean;
  if expected is distinct from p_expected then
    raise exception 'The list changed. Review the receipt before closing.' using errcode = '40001';
  end if;
  if not exists(select 1 from pg_catalog.jsonb_each(current_list.items) where (value->>'checked')::boolean and not (value->>'deleted')::boolean) then
    raise exception 'No purchased products' using errcode = '22023';
  end if;
  for photo in select value from pg_catalog.jsonb_each(p_photos) loop
    box := photo->'region';
    if pg_catalog.jsonb_typeof(photo) <> 'object' or coalesce(photo->>'path','') !~ '^\./flyers/[a-z0-9-]+/page-[0-9]{2}\.jpg$'
      or pg_catalog.jsonb_typeof(box) is distinct from 'array' then
      raise exception 'Invalid product photo' using errcode = '22023';
    end if;
    if pg_catalog.jsonb_array_length(box) <> 4 then raise exception 'Invalid crop' using errcode = '22023'; end if;
    if exists(select 1 from pg_catalog.jsonb_array_elements(box) as n where pg_catalog.jsonb_typeof(n) <> 'number')
      or (box->>0)::numeric < 0 or (box->>1)::numeric < 0 or (box->>2)::numeric <= 0 or (box->>3)::numeric <= 0
      or (box->>0)::numeric+(box->>2)::numeric > 1.000001 or (box->>1)::numeric+(box->>3)::numeric > 1.000001 then
      raise exception 'Invalid crop' using errcode = '22023';
    end if;
  end loop;
  select pg_catalog.jsonb_agg(value || pg_catalog.jsonb_build_object('photo',p_photos->key) order by value->>'created_at',key)
    into receipt_items from pg_catalog.jsonb_each(current_list.items) where not (value->>'deleted')::boolean;
  select coalesce(sum(round((value->>'price')::numeric*100)),0)::bigint,
    count(*) filter (where value->>'price' is null)::integer into estimated,unpriced
    from pg_catalog.jsonb_each(current_list.items) where (value->>'checked')::boolean and not (value->>'deleted')::boolean;
  update spesa_private.lists set closed_receipt=pg_catalog.jsonb_build_object('id',id,'name',name,'date',p_date,
    'closed_at',now(),'amount_cents',p_amount,'estimate_cents',estimated,'unpriced',unpriced,'items',receipt_items) where id=p_list_id;
  return public.read_shared_list(p_list_id,p_token);
end;
$$;

revoke all on function public.close_shared_list(uuid,text,jsonb,integer,date,jsonb) from public;
grant execute on function public.close_shared_list(uuid,text,jsonb,integer,date,jsonb) to anon,authenticated;
grant execute on function public.read_shared_list(uuid,text) to authenticated;

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
  if current_list.closed_receipt is not null then
    raise exception 'List is closed' using errcode = '55000';
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


grant execute on function public.apply_list_operation(uuid,text,jsonb) to authenticated;
commit;
