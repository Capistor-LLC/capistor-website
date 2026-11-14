import { database, check, storage, env } from '../server/runtime.js';
import { bookAppointment } from '../server/operations.js';
import { downloadFile } from '../server/files.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID, createHash } from 'node:crypto';

if(process.env.STRIPE_MODE !== 'test' || !process.env.SUPABASE_URL?.includes('bzkmfhjsqcttyrvbasjj')) throw Error('Staging sandbox only');
const db=database();
const order=check(await db.from('client_orders').select('*').eq('id','724f164d-bb4e-406c-b328-747485282da5').single());
if(order.payment_status !== 'paid' || order.client_name !== 'Staging QA customer') throw Error('Expected paid QA order');
const {data,error}=await db.auth.admin.getUserById(order.client_id);
if(error) throw error;
const ctx={db,user:data.user,aal:'aal1',role:null,isAdmin:false};
const existing=check(await db.from('appointments').select('id,slot_id').eq('order_id',order.id));
let slotId=existing[0]?.slot_id;
if(!slotId){
 const start=new Date(Date.now()+365*86400000);
 const slot=check(await db.from('availability_slots').insert({starts_at:start.toISOString(),ends_at:new Date(start.getTime()+45*60000).toISOString(),created_by:order.client_id}).select('id').single());
 slotId=slot.id;
}
const booking=await bookAppointment(ctx,{order_id:order.id,slot_id:slotId,timezone:'Asia/Dubai'});
const repeated=await bookAppointment(ctx,{order_id:order.id,slot_id:slotId,timezone:'Asia/Dubai'});
if(booking.id!==repeated.id) throw Error('Duplicate booking');
check(await db.from('appointments').update({notes:'AUTOMATED QA FIXTURE — do not attend or fulfil.'}).eq('id',booking.id));
console.log('PASS: paid consultation booked; repeat request returns the same appointment');
const slot=check(await db.from('availability_slots').select('status').eq('id',slotId).single());
if(slot.status!=='booked') throw Error('Slot was not reserved');
console.log('PASS: booked slot removed from open availability');
const bytes=Buffer.from('Capistor staging delivery verification. This is a QA fixture, not a sale product.');
const id=randomUUID(), key=`private/${order.id}/${id}`;
await storage().send(new PutObjectCommand({Bucket:env('R2_BUCKET'),Key:key,Body:bytes,ContentType:'text/plain'}));
check(await db.from('project_files').insert({id,order_id:order.id,uploaded_by:order.client_id,filename:'QA-delivery-verification.txt',mime:'text/plain',size_bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),object_key:key,stage_key:`staging/qa/${id}`,status:'approved',version_label:'QA'}));
const download=await downloadFile(ctx,id);
const response=await fetch(download.url);
if(!response.ok || !Buffer.from(await response.arrayBuffer()).equals(bytes)) throw Error('Delivered file bytes differ');
console.log('PASS: private R2 signed download returns exact approved bytes');
try { await downloadFile({...ctx,user:{...ctx.user,id:randomUUID()}},id); throw Error('Cross-customer access allowed'); }
catch(error){if((error as Error).message==='Cross-customer access allowed') throw error; console.log('PASS: another customer cannot download this order file');}
console.log('Labelled QA appointment and delivery file retained in staging.');
