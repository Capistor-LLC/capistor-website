import {afterEach,describe,expect,it,vi} from 'vitest';
import type {Context} from '../server/auth.js';
import {billingCustomer,billingPortal} from '../server/billing.js';
import {checkoutParameters} from '../server/stripe-checkout.js';
import type {Order} from '../src/commerce/types.js';

const mocks=vi.hoisted(()=>({create:vi.fn(),portal:vi.fn()}));
vi.mock('../server/runtime.js',async(importOriginal)=>({
  ...await importOriginal<typeof import('../server/runtime.js')>(),
  stripe:()=>({customers:{create:mocks.create},billingPortal:{sessions:{create:mocks.portal}}}),
}));
afterEach(()=>{vi.unstubAllEnvs();vi.clearAllMocks();});
function context(customerId:string|null,createdAt=new Date().toISOString()) {
  const filters:unknown[][]=[];
  const results:unknown[]=[[],{id:'reservation',customer_id:customerId,created_at:createdAt},{id:'reservation'}];
  const from=vi.fn(()=>{
    const result=results.shift();const chain:Record<string,unknown>={};
    for(const method of ['select','eq','single','upsert','update']) chain[method]=(...args:unknown[])=>{filters.push([method,...args]);return chain;};
    chain.then=(resolve:(value:unknown)=>unknown)=>Promise.resolve({data:result,error:null}).then(resolve);
    return chain;
  });
  return {ctx:{user:{id:'verified-user'},db:{from}} as unknown as Context,filters,from};
}
describe('Stripe billing identity',()=>{
  it('reuses the authenticated user mapping without searching by email',async()=>{
    vi.stubEnv('STRIPE_MODE','test');const {ctx,filters}=context('cus_owned');
    expect(await billingCustomer(ctx)).toBe('cus_owned');
    expect(filters).toContainEqual(['eq','user_id','verified-user']);
    expect(filters).toContainEqual(['eq','mode','test']);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it('uses the persisted reservation for idempotent customer creation',async()=>{
    vi.stubEnv('STRIPE_MODE','test');mocks.create.mockResolvedValue({id:'cus_new'});
    const {ctx,filters}=context(null);
    expect(await billingCustomer(ctx)).toBe('cus_new');
    expect(mocks.create).toHaveBeenCalledWith({metadata:{capistor_user_id:'verified-user'}},{idempotencyKey:'capistor-customer:reservation'});
    expect(filters).toContainEqual(['update',{customer_id:'cus_new'}]);
  });
  it('blocks uncertain creation after the idempotency retry window',async()=>{
    vi.stubEnv('STRIPE_MODE','test');const {ctx}=context(null,new Date(Date.now()-24*3600000).toISOString());
    await expect(billingCustomer(ctx)).rejects.toThrow('reconciliation');
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it('uses only the server-owned customer and return destination for portal access',async()=>{
    vi.stubEnv('STRIPE_MODE','test');vi.stubEnv('APP_ORIGIN','https://capistor.com');vi.stubEnv('STRIPE_PORTAL_CONFIGURATION_ID','bpc_test');
    mocks.portal.mockResolvedValue({url:'https://billing.stripe.com/p/session/test'});
    await billingPortal(context('cus_owned').ctx);
    expect(mocks.portal).toHaveBeenCalledWith({customer:'cus_owned',configuration:'bpc_test',return_url:'https://capistor.com/portal'});
  });
  it('blocks sandbox billing in production before accessing customer data',async()=>{
    vi.stubEnv('STRIPE_MODE','test');vi.stubEnv('VERCEL_ENV','production');
    const {ctx,from}=context('cus_owned');
    await expect(billingPortal(ctx)).rejects.toThrow('not enabled');expect(from).not.toHaveBeenCalled();
  });
  it('makes saving a card optional and reuses the customer on checkout',()=>{
    const order={id:'order',reference:'CAP-TEST',currency:'USD',total_minor:9900,item_snapshot:{title:'Consultation',tax_mode:'none'}} as Order;
    const params=checkoutParameters(order,'person@example.com','https://capistor.com',undefined,'cus_owned');
    expect(params.customer).toBe('cus_owned');
    expect(params.customer_email).toBeUndefined();expect(params.customer_creation).toBeUndefined();
    expect(params.saved_payment_method_options?.payment_method_save).toBe('enabled');
    expect(params.payment_intent_data?.setup_future_usage).toBeUndefined();
  });
});
