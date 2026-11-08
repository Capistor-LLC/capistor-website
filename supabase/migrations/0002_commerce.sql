-- Commerce is additive: existing portfolio products are not shop inventory.
-- Apply in staging first. All commerce writes go through the authenticated API.
begin;
create table if not exists public.staff_members (
 user_id uuid primary key references auth.users(id), created_at timestamptz not null default now()
);
alter table public.staff_members enable row level security;
revoke all on public.staff_members from anon, authenticated;
grant select on public.staff_members to authenticated;
create policy staff_self_read on public.staff_members for select to authenticated using(user_id=auth.uid());
-- Preserve the existing owner only if the email is verified. Never promote a signup automatically.
insert into public.staff_members(user_id) select id from auth.users where lower(email)='shoaib@capistor.com' and email_confirmed_at is not null on conflict do nothing;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select coalesce(auth.jwt()->>'aal'='aal2',false) and exists(select 1 from public.staff_members where user_id=auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon,authenticated,service_role;

create table public.shop_items (
 id uuid primary key default gen_random_uuid(), slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 title text not null, kind text not null check(kind in ('service','digital')), category text not null default 'PCB design',
 summary text not null, description text not null default '', image_url text not null default '',
 price_minor integer not null check(price_minor>=100 and price_minor<=100000000),
 currency text not null default 'USD' check(currency in ('USD','AED','EUR','GBP')),
 tax_bps integer not null default 0 check(tax_bps between 0 and 2500),
 delivery_days integer not null default 3 check(delivery_days between 0 and 365),
 revision_limit integer not null default 1 check(revision_limit between 0 and 20),
 scope text not null, exclusions text not null, license_text text not null default '',
 version text not null default '1.0', published boolean not null default false,
 checkout_enabled boolean not null default false, requires_quote boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.business_settings (
 id boolean primary key default true check(id), legal_name text not null default 'CAPISTOR TECHNOLOGIES - FZCO',
 contact_email text not null default 'inquiry@capistor.com', address text not null default 'Silicon Oasis, Dubai, UAE',
 registration_number text not null default '', verification_url text not null default '',
 portrait_url text not null default '/cv_assets/my_picture.png', license_url text not null default '',
 license_redacted_confirmed boolean not null default false,
 terms text not null default '', privacy text not null default '', refund_policy text not null default '',
 legal_approved boolean not null default false,
 bank_enabled boolean not null default false, stripe_enabled boolean not null default false,
 btc_enabled boolean not null default false, fiverr_enabled boolean not null default true,
 updated_at timestamptz not null default now()
);
insert into public.business_settings(id) values(true);
create table public.legal_templates (
 id text primary key check(id in ('nda','contract')), title text not null,
 body text not null, approved boolean not null default false, updated_at timestamptz not null default now()
);
create table public.client_orders (
 id uuid primary key default gen_random_uuid(), reference text not null unique default ('CAP-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
 client_id uuid not null references auth.users(id), item_id uuid not null references public.shop_items(id),
 item_snapshot jsonb not null, client_name text not null, company text not null default '',
 billing_address text not null, brief text not null,
 status text not null default 'received' check(status in ('received','scoping','awaiting_agreement','awaiting_payment','in_progress','client_review','completed','cancelled')),
 payment_status text not null default 'unpaid' check(payment_status in ('unpaid','pending','paid','partially_refunded','refunded','disputed')),
 total_minor integer not null check(total_minor>0), currency text not null,
 due_at timestamptz, outcome text not null default '',
 accepted_terms text not null, accepted_license text not null default '',
 request_key uuid not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(client_id,request_key)
);
create index orders_client on public.client_orders(client_id,created_at desc);
create table public.order_events (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.client_orders(id),
 actor_id uuid references auth.users(id), kind text not null, title text not null,
 detail text not null default '', findings text not null default '', outcome text not null default '',
 created_at timestamptz not null default now()
);
create index events_order on public.order_events(order_id,created_at);
create table public.order_documents (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.client_orders(id),
 kind text not null check(kind in ('nda','contract')), version integer not null check(version>0),
 title text not null, body text not null, sha256 text not null,
 status text not null default 'draft' check(status in ('draft','issued','superseded')),
 created_at timestamptz not null default now(), unique(order_id,kind,version)
);
create table public.document_signatures (
 id uuid primary key default gen_random_uuid(), document_id uuid not null references public.order_documents(id),
 signer_id uuid not null references auth.users(id), signer_name text not null, signer_email text not null,
 party text not null check(party in ('client','company')), document_sha256 text not null,
 consent_text text not null, signed_at timestamptz not null default now(), unique(document_id,party)
);
create table public.project_files (
 id uuid primary key default gen_random_uuid(), order_id uuid references public.client_orders(id), item_id uuid references public.shop_items(id),
 uploaded_by uuid not null references auth.users(id), filename text not null, mime text not null,
 size_bytes bigint not null check(size_bytes>0 and size_bytes<=26214400), sha256 text not null,
 object_key text not null unique, stage_key text not null unique,
 status text not null default 'uploading' check(status in ('uploading','quarantined','approved','rejected')),
 review_note text not null default '', reviewed_by uuid references auth.users(id), reviewed_at timestamptz,
 version_label text not null default '1', created_at timestamptz not null default now(),
 check((order_id is not null)::int+(item_id is not null)::int=1)
);
create table public.order_entitlements (
 order_id uuid not null references public.client_orders(id), file_id uuid not null references public.project_files(id), primary key(order_id,file_id)
);
create table public.payment_attempts (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.client_orders(id),
 provider text not null check(provider in ('stripe','bank','btcpay','fiverr')),
 external_id text, checkout_url text, state text not null default 'created',
 total_minor integer not null, currency text not null,
 created_at timestamptz not null default now(), unique(provider,external_id)
);
create table public.payment_events (
 provider text not null, event_id text not null, order_id uuid not null references public.client_orders(id),
 payment_identity text not null, event_type text not null, created_at timestamptz not null default now(), primary key(provider,event_id)
);
create unique index payment_identity_once on public.payment_events(provider,payment_identity) where event_type in ('accepted','settled');
create unique index accepted_payment_once on public.payment_events(order_id) where event_type='accepted';
create table public.api_limits (key text primary key, count integer not null, resets_at timestamptz not null);

-- Only the server may modify commercial facts, signatures, access, or payment state.
do $$ declare t text; begin
 foreach t in array array['shop_items','business_settings','legal_templates','client_orders','order_events','order_documents','document_signatures','project_files','order_entitlements','payment_attempts','payment_events','api_limits'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon, authenticated',t);
  execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;
grant select on public.shop_items to anon,authenticated;
create policy shop_read on public.shop_items for select using(published or public.is_admin());
grant select on public.client_orders,public.order_events,public.order_documents,public.document_signatures to authenticated;
create policy orders_read on public.client_orders for select to authenticated using(client_id=auth.uid() or public.is_admin());
create policy events_read on public.order_events for select to authenticated using(exists(select 1 from public.client_orders o where o.id=order_id and (o.client_id=auth.uid() or public.is_admin())));
create policy docs_read on public.order_documents for select to authenticated using(public.is_admin() or (status<>'draft' and exists(select 1 from public.client_orders o where o.id=order_id and o.client_id=auth.uid())));
create policy signatures_read on public.document_signatures for select to authenticated using(exists(select 1 from public.order_documents d where d.id=document_id));

create function public.immutable_record() returns trigger language plpgsql set search_path='' as $$ begin raise exception 'Audit records cannot be edited or deleted'; end $$;
create trigger events_immutable before update or delete on public.order_events for each row execute function public.immutable_record();
create trigger signatures_immutable before update or delete on public.document_signatures for each row execute function public.immutable_record();
create trigger payment_events_immutable before update or delete on public.payment_events for each row execute function public.immutable_record();
create function public.protect_document() returns trigger language plpgsql set search_path='' as $$ begin
 if tg_op='DELETE' then raise exception 'Documents cannot be deleted'; end if;
 if old.status<>'draft' and (new.body<>old.body or new.sha256<>old.sha256 or new.title<>old.title or new.version<>old.version or new.order_id<>old.order_id or new.kind<>old.kind or new.status='draft') then raise exception 'Issued documents are immutable; create a new version'; end if;
 return new;
end $$;
create trigger document_guard before update or delete on public.order_documents for each row execute function public.protect_document();
create function public.consume_api_limit(p_key text,p_limit integer,p_seconds integer) returns boolean language plpgsql security definer set search_path='' as $$
 declare n integer; begin
 insert into public.api_limits(key,count,resets_at) values(p_key,1,now()+make_interval(secs=>p_seconds))
 on conflict(key) do update set count=case when api_limits.resets_at<now() then 1 else api_limits.count+1 end,
 resets_at=case when api_limits.resets_at<now() then now()+make_interval(secs=>p_seconds) else api_limits.resets_at end returning count into n;
 return n<=p_limit; end $$;

-- Serializes delivery entitlement and payments, rejects altered totals, and tolerates retries.
create function public.settle_order(p_order uuid,p_provider text,p_event text,p_identity text,p_amount integer,p_currency text,p_attempt uuid default null,p_external_id text default null,p_actor uuid default null,p_invoice jsonb default null) returns boolean language plpgsql security definer set search_path='' as $$
 declare o public.client_orders; a public.payment_attempts; accepted boolean; reversal text; begin
 select * into o from public.client_orders where id=p_order for update;
 if not found then raise exception 'Order missing'; end if;
 if o.total_minor is distinct from p_amount or upper(o.currency) is distinct from upper(p_currency) then raise exception 'Payment amount or currency mismatch'; end if;
 if nullif(p_identity,'') is null then raise exception 'Missing payment identity'; end if;
 if p_provider='bank' then
  select * into a from public.payment_attempts where order_id=p_order and provider='bank' and (state='pending' or (state='paid' and external_id=p_identity)) for update;
  p_external_id=p_identity;
 else
  select * into a from public.payment_attempts where id=p_attempt and order_id=p_order and provider=p_provider for update;
 end if;
 if a.id is null or nullif(p_external_id,'') is null or (a.external_id is not null and a.external_id<>p_external_id) then raise exception 'Payment attempt mismatch'; end if;
 if exists(select 1 from public.payment_events where provider=p_provider and (event_id=p_event or (payment_identity=p_identity and event_type in ('accepted','settled'))) and (order_id<>p_order or payment_identity<>p_identity)) then raise exception 'Payment reference already belongs to another payment'; end if;
 if exists(select 1 from public.payment_events where provider=p_provider and payment_identity=p_identity and event_type in ('accepted','settled')) then
  if p_provider='stripe' and p_invoice is not null and exists(select 1 from public.payment_events where order_id=p_order and provider=p_provider and payment_identity=p_identity and event_type='accepted') then
   update public.client_orders set invoice_id=coalesce(invoice_id,p_invoice->>'id'),invoice_url=coalesce(p_invoice->>'url',invoice_url),invoice_pdf=coalesce(p_invoice->>'pdf',invoice_pdf),tax_minor=coalesce((p_invoice->>'tax_minor')::integer,tax_minor) where id=p_order;
  end if;
  return false;
 end if;
 accepted=o.payment_status in ('unpaid','pending') and o.status='awaiting_payment' and public.order_agreements_ready(p_order);
 insert into public.payment_events(provider,event_id,order_id,payment_identity,event_type) values(p_provider,p_event,p_order,p_identity,case when accepted then 'accepted' else 'settled' end);
 update public.payment_attempts set state='paid',external_id=p_external_id where id=a.id;
 if not accepted then
  insert into public.order_events(order_id,actor_id,kind,title,detail) values(p_order,p_actor,'payment_review','Additional payment requires reconciliation',p_provider||': '||p_event); return false;
 end if;
 select event_type into reversal from public.payment_events where order_id=p_order and provider=p_provider and payment_identity=p_identity and event_type in ('refunded','partially_refunded','disputed')
 order by array_position(array['partially_refunded','refunded','disputed'],event_type) desc limit 1;
 update public.client_orders set payment_status=coalesce(reversal,'paid'),status=case when reversal is not null then status when item_snapshot->>'kind'='digital' then 'completed' else 'in_progress' end,
 invoice_id=p_invoice->>'id',invoice_url=p_invoice->>'url',invoice_pdf=p_invoice->>'pdf',tax_minor=(p_invoice->>'tax_minor')::integer,updated_at=now() where id=p_order;
 if reversal is not null then
  insert into public.order_events(order_id,actor_id,kind,title,detail) values(p_order,p_actor,'payment_review','Reversed payment requires reconciliation',p_provider||': '||p_event); return false;
 end if;
 insert into public.order_events(order_id,actor_id,kind,title,detail) values(p_order,p_actor,'payment','Payment confirmed',p_provider||': '||p_event);
 return true;
 end $$;
revoke all on function public.consume_api_limit(text,integer,integer),public.settle_order(uuid,text,text,text,integer,text,uuid,text,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.consume_api_limit(text,integer,integer),public.settle_order(uuid,text,text,text,integer,text,uuid,text,uuid,jsonb) to service_role;

insert into public.shop_items(slug,title,kind,category,summary,price_minor,scope,exclusions,delivery_days,requires_quote,published) values
 ('hardware-idea-review','Hardware idea review','service','Consultation','A focused conversation and a practical next step for your hardware idea.',9900,'45-minute consultation; one written feasibility and next-steps summary; one follow-up question round.','Detailed circuit design, market validation, patent advice, physical testing and certification.',3,false,true),
 ('pcb-pre-order-review','PCB pre-order review','service','PCB review','An independent review before you commit to fabrication.',24900,'One low-voltage, two-layer PCB up to 50 components; schematic and layout review; prioritised findings; one follow-up question round.','Mains, safety-critical, RF or high-speed designs; physical tests; certification; implementation of fixes.',3,false,true),
 ('custom-pcb-design','Custom PCB design','service','PCB design','A design project scoped around your requirements and deliverables.',75000,'Scope, deliverables, file formats, revisions, test plan and delivery dates agreed in a project-specific proposal.','Manufacturing, components, firmware, enclosure and certification unless expressly included in the proposal.',15,true,true);
-- Prices are editable launch suggestions. Checkout stays off until approved terms and infrastructure exist.

create unique index one_active_payment_per_provider on public.payment_attempts(order_id,provider) where state in ('created','creating','pending');
create function public.record_payment_reversal(p_order uuid,p_attempt uuid,p_identity text,p_event text,p_status text) returns void language plpgsql security definer set search_path='' as $$
 declare current_status text; states text[] := array['partially_refunded','refunded','disputed']; begin
 if p_status not in ('refunded','partially_refunded','disputed') then raise exception 'Invalid payment state'; end if;
 select payment_status into current_status from public.client_orders where id=p_order for update;
 if not found or nullif(p_identity,'') is null or not exists(select 1 from public.payment_attempts where id=p_attempt and order_id=p_order and provider='stripe') then raise exception 'Payment attempt mismatch'; end if;
 if exists(select 1 from public.payment_events where provider='stripe' and event_id=p_event) then return; end if;
 insert into public.payment_events(provider,event_id,order_id,payment_identity,event_type) values('stripe',p_event,p_order,p_identity,p_status);
 if exists(select 1 from public.payment_events where order_id=p_order and provider='stripe' and payment_identity=p_identity and event_type='accepted') then
  if array_position(states,p_status)>coalesce(array_position(states,current_status),0) then
   update public.client_orders set payment_status=p_status,updated_at=now() where id=p_order;
   insert into public.order_events(order_id,kind,title,detail) values(p_order,'payment','Payment status changed',p_status||'. Download access is suspended pending reconciliation.');
  end if;
 else
  insert into public.order_events(order_id,kind,title,detail) values(p_order,'payment_review','Payment reversal requires reconciliation',p_status||': '||p_event);
 end if;
 end $$;
create function public.sign_order_document(p_document uuid,p_user uuid,p_name text,p_email text,p_party text,p_hash text,p_consent text) returns void language plpgsql security definer set search_path='' as $$
 declare d public.order_documents; o public.client_orders; begin
 select * into d from public.order_documents where id=p_document;
 select * into o from public.client_orders where id=d.order_id for update;
 select * into d from public.order_documents where id=p_document for update;
 if not found or d.status<>'issued' or d.sha256<>p_hash then raise exception 'Document changed or unavailable'; end if;
 select * into o from public.client_orders where id=d.order_id for update;
 if exists(select 1 from public.order_documents where order_id=d.order_id and kind=d.kind and version>d.version) then raise exception 'A newer document exists'; end if;
 if o.status='cancelled' then raise exception 'Order cancelled'; end if;
 if p_party='client' and p_user<>o.client_id then raise exception 'Wrong signer'; end if;
 if p_party='company' and not exists(select 1 from public.staff_members where user_id=p_user) then raise exception 'Wrong signer'; end if;
 if p_party not in ('client','company') then raise exception 'Wrong party'; end if;
 insert into public.document_signatures(document_id,signer_id,signer_name,signer_email,party,document_sha256,consent_text) values(d.id,p_user,p_name,p_email,p_party,p_hash,p_consent);
 insert into public.order_events(order_id,actor_id,kind,title,detail) values(d.order_id,p_user,'agreement',d.title||' signed',p_party||' · version '||d.version||' · SHA-256 '||d.sha256);
 if o.status='awaiting_agreement' and public.order_agreements_ready(o.id) then update public.client_orders set status='awaiting_payment',updated_at=now() where id=o.id; end if;
 end $$;
revoke all on function public.record_payment_reversal(uuid,uuid,text,text,text),public.sign_order_document(uuid,uuid,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.record_payment_reversal(uuid,uuid,text,text,text),public.sign_order_document(uuid,uuid,text,text,text,text,text) to service_role;


alter table public.shop_items add column tax_mode text not null default 'none' check(tax_mode in ('none','manual','automatic'));
alter table public.shop_items add column tax_code text not null default '';
alter table public.client_orders add column invoice_id text;
alter table public.client_orders add column invoice_url text;
alter table public.client_orders add column invoice_pdf text;
alter table public.client_orders add column tax_minor integer;

create function public.order_agreements_ready(p_order uuid) returns boolean language plpgsql stable security definer set search_path='' as $$
 declare k text; d public.order_documents; begin
 if exists(select 1 from public.client_orders where id=p_order and (item_snapshot->>'requires_quote')::boolean) then return false; end if;
 if exists(select 1 from public.client_orders where id=p_order and item_snapshot->>'kind'='digital') then return true; end if;
 foreach k in array array['nda','contract'] loop
  select * into d from public.order_documents where order_id=p_order and kind=k order by version desc limit 1;
  if not found or d.status<>'issued' then return false; end if;
  if (select count(distinct party) from public.document_signatures where document_id=d.id and document_sha256=d.sha256)<>2 then return false; end if;
 end loop;
 return true; end $$;

create function public.create_order_bundle(p_order jsonb,p_documents jsonb,p_files uuid[]) returns uuid language plpgsql security definer set search_path='' as $$
 declare o public.client_orders; d jsonb; existing uuid; begin
 perform pg_advisory_xact_lock(hashtextextended((p_order->>'client_id')||(p_order->>'request_key'),0));
 select id into existing from public.client_orders where client_id=(p_order->>'client_id')::uuid and request_key=(p_order->>'request_key')::uuid;
 if found then return existing; end if;
 insert into public.client_orders(id,reference,client_id,item_id,item_snapshot,client_name,company,billing_address,brief,request_key,total_minor,currency,status,accepted_terms,accepted_license)
 values((p_order->>'id')::uuid,p_order->>'reference',(p_order->>'client_id')::uuid,(p_order->>'item_id')::uuid,p_order->'item_snapshot',p_order->>'client_name',p_order->>'company',p_order->>'billing_address',p_order->>'brief',(p_order->>'request_key')::uuid,(p_order->>'total_minor')::integer,p_order->>'currency',p_order->>'status',p_order->>'accepted_terms',p_order->>'accepted_license') returning * into o;
 for d in select * from jsonb_array_elements(p_documents) loop
 insert into public.order_documents(order_id,kind,version,title,body,sha256,status) values(o.id,d->>'kind',1,d->>'title',d->>'body',d->>'sha256','draft'); end loop;
 insert into public.order_entitlements(order_id,file_id) select o.id,unnest(p_files);
 insert into public.order_events(order_id,actor_id,kind,title,detail) values(o.id,o.client_id,'order','Order request received','The selected price, scope, licence and customer terms are saved with this order.');
 return o.id; end $$;

create function public.issue_order_document(p_order uuid,p_kind text,p_title text,p_body text,p_hash text,p_issue boolean,p_actor uuid) returns uuid language plpgsql security definer set search_path='' as $$
 declare o public.client_orders; v integer; doc_id uuid; begin
 select * into o from public.client_orders where id=p_order for update;
 if not found or o.payment_status<>'unpaid' or o.status not in ('scoping','awaiting_agreement','awaiting_payment') or exists(select 1 from public.payment_attempts where order_id=p_order) then raise exception 'Agreements are locked once payment starts'; end if;
 select coalesce(max(version),0)+1 into v from public.order_documents where order_id=p_order and kind=p_kind;
 insert into public.order_documents(order_id,kind,title,body,sha256,version,status) values(p_order,p_kind,p_title,p_body,p_hash,v,case when p_issue then 'issued' else 'draft' end) returning id into doc_id;
 update public.client_orders set status='awaiting_agreement',updated_at=now() where id=p_order;
 insert into public.order_events(order_id,actor_id,kind,title,detail) values(p_order,p_actor,'agreement',case when p_issue then 'Agreement issued' else 'Agreement draft updated' end,p_title||' · version '||v||'. Earlier versions remain in the record.');
 return doc_id; end $$;

create function public.quote_order(p_order uuid,p_quote jsonb,p_actor uuid) returns void language plpgsql security definer set search_path='' as $$
 declare o public.client_orders; amount integer; begin
 select * into o from public.client_orders where id=p_order for update;
 if not found or o.status not in ('received','scoping','awaiting_agreement') or o.payment_status<>'unpaid' or exists(select 1 from public.payment_attempts where order_id=p_order) then raise exception 'This order cannot be repriced'; end if;
 if exists(select 1 from public.document_signatures s join public.order_documents d on d.id=s.document_id where d.order_id=p_order and d.kind='contract') then raise exception 'A contract is already signed; use a new order'; end if;
 amount=(p_quote->>'price_minor')::integer+round((p_quote->>'price_minor')::numeric*(p_quote->>'tax_bps')::numeric/10000)::integer;
 update public.client_orders set item_snapshot=item_snapshot||p_quote||'{"requires_quote":false}'::jsonb,total_minor=amount,status='awaiting_agreement',updated_at=now() where id=p_order;
 update public.order_documents set status='superseded' where order_id=p_order and kind='contract';
 insert into public.order_events(order_id,actor_id,kind,title,detail) values(p_order,p_actor,'quote','Scope and quote updated','Final total: '||amount||' minor units '||o.currency||'. A new contract is required.');
 end $$;

create function public.reserve_payment(p_order uuid,p_provider text) returns public.payment_attempts language plpgsql security definer set search_path='' as $$
 declare o public.client_orders; a public.payment_attempts; begin
 select * into o from public.client_orders where id=p_order for update;
 if not found or o.status<>'awaiting_payment' or o.payment_status not in ('unpaid','pending') or not public.order_agreements_ready(p_order) then raise exception 'Order not ready for payment'; end if;
 if exists(select 1 from public.payment_attempts where order_id=p_order and provider<>p_provider and state in ('created','creating','pending')) then raise exception 'A payment is already in progress using another provider'; end if;
 select * into a from public.payment_attempts where order_id=p_order and provider=p_provider and state in ('created','creating','pending');
 if not found then insert into public.payment_attempts(order_id,provider,total_minor,currency,state) values(p_order,p_provider,o.total_minor,o.currency,case when p_provider='bank' then 'pending' else 'created' end) returning * into a; end if;
 update public.client_orders set payment_status='pending',updated_at=now() where id=p_order;
 return a; end $$;

revoke all on function public.order_agreements_ready(uuid),public.create_order_bundle(jsonb,jsonb,uuid[]),public.issue_order_document(uuid,text,text,text,text,boolean,uuid),public.quote_order(uuid,jsonb,uuid),public.reserve_payment(uuid,text) from public,anon,authenticated;
grant execute on function public.order_agreements_ready(uuid),public.create_order_bundle(jsonb,jsonb,uuid[]),public.issue_order_document(uuid,text,text,text,text,boolean,uuid),public.quote_order(uuid,jsonb,uuid),public.reserve_payment(uuid,text) to service_role;
grant select on public.staff_members to service_role;

create function public.publish_order_update(p_order uuid,p_actor uuid,p_title text,p_detail text,p_findings text,p_outcome text,p_status text,p_due timestamptz) returns void language plpgsql security definer set search_path='' as $$
 declare o public.client_orders; allowed text[]; begin
 select * into o from public.client_orders where id=p_order for update;
 if not found then raise exception 'Order not found'; end if;
 if p_status<>o.status then
 allowed=case o.status when 'received' then array['scoping','awaiting_agreement','cancelled'] when 'scoping' then array['awaiting_agreement','cancelled'] when 'awaiting_agreement' then array['awaiting_payment','cancelled'] when 'awaiting_payment' then array['cancelled'] when 'in_progress' then array['client_review'] when 'client_review' then array['in_progress','completed'] else array[]::text[] end;
 if not p_status=any(allowed) then raise exception 'Status transition is not allowed'; end if;
 if p_status='awaiting_payment' and not public.order_agreements_ready(p_order) then raise exception 'Both agreements require both signatures'; end if;
 if p_status in ('client_review','completed') and o.payment_status<>'paid' then raise exception 'Confirmed payment is required'; end if;
 if p_status='cancelled' and (o.payment_status='paid' or exists(select 1 from public.payment_attempts where order_id=p_order and state in ('created','creating','pending'))) then raise exception 'Reconcile pending or paid funds before cancellation'; end if;
 end if;
 update public.client_orders set status=p_status,due_at=p_due,outcome=case when p_outcome='' then outcome else p_outcome end,updated_at=now() where id=p_order;
 insert into public.order_events(order_id,actor_id,kind,title,detail,findings,outcome) values(p_order,p_actor,'update',p_title,p_detail,p_findings,p_outcome);
 end $$;
revoke all on function public.publish_order_update(uuid,uuid,text,text,text,text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.publish_order_update(uuid,uuid,text,text,text,text,text,timestamptz) to service_role;

create function public.finalize_upload(p_file uuid,p_actor uuid)
returns table(status text,promoted boolean)
language plpgsql security definer set search_path='' as $$
 declare f public.project_files; begin
 select * into f from public.project_files where id=p_file and uploaded_by=p_actor for update;
 if not found then raise exception 'Upload does not belong to this user'; end if;
 if f.status<>'uploading' then
  return query select f.status,false;
  return;
 end if;
 update public.project_files set status='quarantined' where id=p_file;
 if f.order_id is not null then
  insert into public.order_events(order_id,actor_id,kind,title,detail)
  values(f.order_id,p_actor,'file','New file uploaded',
   f.filename||' · version '||f.version_label||' · SHA-256 '||f.sha256||'. Awaiting security review.');
 end if;
 return query select 'quarantined'::text,true;
 end $$;
revoke all on function public.finalize_upload(uuid,uuid) from public,anon,authenticated;
grant execute on function public.finalize_upload(uuid,uuid) to service_role;
commit;
