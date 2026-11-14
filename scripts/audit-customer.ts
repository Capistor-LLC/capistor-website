import { createClient } from '@supabase/supabase-js';
import { randomUUID, randomBytes } from 'node:crypto';

if (process.env.STRIPE_MODE !== 'test' || !process.env.SUPABASE_URL?.includes('bzkmfhjsqcttyrvbasjj')) throw new Error('Staging sandbox only');
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {auth:{persistSession:false}});
const email = `qa-${randomUUID()}@example.com`;
const password = randomBytes(32).toString('hex');
const created = await db.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{purpose:'Staging customer workflow audit'}});
if(created.error) throw created.error;
const client = createClient(process.env.SUPABASE_URL, process.env.VITE_STAGING_SUPABASE_ANON_KEY!,{auth:{persistSession:false}});
const signed = await client.auth.signInWithPassword({email,password});
if(signed.error) throw signed.error;
const token = signed.data.session!.access_token;
async function call(action:string, body?:unknown, query='') {
 const response = await fetch(`${process.env.APP_ORIGIN}/api/commerce?action=${action}${query}`,{method:body===undefined?'GET':'POST',headers:{Authorization:`Bearer ${token}`,Origin:process.env.APP_ORIGIN!,'Content-Type':'application/json','x-vercel-protection-bypass':process.env.VERCEL_AUTOMATION_BYPASS_SECRET!},body:body===undefined?undefined:JSON.stringify(body)});
 const result=await response.json();
 console.log(JSON.stringify({action,status:response.status,error:result.error}));
 return {status:response.status,result};
}
const catalog=await call('catalog');
await call('orders');
await call('admin');
for (const slug of ['hardware-idea-review','custom-pcb-design','basketball-shot-timer-pcb-pack']) {
 const item=catalog.result.items.find((i:{slug:string})=>i.slug===slug);
 const body={item_id:item.id,request_key:randomUUID(),client_name:'Staging QA customer',company:'Test fixture',billing_address:'Test address, Dubai',brief:'Automated staging test. Do not fulfil or contact.',phone_e164:'+12025550123',marketing_phone_consent:false,accept_terms:true,accept_license:true};
 const order=await call('create-order',body);
 if(order.status===200){
  const repeat=await call('create-order',body);
  console.log(JSON.stringify({slug,idempotent:repeat.result.id===order.result.id}));
  const detail=await call('order',undefined,`&id=${order.result.id}`);
  console.log(JSON.stringify({slug,detailKeys:Object.keys(detail.result),documents:detail.result.documents?.length}));
  await call('payment',{order_id:order.result.id,provider:'stripe'});
 }
}
await call('orders');
await client.auth.signOut();
console.log('QA records retained in staging; no payment completed and no messages sent.');
