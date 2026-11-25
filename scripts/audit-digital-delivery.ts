import {database,check,stripe,env} from '../server/runtime.js';
import {downloadFile} from '../server/files.js';
import {stripeWebhook} from '../server/payments.js';
import {HttpError} from '../server/policy.js';
import {createHash,randomUUID} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';

if(process.env.STRIPE_MODE!=='test'||process.env.SUPABASE_URL!=='https://bzkmfhjsqcttyrvbasjj.supabase.co')throw Error('Staging only');
const orderId=process.argv[2];
if(!orderId)throw Error('Pass the paid sandbox order ID');
const db=database(),s=stripe();
const order=check(await db.from('client_orders').select('*').eq('id',orderId).single());
if(order.payment_status!=='paid'||order.item_snapshot.kind!=='digital')throw Error('Expected paid digital order');
const {data,error}=await db.auth.admin.getUserById(order.client_id);
if(error)throw error;
const ctx={db,user:data.user,aal:'aal1',role:null,isAdmin:false};
const entries=check(await db.from('order_entitlements').select('file_id').eq('order_id',order.id));
if(!entries.length)throw Error('No delivery entitlements');
mkdirSync('.local/delivery-proof',{recursive:true});
const results=[];
for(const entry of entries){
 const file=check(await db.from('project_files').select('filename,sha256').eq('id',entry.file_id).single());
 const link=await downloadFile(ctx,entry.file_id);
 const response=await fetch(link.url);
 if(!response.ok)throw Error('Private download failed');
 const bytes=Buffer.from(await response.arrayBuffer());
 if(createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw Error('Downloaded checksum mismatch');
 writeFileSync(`.local/delivery-proof/${file.filename.replace(/[^a-zA-Z0-9._-]/g,'_')}`,bytes);
 try{await downloadFile({...ctx,user:{...ctx.user,id:randomUUID()}},entry.file_id);throw Error('Cross-customer access allowed');}
 catch(e){if(!(e instanceof HttpError)||e.status!==404)throw e;}
 results.push({file:file.filename,bytes:bytes.length,checksumMatches:true,otherCustomerBlocked:true});
}
const attempts=check(await db.from('payment_attempts').select('external_id').eq('order_id',order.id).eq('provider','stripe'));
const session=await s.checkout.sessions.retrieve(attempts[0].external_id);
if(session.livemode||session.payment_status!=='paid')throw Error('Expected Stripe sandbox confirmation');
// Replay an authentic sandbox event through the updated local handler, with a
// generated test signature. The original deployed webhook already settled it.
const events=await s.events.list({type:'checkout.session.completed',limit:100});
const event=events.data.find(e=>e.data.object.id===session.id);
if(!event)throw Error('Stripe completion event missing');
const raw=JSON.stringify(event),sig=s.webhooks.generateTestHeaderString({payload:raw,secret:env('STRIPE_WEBHOOK_SECRET')});
await stripeWebhook(db,Buffer.from(raw),sig);
await stripeWebhook(db,Buffer.from(raw),sig);
const notices=check(await db.from('notification_outbox').select('id,status,template_key').eq('order_id',order.id).eq('template_key','digital_delivery'));
if(notices.length!==1)throw Error('Delivery notification duplicated or missing');
const proof={reference:order.reference,orderId:order.id,stripeTestPaymentVerified:true,files:results,webhookReplayDidNotDuplicateNotification:true,emailStatus:notices[0].status,verifiedAt:new Date().toISOString()};
writeFileSync('.local/delivery-proof/result.json',JSON.stringify(proof,null,2));
console.log(JSON.stringify(proof,null,2));
