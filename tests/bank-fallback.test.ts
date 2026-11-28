import {describe,expect,it,vi}from'vitest';
import type Stripe from 'stripe';
import {expireUnpaidCheckout}from'../server/bank-fallback.js';
function client(status:string,payment_status:string){const expire=vi.fn().mockResolvedValue({status:'expired',payment_status:'unpaid'});const api={checkout:{sessions:{retrieve:vi.fn().mockResolvedValue({status,payment_status}),expire}}}as unknown as Stripe;return {api,expire};}
describe('safe bank fallback',()=>{
 it('closes an unpaid open card checkout before permitting bank transfer',async()=>{const {api,expire}=client('open','unpaid');await expireUnpaidCheckout(api,'cs_qa');expect(expire).toHaveBeenCalledWith('cs_qa');});
 it('does not re-expire an already expired checkout',async()=>{const {api,expire}=client('expired','unpaid');await expireUnpaidCheckout(api,'cs_qa');expect(expire).not.toHaveBeenCalled();});
 it.each([['complete','paid'],['complete','unpaid'],['open','paid']])('blocks paid or processing payments (%s/%s)',async(status,payment)=>{const {api,expire}=client(status,payment);await expect(expireUnpaidCheckout(api,'cs_qa')).rejects.toThrow('Do not send');expect(expire).not.toHaveBeenCalled();});
 it('does not authorize a transfer on an uncertain provider response',async()=>{const {api,expire}=client('open','unpaid');expire.mockRejectedValueOnce(new Error('network'));await expect(expireUnpaidCheckout(api,'cs_qa')).rejects.toThrow('network');});
});
