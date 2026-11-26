import type { Context } from './auth.js';
import { staffRole } from './auth.js';
import { check } from './runtime.js';
import { HttpError, id } from './policy.js';
import { appOrigin, paymentMode } from './environment.js';

export function providerError(status: number, body: unknown) {
  const error = body as {name?: unknown; message?: unknown} | null;
  const name = typeof error?.name === 'string' && /^[a-z_]{1,60}$/.test(error.name) ? error.name : 'request_failed';
  // Provider errors can contain submitted addresses. Keep staff diagnostics useful
  // without retaining recipient addresses or credentials in error text.
  const detail = typeof error?.message === 'string' ? error.message
    .replace(/Bearer\s+\S+|\b(?:re|sk|rk)_[A-Za-z0-9_]+/gi, '[redacted]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/[\r\n]+/g, ' ').slice(0, 240) : '';
  return `Email provider returned HTTP ${status} (${name})${detail ? `: ${detail}` : ''}`;
}

export function emailReadiness() {
  return {
    configured: !!(process.env.RESEND_API_KEY && process.env.NOTIFICATION_FROM),
    sendingEnabled: paymentMode() === 'live' || process.env.ALLOW_SANDBOX_EMAIL === 'true',
  };
}
export async function listNotifications(ctx: Context) {
  staffRole(ctx, ['owner', 'admin', 'support']);
  return {
    ...emailReadiness(),
    items: check(await ctx.db.from('notification_outbox')
      .select('id,order_id,channel,template_key,status,attempts,last_error,created_at,sent_at')
      .order('created_at', {ascending:false}).limit(200)),
  };
}
export function appointmentEmail(reference: string, orderId: string, origin: string) {
  return {
    subject: `Your Capistor consultation · ${reference}`,
    text: `Your consultation is booked. Open your order workspace to review the current date, time and joining link, or download the calendar event.\n\n${origin}/portal/orders/${orderId}\n\nPlease sign in with the account used for your order. If you need help, use the conversation or support section in that order.\n\nCapistor Technologies`,
  };
}
export async function sendNotification(ctx: Context, notificationId: unknown) {
  staffRole(ctx, ['owner', 'admin', 'support']);
  return deliverNotification(ctx, notificationId);
}

// Internal dispatcher: public endpoints still require staff permission. Booking
// invokes it only after ownership and payment have been checked transactionally.
async function deliverNotification(ctx: Pick<Context, 'db'>, notificationId: unknown) {
  const readiness = emailReadiness();
  if (!readiness.configured) throw new HttpError(409, 'Configure RESEND_API_KEY and a verified NOTIFICATION_FROM sender first');
  if (!readiness.sendingEnabled) throw new HttpError(409, 'External email sending is disabled in this sandbox');
  const row = check(await ctx.db.from('notification_outbox').select('*').eq('id', id.parse(notificationId)).single());
  if (row.status === 'sent') return {ok:true};
  if (!['queued','failed'].includes(row.status) || row.channel !== 'email' || !['appointment_booked', 'digital_delivery'].includes(row.template_key))
    throw new HttpError(409, 'This notification cannot be sent by this email dispatcher');
  const started = row.payload.email_started_at;
  if (started && Date.now() - Date.parse(started) > 23 * 3600000)
    throw new HttpError(409, 'Retry window expired. Reconcile the provider delivery record before sending a new notification');
  if (row.attempts >= 3) throw new HttpError(409, 'Three attempts reached. Review the email provider record before taking further action');
  const order = check(await ctx.db.from('client_orders').select('id,reference,client_id,payment_status').eq('id', row.order_id).single());
  if (order.client_id !== row.recipient_user_id || order.payment_status !== 'paid') throw new HttpError(409, 'Notification recipient or paid order is no longer valid');
  if (row.template_key === 'appointment_booked') {
    const appointment = check(await ctx.db.from('appointments').select('id,status').eq('order_id',order.id).single());
    if (appointment.status !== 'scheduled') throw new HttpError(409, 'This appointment is no longer scheduled');
  }
  const {data,error} = await ctx.db.auth.admin.getUserById(order.client_id);
  if (error || !data.user?.email || !data.user.email_confirmed_at) throw new HttpError(409, 'A verified recipient email is required');
  const message = row.payload.email_message || {
    from: process.env.NOTIFICATION_FROM!, to: [data.user.email],
    ...(row.template_key === 'digital_delivery' ? digitalDeliveryEmail : appointmentEmail)(order.reference, order.id, appOrigin()),
  };
  // Compare-and-swap plus provider idempotency protects concurrent staff clicks.
  // Freeze the message so a retry uses exactly the same provider request.
  const claimed = check(await ctx.db.from('notification_outbox').update({
    attempts: row.attempts + 1,
    payload: {...row.payload,email_started_at:started || new Date().toISOString(),email_message:message},
    last_error: 'Awaiting provider response; check the provider before retrying an uncertain result',
  }).eq('id',row.id).eq('attempts',row.attempts).in('status',['queued','failed']).select('id').maybeSingle());
  if (!claimed) throw new HttpError(409, 'Another request is processing this notification. Refresh its status');
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method:'POST', headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type':'application/json','Idempotency-Key':`capistor-notification/${row.id}`},
      body:JSON.stringify(message), signal:AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(providerError(response.status, await response.json().catch(() => null)));
    const result = await response.json();
    if (!result.id) throw new Error('Email provider did not return a message identifier');
    check(await ctx.db.from('notification_outbox').update({status:'sent',sent_at:new Date().toISOString(),last_error:'',payload:{...row.payload,email_started_at:started || new Date().toISOString(),email_message:message,provider_id:result.id}}).eq('id',row.id));
    return {ok:true};
  } catch (error) {
    const reason = error instanceof Error && error.message.startsWith('Email provider') ? error.message : 'Delivery status is uncertain. Check the provider record before retrying';
    check(await ctx.db.from('notification_outbox').update({status:'failed',last_error:reason}).eq('id',row.id).neq('status','sent'));
    throw new HttpError(502,reason);
  }
}

export async function dispatchBookedOrderEmail(ctx: Context, orderId: string) {
  const readiness = emailReadiness();
  if (!readiness.configured || !readiness.sendingEnabled) return;
  const rows = check(await ctx.db.from('notification_outbox').select('id')
    .eq('order_id',orderId).eq('recipient_user_id',ctx.user.id)
    .eq('channel','email').eq('template_key','appointment_booked')
    .in('status',['queued','failed']).lt('attempts',3).limit(1));
  for (const row of rows) {
    try { await deliverNotification(ctx,row.id); }
    catch { console.warn('Appointment email remains in the staff notification queue'); }
  }
}

export function digitalDeliveryEmail(reference: string, orderId: string, origin: string) {
  return {
    subject: `Your Capistor downloads are ready · ${reference}`,
    text: `Your payment has been verified and your digital files are ready. Open your purchase below and select Download in the files section.

${origin}/portal/orders/${orderId}

Please sign in with the account used for this purchase. Your files remain available in your purchase history. For help, open a support request inside the order.

Capistor Technologies`,
  };
}

// Called only after authoritative payment settlement. One stable outbox record
// per order survives webhook retries, including when email is not configured yet.
export async function dispatchDigitalDeliveryEmail(db: Context['db'], orderId: string) {
  const order = check(await db.from('client_orders').select('id,client_id,payment_status,item_snapshot').eq('id', orderId).single());
  if (order.payment_status !== 'paid' || order.item_snapshot.kind !== 'digital') return;
  check(await db.from('notification_outbox').upsert({
    id: order.id, order_id: order.id, recipient_user_id: order.client_id,
    channel: 'email', template_key: 'digital_delivery', payload: {},
  }, {onConflict:'id', ignoreDuplicates:true}));
  const readiness = emailReadiness();
  if (!readiness.configured || !readiness.sendingEnabled) return;
  try { await deliverNotification({db}, order.id); }
  catch { console.warn('Digital delivery email remains in the staff notification queue'); }
}
