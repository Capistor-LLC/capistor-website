import { afterEach, describe, expect, it, vi } from 'vitest';
import { appointmentEmail, dispatchBookedOrderEmail, emailReadiness, sendNotification } from '../server/notifications.js';
import type { Context } from '../server/auth.js';
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
describe('transactional notification boundaries',()=>{
  it('keeps sandbox sending disabled even when a provider key exists',()=>{
    vi.stubEnv('STRIPE_MODE','test');vi.stubEnv('RESEND_API_KEY','test-placeholder');vi.stubEnv('NOTIFICATION_FROM','Capistor <test@example.com>');vi.stubEnv('ALLOW_SANDBOX_EMAIL','');
    expect(emailReadiness()).toEqual({configured:true,sendingEnabled:false});
  });
  it('does not read or send queued emails when sandbox delivery is disabled',async()=>{
    vi.stubEnv('STRIPE_MODE','test');vi.stubEnv('ALLOW_SANDBOX_EMAIL','');
    vi.stubEnv('RESEND_API_KEY','test-placeholder');vi.stubEnv('NOTIFICATION_FROM','test@example.com');
    const from=vi.fn();const fetchMock=vi.fn();vi.stubGlobal('fetch',fetchMock);
    await dispatchBookedOrderEmail({db:{from}} as unknown as Context,'order');
    expect(from).not.toHaveBeenCalled();expect(fetchMock).not.toHaveBeenCalled();
  });
  it('limits automatic dispatch to the booking customer and order',async()=>{
    vi.stubEnv('STRIPE_MODE','test');vi.stubEnv('ALLOW_SANDBOX_EMAIL','true');
    vi.stubEnv('RESEND_API_KEY','test-placeholder');vi.stubEnv('NOTIFICATION_FROM','test@example.com');
    const filters: unknown[][]=[];const chain:Record<string,unknown>={};
    for(const method of ['select','eq','in','lt','limit']) chain[method]=(...args:unknown[])=>{filters.push([method,...args]);return chain;};
    chain.then=(resolve:(value:unknown)=>unknown)=>Promise.resolve({data:[],error:null}).then(resolve);
    const fetchMock=vi.fn();vi.stubGlobal('fetch',fetchMock);
    await dispatchBookedOrderEmail({user:{id:'customer'},db:{from:()=>chain}} as unknown as Context,'booked-order');
    expect(filters).toContainEqual(['eq','recipient_user_id','customer']);
    expect(filters).toContainEqual(['eq','order_id','booked-order']);
    expect(filters).toContainEqual(['eq','template_key','appointment_booked']);
    expect(filters).toContainEqual(['lt','attempts',3]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('rejects a customer before reading notification records',async()=>{
    await expect(sendNotification({isAdmin:false,aal:'aal1',role:null} as Context,'anything')).rejects.toThrow('Administrator');
  });
  it('rejects non-support staff before sending',async()=>{
    await expect(sendNotification({isAdmin:true,aal:'aal2',role:'engineer'} as Context,'anything')).rejects.toThrow('staff role');
  });
  it('blocks dispatch when the sender is unconfigured',async()=>{
    vi.stubEnv('RESEND_API_KEY','');vi.stubEnv('NOTIFICATION_FROM','');
    await expect(sendNotification({isAdmin:true,aal:'aal2',role:'owner'} as Context,'anything')).rejects.toThrow('verified');
  });
  it('links to the authenticated order without embedding project material',()=>{
    const email=appointmentEmail('CAP-TEST','order-id','https://example.com');
    expect(email.text).toContain('https://example.com/portal/orders/order-id');
    expect(email.text).toContain('sign in');
    expect(email.subject).toBe('Your Capistor consultation · CAP-TEST');
  });
  it('sends the verified recipient a frozen message using a stable provider idempotency key',async()=>{
    vi.stubEnv('STRIPE_MODE','test');vi.stubEnv('ALLOW_SANDBOX_EMAIL','true');
    vi.stubEnv('RESEND_API_KEY','test-placeholder');vi.stubEnv('NOTIFICATION_FROM','Capistor <test@example.com>');vi.stubEnv('APP_ORIGIN','https://example.com');
    const notificationId='00000000-0000-4000-8000-000000000001';
    const results: unknown[]=[
      {id:notificationId,status:'queued',channel:'email',template_key:'appointment_booked',payload:{},attempts:0,order_id:'order',recipient_user_id:'customer'},
      {id:'order',reference:'CAP-TEST',client_id:'customer',payment_status:'paid'},
      {id:'appointment',status:'scheduled'},
      {id:notificationId},
      null,
    ];
    const writes: Record<string,unknown>[]=[];
    const from=()=>{
      const result=results.shift();
      const chain: Record<string,unknown>={};
      for(const method of ['select','eq','in','neq','single','maybeSingle']) chain[method]=()=>chain;
      chain.update=(value:Record<string,unknown>)=>{writes.push(value);return chain;};
      chain.then=(resolve:(value:unknown)=>unknown)=>Promise.resolve({data:result,error:null}).then(resolve);
      return chain;
    };
    const fetchMock=vi.fn().mockResolvedValue(new Response(JSON.stringify({id:'provider-message'}),{status:200}));
    vi.stubGlobal('fetch',fetchMock);
    const ctx={isAdmin:true,aal:'aal2',role:'owner',db:{from,auth:{admin:{getUserById:async()=>({data:{user:{email:'customer@example.com',email_confirmed_at:'2026-01-01'}},error:null})}}}} as unknown as Context;
    await expect(sendNotification(ctx,notificationId)).resolves.toEqual({ok:true});
    const request=fetchMock.mock.calls[0][1];
    expect(request.headers['Idempotency-Key']).toBe(`capistor-notification/${notificationId}`);
    expect(JSON.parse(request.body).to).toEqual(['customer@example.com']);
    expect(writes[0].attempts).toBe(1);
    expect(writes[1].status).toBe('sent');
    expect(results).toHaveLength(0);
  });
});
