-- The fixed consent text has a fixed SHA-256; avoid extension lookup with an empty search_path.
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
 if o.marketing_phone_consent then insert into public.policy_acceptances(user_id,order_id,policy_kind,policy_version,document_sha256) values(o.client_id,o.id,'marketing_phone',policy_version,'a79913fc4afec65d39421283c4ed431f3d1e3c21951bca5e44d4c3c8c8c63648'); end if;
 insert into public.order_events(order_id,actor_id,kind,title,detail) values(o.id,o.client_id,'order','Order request received','The selected price, scope, licence, contact preferences and customer terms are saved with this order.');
 insert into public.customer_events(user_id,event_type,path,item_id,order_id) values(o.client_id,'checkout_completed','/checkout',o.item_id,o.id);
 return o.id; end $$;

