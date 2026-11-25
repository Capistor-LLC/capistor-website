import { readFileSync } from 'node:fs';
import { randomUUID, createHash } from 'node:crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { database, storage, check, env } from '../server/runtime.js';

if (process.env.STRIPE_MODE !== 'test' ||
    process.env.SUPABASE_URL !== 'https://bzkmfhjsqcttyrvbasjj.supabase.co' ||
    process.env.R2_BUCKET !== 'capistor-private-staging')
  throw Error('This script is restricted to Capistor staging and test payments');
const db=database();
const users=await db.auth.admin.listUsers({page:1,perPage:1000});
if(users.error) throw users.error;
const owner=users.data.users.find(u=>u.email==='krish.shoaib55@gmail.com');
if(!owner) throw Error('Expected staging owner missing');
const items=check(await db.from('shop_items').select('*').eq('kind','digital'));
for(const item of items){
  const filename=`${item.slug}-SAMPLE.zip`;
  const bytes=readFileSync(new URL(`../.local/demo-bundles/${filename}`,import.meta.url));
  const sha256=createHash('sha256').update(bytes).digest('hex');
  const existing=check(await db.from('project_files').select('id').eq('item_id',item.id).eq('filename',filename).eq('status','approved').maybeSingle());
  if(!existing){
    const id=randomUUID(),key=`private/demo/${item.id}/${id}`;
    await storage().send(new PutObjectCommand({Bucket:env('R2_BUCKET'),Key:key,Body:bytes,ContentType:'application/zip'}));
    check(await db.from('project_files').insert({id,item_id:item.id,uploaded_by:owner.id,filename,mime:'application/zip',size_bytes:bytes.length,sha256,object_key:key,stage_key:`staging/demo/${id}`,status:'approved',version_label:'SANDBOX SAMPLE v0.1'}));
  }
  check(await db.from('shop_items').update({
    checkout_enabled:true,version:'SANDBOX SAMPLE v0.1',
    summary:'Test checkout and private delivery with a sample bundle. No real charge.',
    description:'SANDBOX DEMONSTRATION. Buy using a Stripe test card to unlock a sample ZIP in your purchase history. This is not a fabrication-ready product. The actual engineering release will replace these examples before public sales.',
    scope:'Sample ZIP archive\nConcept product image\nExample parts list\nSample setup guide\nRelease notes'+(item.slug.includes('steering')?'\nEditable OpenSCAD concept geometry':''),
  }).eq('id',item.id));
  console.log(JSON.stringify({slug:item.slug,approvedBundle:filename,sha256,checkoutEnabled:true}));
}
