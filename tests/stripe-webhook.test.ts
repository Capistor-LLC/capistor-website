import { afterEach, expect, it, vi } from 'vitest';
import Stripe from 'stripe';
import * as runtime from '../server/runtime.js';
import { stripeWebhook } from '../server/payments.js';
import type { Context } from '../server/auth.js';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

it('verifies raw webhook signatures with asynchronous Web Crypto and rejects tampering', async () => {
  const secret = 'whsec_unit_test_only';
  vi.stubEnv('STRIPE_MODE', 'test');
  vi.stubEnv('STRIPE_WEBHOOK_SECRET', secret);
  const client = new Stripe('sk_test_unit_test_only');
  const provider = Stripe.createSubtleCryptoProvider();
  const verify = client.webhooks.constructEventAsync.bind(client.webhooks);
  vi.spyOn(client.webhooks, 'constructEventAsync').mockImplementation((raw, signature, key) =>
    verify(raw, signature, key, undefined, provider));
  vi.spyOn(client.webhooks, 'constructEvent').mockImplementation(() => { throw Error('Synchronous crypto unavailable'); });
  vi.spyOn(runtime, 'stripe').mockReturnValue(client);
  const raw = JSON.stringify({id:'evt_signature_test', type:'unhandled.event', livemode:false, data:{object:{}}});
  const signature = await client.webhooks.generateTestHeaderStringAsync({payload:raw, secret, cryptoProvider:provider});
  const db = {} as Context['db'];
  await expect(stripeWebhook(db, Buffer.from(raw), signature)).resolves.toBeUndefined();
  await expect(stripeWebhook(db, Buffer.from(raw + ' '), signature)).rejects.toThrow('Invalid webhook signature');
  await expect(stripeWebhook(db, Buffer.from(raw), undefined)).rejects.toThrow('Missing signature');
});
