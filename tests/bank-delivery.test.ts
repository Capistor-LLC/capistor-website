import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Context } from '../server/auth.js';
vi.mock('../server/orders.js', () => ({ getOrder: vi.fn().mockResolvedValue({id:'00000000-0000-4000-8000-000000000001'}) }));
vi.mock('../server/notifications.js', () => ({ dispatchDigitalDeliveryEmail: vi.fn().mockResolvedValue(undefined) }));
import { confirmBank } from '../server/admin.js';
import { dispatchDigitalDeliveryEmail } from '../server/notifications.js';
const body={order_id:'00000000-0000-4000-8000-000000000001',bank_reference:'test-reference',amount_minor:9900,currency:'USD',funds_received:true};
afterEach(()=>{vi.unstubAllEnvs();vi.clearAllMocks();});
describe('bank digital fulfillment',()=>{
  function setup(error: Error | null = null) {
    vi.stubEnv('STRIPE_MODE','live');vi.stubEnv('DEPLOYMENT_ENV','production');
    const rpc=vi.fn().mockResolvedValue({data:true,error});
    const ctx={isAdmin:true,aal:'aal2',role:'owner',user:{id:'owner'},db:{rpc}} as unknown as Context;
    return {ctx,rpc};
  }
  it('dispatches delivery only after successful authoritative settlement',async()=>{
    const {ctx,rpc}=setup();
    await expect(confirmBank(ctx,body)).resolves.toEqual({ok:true});
    expect(rpc).toHaveBeenCalledWith('settle_order',expect.objectContaining({p_amount:9900,p_currency:'USD',p_provider:'bank'}));
    expect(dispatchDigitalDeliveryEmail).toHaveBeenCalledWith(ctx.db,body.order_id);
    expect(rpc.mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(dispatchDigitalDeliveryEmail).mock.invocationCallOrder[0]);
  });
  it('does not dispatch when settlement rejects the payment',async()=>{
    const {ctx}=setup(new Error('Amount mismatch'));
    await expect(confirmBank(ctx,body)).rejects.toThrow();
    expect(dispatchDigitalDeliveryEmail).not.toHaveBeenCalled();
  });
  it('does not settle or send without explicit cleared-funds confirmation',async()=>{
    const {ctx,rpc}=setup();
    await expect(confirmBank(ctx,{...body,funds_received:false})).rejects.toThrow();
    expect(rpc).not.toHaveBeenCalled();expect(dispatchDigitalDeliveryEmail).not.toHaveBeenCalled();
  });
});
