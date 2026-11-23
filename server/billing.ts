import type { Context } from './auth.js';
import { check, stripe } from './runtime.js';
import { appOrigin, assertPaymentEnvironment, paymentMode } from './environment.js';
import { HttpError } from './policy.js';

export async function billingCustomer(ctx: Context) {
  assertPaymentEnvironment('stripe');
  const mode = paymentMode();
  check(await ctx.db.from('stripe_customers').upsert(
    {user_id:ctx.user.id,mode}, {onConflict:'user_id,mode',ignoreDuplicates:true},
  ).select('id'));
  const row = check(await ctx.db.from('stripe_customers').select('*')
    .eq('user_id',ctx.user.id).eq('mode',mode).single());
  if (row.customer_id) return String(row.customer_id);
  // Persist the reservation before calling Stripe so parallel requests and
  // network retries use one identity. Never retry beyond Stripe's key window.
  if (Date.now() - Date.parse(row.created_at) > 23 * 3600000)
    throw new HttpError(409,'Your billing profile needs reconciliation. Please contact Capistor.');
  const customer = await stripe().customers.create({
    metadata:{capistor_user_id:ctx.user.id},
  },{idempotencyKey:`capistor-customer:${row.id}`});
  check(await ctx.db.from('stripe_customers').update({customer_id:customer.id})
    .eq('id',row.id).select('id').single());
  return customer.id;
}

export async function billingPortal(ctx: Context) {
  const customer = await billingCustomer(ctx);
  const session = await stripe().billingPortal.sessions.create({
    customer,
    return_url:`${appOrigin()}/portal`,
    ...(process.env.STRIPE_PORTAL_CONFIGURATION_ID
      ? {configuration:process.env.STRIPE_PORTAL_CONFIGURATION_ID} : {}),
  });
  return {url:session.url};
}
