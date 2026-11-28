import type Stripe from 'stripe';
import type {Context} from './auth.js';
import {check,stripe} from './runtime.js';
import {HttpError} from './policy.js';

export async function expireUnpaidCheckout(client: Stripe, sessionId: string) {
  const session=await client.checkout.sessions.retrieve(sessionId);
  if(session.payment_status !== 'unpaid' || session.status === 'complete')
    throw new HttpError(409,'Your card payment is completed or processing. Do not send a bank transfer; wait for confirmation or contact Capistor.');
  if(session.status === 'open') {
    const expired=await client.checkout.sessions.expire(sessionId);
    if(expired.status !== 'expired' || expired.payment_status !== 'unpaid')
      throw new HttpError(409,'The card checkout could not be closed safely. Contact Capistor before transferring money.');
  } else if(session.status !== 'expired') {
    throw new HttpError(409,'The card checkout needs review before switching payment method.');
  }
}

export async function prepareBankFallback(ctx: Context, orderId: string) {
  const attempts=check(await ctx.db.from('payment_attempts').select('id,external_id,state')
    .eq('order_id',orderId).eq('provider','stripe').in('state',['created','creating','pending']));
  for(const attempt of attempts) {
    if(!attempt.external_id) throw new HttpError(409,'A card checkout request is still being reconciled. Contact Capistor before transferring money so you are not charged twice.');
    await expireUnpaidCheckout(stripe(),attempt.external_id);
    check(await ctx.db.from('payment_attempts').update({state:'expired'})
      .eq('id',attempt.id).in('state',['created','creating','pending']));
  }
}
