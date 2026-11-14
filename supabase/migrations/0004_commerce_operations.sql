-- Staff roles, customer journey records, negotiation history and consultation scheduling.
-- Apply after 0002_commerce.sql and 0003_blog.sql.
begin;

alter table public.staff_members
  add column if not exists email text not null default '',
  add column if not exists display_name text not null default '',
  add column if not exists role text not null default 'admin'
    check(role in ('owner','admin','sales','engineer','support','editor')),
  add column if not exists active boolean not null default true,
  add column if not exists invited_by uuid references auth.users(id),
  add column if not exists updated_at timestamptz not null default now();

update public.staff_members s
set email=lower(u.email), display_name=coalesce(nullif(s.display_name,''),split_part(u.email,'@',1))
from auth.users u where u.id=s.user_id;

-- The owner account is promoted only after this exact address is verified by Supabase.
insert into public.staff_members(user_id,email,display_name,role,active)
select id,lower(email),'Shoaib Mustafa','owner',true
from auth.users
where lower(email)='krish.shoaib55@gmail.com' and email_confirmed_at is not null
on conflict(user_id) do update set email=excluded.email,display_name=excluded.display_name,role='owner',active=true,updated_at=now();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select coalesce(auth.jwt()->>'aal'='aal2',false) and exists(
   select 1 from public.staff_members where user_id=auth.uid() and active and role in ('owner','admin')
 );
$$;

alter table public.shop_items
  add column if not exists agreement_required boolean not null default true,
  add column if not exists booking_required boolean not null default false;
update public.shop_items set agreement_required=false where kind='digital';
update public.shop_items set agreement_required=false,booking_required=true,checkout_enabled=true where slug='hardware-idea-review';

alter table public.client_orders
  add column if not exists phone_e164 text not null default '',
  add column if not exists marketing_phone_consent boolean not null default false;

create table if not exists public.customer_profiles (
 user_id uuid primary key references auth.users(id),
 email text not null,
 full_name text not null default '',
 company text not null default '',
 phone_e164 text not null default '',
 phone_verified_at timestamptz,
 marketing_phone_consent_at timestamptz,
 marketing_consent_withdrawn_at timestamptz,
 first_seen_at timestamptz not null default now(),
 last_seen_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.customer_events (
 id uuid primary key default gen_random_uuid(),
 user_id uuid references auth.users(id),
 anonymous_id uuid,
 event_type text not null check(event_type in ('visit','product_view','product_click','checkout_start','checkout_details','checkout_abandoned','checkout_completed','policy_view','login')),
 path text not null default '',
 item_id uuid references public.shop_items(id),
 order_id uuid references public.client_orders(id),
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 check(user_id is not null or anonymous_id is not null)
);
create index if not exists customer_events_user on public.customer_events(user_id,created_at desc);
create index if not exists customer_events_anon on public.customer_events(anonymous_id,created_at desc);

create table if not exists public.policy_acceptances (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id),
 order_id uuid references public.client_orders(id),
 policy_kind text not null check(policy_kind in ('terms','privacy','refund','digital_license','marketing_phone')),
 policy_version text not null,
 document_sha256 text not null,
 accepted_at timestamptz not null default now()
);

create table if not exists public.document_negotiation_events (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.client_orders(id),
 document_id uuid references public.order_documents(id),
 document_kind text not null check(document_kind in ('nda','contract')),
 actor_id uuid references auth.users(id),
 actor_party text not null check(actor_party in ('client','company')),
 event_type text not null check(event_type in ('proposed','commented','objected','accepted','decision')),
 clause_key text not null default '',
 message text not null default '',
 previous_text text not null default '',
 proposed_text text not null default '',
 decision text not null default '',
 created_at timestamptz not null default now()
);
create index if not exists negotiation_order on public.document_negotiation_events(order_id,created_at);

create table if not exists public.availability_slots (
 id uuid primary key default gen_random_uuid(),
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 status text not null default 'open' check(status in ('open','held','booked','blocked')),
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 check(ends_at>starts_at),
 unique(starts_at,ends_at)
);

create table if not exists public.appointments (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null unique references public.client_orders(id),
 slot_id uuid not null unique references public.availability_slots(id),
 client_id uuid not null references auth.users(id),
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 timezone text not null default 'Asia/Dubai',
 meeting_url text not null default '',
 status text not null default 'scheduled' check(status in ('scheduled','completed','cancelled','no_show')),
 notes text not null default '',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists appointments_starts on public.appointments(starts_at);

create table if not exists public.support_cases (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.client_orders(id),
 opened_by uuid not null references auth.users(id),
 case_type text not null check(case_type in ('support','refund','return','engineering_flaw','dispute')),
 status text not null default 'open' check(status in ('open','investigating','waiting_customer','approved','resolved','rejected','closed')),
 subject text not null,
 detail text not null,
 requested_remedy text not null default '',
 decision text not null default '',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists support_order on public.support_cases(order_id,created_at desc);

create table if not exists public.notification_outbox (
 id uuid primary key default gen_random_uuid(),
 order_id uuid references public.client_orders(id),
 recipient_user_id uuid references auth.users(id),
 channel text not null check(channel in ('email','sms','workspace')),
 template_key text not null,
 payload jsonb not null default '{}'::jsonb,
 status text not null default 'queued' check(status in ('queued','sent','failed','cancelled')),
 attempts integer not null default 0,
 last_error text not null default '',
 created_at timestamptz not null default now(),
 sent_at timestamptz
);

do $$ declare t text; begin
 foreach t in array array['customer_profiles','customer_events','policy_acceptances','document_negotiation_events','availability_slots','appointments','support_cases','notification_outbox'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon,authenticated',t);
  execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;

grant select on public.customer_profiles,public.customer_events,public.policy_acceptances,public.document_negotiation_events,public.availability_slots,public.appointments,public.support_cases to authenticated;
create policy profile_self_or_staff on public.customer_profiles for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy events_self_or_staff on public.customer_events for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy acceptance_self_or_staff on public.policy_acceptances for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy negotiation_order_read on public.document_negotiation_events for select to authenticated using(exists(select 1 from public.client_orders o where o.id=order_id and (o.client_id=auth.uid() or public.is_admin())));
create policy slots_signed_in_read on public.availability_slots for select to authenticated using(status='open' or public.is_admin());
create policy appointments_order_read on public.appointments for select to authenticated using(client_id=auth.uid() or public.is_admin());
create policy support_order_read on public.support_cases for select to authenticated using(exists(select 1 from public.client_orders o where o.id=order_id and (o.client_id=auth.uid() or public.is_admin())));

create trigger policy_acceptances_immutable before update or delete on public.policy_acceptances for each row execute function public.immutable_record();
create trigger negotiation_immutable before update or delete on public.document_negotiation_events for each row execute function public.immutable_record();
create trigger customer_events_immutable before update or delete on public.customer_events for each row execute function public.immutable_record();

create or replace function public.order_agreements_ready(p_order uuid) returns boolean language plpgsql stable security definer set search_path='' as $$
 declare k text; d public.order_documents; begin
 if exists(select 1 from public.client_orders where id=p_order and (item_snapshot->>'requires_quote')::boolean) then return false; end if;
 if exists(select 1 from public.client_orders where id=p_order and (item_snapshot->>'kind'='digital' or coalesce((item_snapshot->>'agreement_required')::boolean,true)=false)) then return true; end if;
 foreach k in array array['nda','contract'] loop
  select * into d from public.order_documents where order_id=p_order and kind=k order by version desc limit 1;
  if not found or d.status<>'issued' then return false; end if;
  if (select count(distinct party) from public.document_signatures where document_id=d.id and document_sha256=d.sha256)<>2 then return false; end if;
 end loop;
 return true; end $$;

create or replace function public.create_order_bundle(p_order jsonb,p_documents jsonb,p_files uuid[]) returns uuid language plpgsql security definer set search_path='' as $$
 declare o public.client_orders; d jsonb; existing uuid; policy_version text := '2026-11-14'; begin
 perform pg_advisory_xact_lock(hashtextextended((p_order->>'client_id')||(p_order->>'request_key'),0));
 select id into existing from public.client_orders where client_id=(p_order->>'client_id')::uuid and request_key=(p_order->>'request_key')::uuid;
 if found then return existing; end if;
 insert into public.client_orders(id,reference,client_id,item_id,item_snapshot,client_name,company,billing_address,brief,phone_e164,marketing_phone_consent,request_key,total_minor,currency,status,accepted_terms,accepted_license)
 values((p_order->>'id')::uuid,p_order->>'reference',(p_order->>'client_id')::uuid,(p_order->>'item_id')::uuid,p_order->'item_snapshot',p_order->>'client_name',p_order->>'company',p_order->>'billing_address',p_order->>'brief',p_order->>'phone_e164',coalesce((p_order->>'marketing_phone_consent')::boolean,false),(p_order->>'request_key')::uuid,(p_order->>'total_minor')::integer,p_order->>'currency',p_order->>'status',p_order->>'accepted_terms',p_order->>'accepted_license') returning * into o;
 insert into public.customer_profiles(user_id,email,full_name,company,phone_e164,marketing_phone_consent_at,last_seen_at)
 values(o.client_id,p_order->>'client_email',o.client_name,o.company,o.phone_e164,case when o.marketing_phone_consent then now() end,now())
 on conflict(user_id) do update set email=excluded.email,full_name=excluded.full_name,company=excluded.company,phone_e164=excluded.phone_e164,marketing_phone_consent_at=case when excluded.marketing_phone_consent_at is not null then coalesce(customer_profiles.marketing_phone_consent_at,excluded.marketing_phone_consent_at) else customer_profiles.marketing_phone_consent_at end,last_seen_at=now(),updated_at=now();
 for d in select * from jsonb_array_elements(p_documents) loop
  insert into public.order_documents(order_id,kind,version,title,body,sha256,status) values(o.id,d->>'kind',1,d->>'title',d->>'body',d->>'sha256','draft');
 end loop;
 insert into public.order_entitlements(order_id,file_id) select o.id,unnest(p_files);
 insert into public.policy_acceptances(user_id,order_id,policy_kind,policy_version,document_sha256) values
  (o.client_id,o.id,'terms',policy_version,p_order->>'terms_sha256'),
  (o.client_id,o.id,'privacy',policy_version,p_order->>'privacy_sha256'),
  (o.client_id,o.id,'refund',policy_version,p_order->>'refund_sha256');
 if o.accepted_license<>'' then insert into public.policy_acceptances(user_id,order_id,policy_kind,policy_version,document_sha256) values(o.client_id,o.id,'digital_license',coalesce(o.item_snapshot->>'version',policy_version),p_order->>'license_sha256'); end if;
 if o.marketing_phone_consent then insert into public.policy_acceptances(user_id,order_id,policy_kind,policy_version,document_sha256) values(o.client_id,o.id,'marketing_phone',policy_version,encode(digest('Optional phone and messaging marketing consent','sha256'),'hex')); end if;
 insert into public.order_events(order_id,actor_id,kind,title,detail) values(o.id,o.client_id,'order','Order request received','The selected price, scope, licence, contact preferences and customer terms are saved with this order.');
 insert into public.customer_events(user_id,event_type,path,item_id,order_id) values(o.client_id,'checkout_completed','/checkout',o.item_id,o.id);
 return o.id; end $$;

create or replace function public.issue_order_document(p_order uuid,p_kind text,p_title text,p_body text,p_hash text,p_issue boolean,p_actor uuid) returns uuid language plpgsql security definer set search_path='' as $$
 declare o public.client_orders; v integer; doc_id uuid; previous_body text := ''; begin
 select * into o from public.client_orders where id=p_order for update;
 if not found or o.payment_status<>'unpaid' or o.status not in ('scoping','awaiting_agreement','awaiting_payment') or exists(select 1 from public.payment_attempts where order_id=p_order) then raise exception 'Agreements are locked once payment starts'; end if;
 select coalesce(max(version),0)+1 into v from public.order_documents where order_id=p_order and kind=p_kind;
 select body into previous_body from public.order_documents where order_id=p_order and kind=p_kind order by version desc limit 1;
 insert into public.order_documents(order_id,kind,title,body,sha256,version,status) values(p_order,p_kind,p_title,p_body,p_hash,v,case when p_issue then 'issued' else 'draft' end) returning id into doc_id;
 update public.client_orders set status='awaiting_agreement',updated_at=now() where id=p_order;
 insert into public.order_events(order_id,actor_id,kind,title,detail) values(p_order,p_actor,'agreement',case when p_issue then 'Agreement issued' else 'Agreement draft updated' end,p_title||' · version '||v||'. Earlier versions remain in the record.');
 insert into public.document_negotiation_events(order_id,document_id,document_kind,actor_id,actor_party,event_type,message,previous_text,proposed_text)
 values(p_order,doc_id,p_kind,p_actor,'company','proposed',case when p_issue then 'Issued for signature' else 'Saved as a working proposal' end,coalesce(previous_body,''),p_body);
 return doc_id; end $$;

create function public.book_consultation(p_order uuid,p_slot uuid,p_user uuid,p_timezone text) returns uuid language plpgsql security definer set search_path='' as $$
 declare o public.client_orders; s public.availability_slots; a uuid; begin
 select * into o from public.client_orders where id=p_order for update;
 if not found or o.client_id<>p_user or o.payment_status<>'paid' or coalesce((o.item_snapshot->>'booking_required')::boolean,false)=false then raise exception 'Paid consultation order required'; end if;
 if exists(select 1 from public.appointments where order_id=p_order) then select id into a from public.appointments where order_id=p_order; return a; end if;
 select * into s from public.availability_slots where id=p_slot for update;
 if not found or s.status<>'open' or s.starts_at<now() then raise exception 'Time is no longer available'; end if;
 update public.availability_slots set status='booked' where id=s.id;
 insert into public.appointments(order_id,slot_id,client_id,starts_at,ends_at,timezone) values(o.id,s.id,o.client_id,s.starts_at,s.ends_at,p_timezone) returning id into a;
 insert into public.order_events(order_id,actor_id,kind,title,detail) values(o.id,p_user,'appointment','Consultation scheduled',s.starts_at::text||' to '||s.ends_at::text||' · '||p_timezone);
 insert into public.notification_outbox(order_id,recipient_user_id,channel,template_key,payload) values
  (o.id,o.client_id,'email','appointment_booked',jsonb_build_object('appointment_id',a)),
  (o.id,o.client_id,'workspace','appointment_booked',jsonb_build_object('appointment_id',a));
 return a; end $$;

revoke all on function public.book_consultation(uuid,uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.book_consultation(uuid,uuid,uuid,text) to service_role;

commit;
