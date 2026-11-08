import { PGlite } from "@electric-sql/pglite";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
let db: PGlite;
const client = randomUUID(),
  other = randomUUID(),
  owner = randomUUID();
let item: string;
async function row(sql: string, args: unknown[] = []) {
  return (await db.query<Record<string, unknown>>(sql, args)).rows[0];
}
async function makeOrder(kind = "digital") {
  const id = randomUUID();
  await db.query(
    `insert into client_orders(id,client_id,item_id,item_snapshot,client_name,billing_address,brief,total_minor,currency,status,accepted_terms,request_key) values($1,$2,$3,$4,'Client','Test address','Brief',9900,'USD',$5,'Terms',$6)`,
    [
      id,
      client,
      item,
      JSON.stringify({
        kind,
        requires_quote: false,
        title: "Review",
        price_minor: 9900,
        tax_bps: 0,
      }),
      kind === "digital" ? "awaiting_payment" : "awaiting_agreement",
      randomUUID(),
    ],
  );
  return id;
}
async function stripeAttempt(orderId: string, state = "created") {
  return String(
    (
      await row(
        `insert into payment_attempts(order_id,provider,total_minor,currency,state)
     values($1,'stripe',9900,'USD',$2) returning id`,
        [orderId, state],
      )
    ).id,
  );
}
async function settleStripe(
  orderId: string,
  attemptId: string,
  eventId: string,
  amount = 9900,
  invoiceId?: string,
) {
  return (
    await row(
      `select settle_order($1,'stripe',$2,$3,$4,'USD',$5,$6,p_invoice=>$7::jsonb) as ok`,
      [
        orderId,
        eventId,
        `pi_${attemptId}`,
        amount,
        attemptId,
        `cs_${attemptId}`,
        invoiceId ? JSON.stringify({ id: invoiceId }) : null,
      ],
    )
  ).ok;
}
async function signAll(id: string) {
  for (const kind of ["nda", "contract"]) {
    const d = await row(
      `insert into order_documents(order_id,kind,version,title,body,sha256,status) values($1,$2,1,$2,'Terms','hash','issued') returning id`,
      [id, kind],
    );
    for (const [user, party] of [
      [client, "client"],
      [owner, "company"],
    ])
      await db.query(
        `select sign_order_document($1,$2,'Test name','test@example.com',$3,'hash','Consent')`,
        [d.id, user, party],
      );
  }
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    `create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid primary key,bucket_id text);alter table storage.objects enable row level security;create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);create function auth.jwt() returns jsonb language sql as $$select coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}'::jsonb)$$;create function auth.uid() returns uuid language sql as $$select (auth.jwt()->>'sub')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on all functions in schema auth to anon,authenticated,service_role;`,
  );
  await db.query(
    `insert into auth.users values($1,'client@example.com',now()),($2,'other@example.com',now()),($3,'shoaib@capistor.com',now())`,
    [client, other, owner],
  );
  await db.exec(
    readFileSync("supabase/migrations/0001_init.sql", "utf8").replace(
      'create extension if not exists "pgcrypto";',
      "",
    ),
  );
  await db.exec(readFileSync("supabase/migrations/0002_commerce.sql", "utf8"));
  await db.exec(readFileSync("supabase/migrations/0003_blog.sql", "utf8"));
  item = String((await row("select id from shop_items limit 1")).id);
}, 30000);
afterAll(async () => {
  await db.close();
});
describe("Postgres transactions and RLS", () => {
  it("keeps published portfolio data public and requires MFA for legacy writes", async () => {
    await db.exec("set role anon");
    try {
      expect(
        (await row("select count(*)::int as n from products")).n,
      ).toBeGreaterThan(0);
    } finally {
      await db.exec("reset role");
    }
    for (const aal of ["aal1", "aal2"]) {
      await db.query(`select set_config('request.jwt.claims',$1,false)`, [
        JSON.stringify({ sub: owner, aal }),
      ]);
      await db.exec("set role authenticated");
      try {
        const result = await row(
          "with edited as (update products set tagline=tagline where slug='smart-watch' returning id) select count(*)::int as n from edited",
        );
        expect(result.n).toBe(aal === "aal2" ? 1 : 0);
      } finally {
        await db.exec("reset role");
      }
    }
  });
  it("separates clients and requires MFA for staff reads", async () => {
    const id = await makeOrder();
    for (const [user, aal, count] of [
      [client, "aal1", 1],
      [other, "aal1", 0],
      [owner, "aal1", 0],
      [owner, "aal2", 1],
    ]) {
      await db.query(`select set_config('request.jwt.claims',$1,false)`, [
        JSON.stringify({ sub: user, aal }),
      ]);
      await db.exec("set role authenticated");
      const r = await row(
        "select count(*)::int as n from client_orders where id=$1",
        [id],
      );
      expect(r.n).toBe(count);
      await db.exec("reset role");
    }
  });
  it("denies direct payment, price and signature writes", async () => {
    await db.exec("set role authenticated");
    try {
      await expect(
        db.query(`update shop_items set price_minor=1`),
      ).rejects.toThrow();
      await expect(
        db.query(`update client_orders set payment_status='paid'`),
      ).rejects.toThrow();
      await expect(
        db.query(
          `select settle_order($1,'stripe','forged','pi_forged',9900,'USD')`,
          [randomUUID()],
        ),
      ).rejects.toThrow("permission denied");
    } finally {
      await db.exec("reset role");
    }
  });
  it("quarantines a verified upload and records its history exactly once through the server", async () => {
    const order = await makeOrder("service");
    const file = randomUUID();
    await db.query(
      `insert into project_files(id,order_id,uploaded_by,filename,mime,size_bytes,sha256,object_key,stage_key)
       values($1,$2,$3,'example.pdf','application/octet-stream',42,'test-hash',$4,$5)`,
      [file, order, client, `private/${file}`, `staging/${file}`],
    );
    const finalize = (actor: string) =>
      row("select * from finalize_upload($1,$2)", [file, actor]);
    await db.exec("set role authenticated");
    try {
      await expect(finalize(client)).rejects.toThrow("permission denied");
    } finally {
      await db.exec("reset role");
    }
    await db.exec(
      "alter table order_events add constraint block_upload_event check (title <> 'New file uploaded') not valid",
    );
    try {
      await expect(finalize(client)).rejects.toThrow("block_upload_event");
      expect(
        (await row("select status from project_files where id=$1", [file]))
          .status,
      ).toBe("uploading");
    } finally {
      await db.exec(
        "alter table order_events drop constraint block_upload_event",
      );
    }
    await db.exec("set role service_role");
    try {
      await expect(finalize(other)).rejects.toThrow("does not belong");
      expect(await finalize(client)).toEqual({
        status: "quarantined",
        promoted: true,
      });
      expect(await finalize(client)).toEqual({
        status: "quarantined",
        promoted: false,
      });
      const events = await db.query(
        "select detail from order_events where order_id=$1 and title='New file uploaded'",
        [order],
      );
      expect(events.rows).toEqual([
        {
          detail:
            "example.pdf · version 1 · SHA-256 test-hash. Awaiting security review.",
        },
      ]);
    } finally {
      await db.exec("reset role");
    }
  });
  it("rejects mismatched amounts and settles exactly once", async () => {
    const id = await makeOrder();
    const attempt = await stripeAttempt(id);
    await expect(settleStripe(id, attempt, "evt_mismatch", 1)).rejects.toThrow(
      "mismatch",
    );
    expect(await settleStripe(id, attempt, "evt_success")).toBe(true);
    expect(await settleStripe(id, attempt, "evt_success")).toBe(false);
    expect(
      await settleStripe(id, attempt, "evt_same_payment_new_notification"),
    ).toBe(false);
    expect(
      await row(`select payment_status,status from client_orders where id=$1`, [
        id,
      ]),
    ).toMatchObject({ payment_status: "paid", status: "completed" });
    expect(
      (
        await row(
          `select count(*)::int as n from order_events where order_id=$1 and title='Payment confirmed'`,
          [id],
        )
      ).n,
    ).toBe(1);
    expect(
      (
        await row(
          `select count(*)::int as n from payment_events where order_id=$1`,
          [id],
        )
      ).n,
    ).toBe(1);
  });
  it("records money requiring reconciliation without releasing unsigned orders", async () => {
    const id = await makeOrder("service");
    const attempt = await stripeAttempt(id);
    expect(await settleStripe(id, attempt, "evt_unsigned")).toBe(false);
    expect(
      (await row(`select payment_status from client_orders where id=$1`, [id]))
        .payment_status,
    ).toBe("unpaid");
  });
  it("opens payment only after both parties sign both latest agreements", async () => {
    const id = await makeOrder("service");
    await signAll(id);
    expect(
      (await row(`select status from client_orders where id=$1`, [id])).status,
    ).toBe("awaiting_payment");
    await db.query(`select reserve_payment($1,'stripe')`, [id]);
    await expect(
      db.query(
        `select issue_order_document($1,'nda','NDA','Changed','newhash',true,$2)`,
        [id, owner],
      ),
    ).rejects.toThrow("locked");
  });
  it("rejects stale documents and protects signed text and audit history", async () => {
    const id = await makeOrder("service");
    const d = await row(
      `insert into order_documents(order_id,kind,version,title,body,sha256,status) values($1,'nda',1,'NDA','Terms','hash','issued') returning id`,
      [id],
    );
    await db.query(
      `select issue_order_document($1,'nda','NDA','New terms','hash2',true,$2)`,
      [id, owner],
    );
    await expect(
      db.query(
        `select sign_order_document($1,$2,'Client','client@example.com','client','hash','Consent')`,
        [d.id, client],
      ),
    ).rejects.toThrow("newer");
    await expect(
      db.query(`update order_documents set body='Changed' where id=$1`, [d.id]),
    ).rejects.toThrow("immutable");
    await expect(
      db.query(`delete from order_events where order_id=$1`, [id]),
    ).rejects.toThrow("cannot be edited");
  });
  it("does not restore access on a late success event following refund", async () => {
    const id = await makeOrder();
    const attempt = await stripeAttempt(id);
    await settleStripe(id, attempt, "evt_before_refund");
    await db.query(
      `select record_payment_reversal($1,$2,$3,'evt_refund','refunded')`,
      [id, attempt, `pi_${attempt}`],
    );
    await settleStripe(id, attempt, "evt_late");
    expect(
      (await row(`select payment_status from client_orders where id=$1`, [id]))
        .payment_status,
    ).toBe("refunded");
  });
  it("reserves bank exclusively and confirms cleared funds once", async () => {
    const online = await makeOrder();
    await db.query(`select reserve_payment($1,'stripe')`, [online]);
    await expect(
      db.query(`select reserve_payment($1,'bank')`, [online]),
    ).rejects.toThrow("another provider");
    const confirm = (orderId: string) =>
      row(
        `select settle_order($1,'bank','transfer-1','transfer-1',9900,'USD') as ok`,
        [orderId],
      );
    await expect(confirm(online)).rejects.toThrow("Payment attempt mismatch");

    const bank = await makeOrder();
    await db.query(`select reserve_payment($1,'bank')`, [bank]);
    await expect(
      db.query(`select reserve_payment($1,'stripe')`, [bank]),
    ).rejects.toThrow("another provider");
    await expect(
      db.query(`select reserve_payment($1,'btcpay')`, [bank]),
    ).rejects.toThrow("another provider");
    expect((await confirm(bank)).ok).toBe(true);
    expect((await confirm(bank)).ok).toBe(false);
    expect(
      await row(
        `select state,external_id from payment_attempts where order_id=$1`,
        [bank],
      ),
    ).toMatchObject({ state: "paid", external_id: "transfer-1" });

    const differentBankOrder = await makeOrder();
    await db.query(`select reserve_payment($1,'bank')`, [differentBankOrder]);
    await expect(confirm(differentBankOrder)).rejects.toThrow(
      "already belongs",
    );
  });
  it("keeps access and the accepted invoice when an additional payment is refunded", async () => {
    const id = await makeOrder();
    const additional = await stripeAttempt(id, "expired");
    const accepted = await stripeAttempt(id);
    await settleStripe(id, accepted, "evt_primary", 9900, "in_primary");
    expect(
      await settleStripe(
        id,
        additional,
        "evt_additional",
        9900,
        "in_additional",
      ),
    ).toBe(false);
    expect(
      await settleStripe(
        id,
        additional,
        "evt_additional_invoice",
        9900,
        "in_additional",
      ),
    ).toBe(false);
    const refund = (attempt: string, event: string) =>
      db.query(`select record_payment_reversal($1,$2,$3,$4,'refunded')`, [
        id,
        attempt,
        `pi_${attempt}`,
        event,
      ]);
    await refund(additional, "evt_refund_additional");
    await refund(additional, "evt_refund_additional");
    expect(
      await row(
        `select payment_status,invoice_id from client_orders where id=$1`,
        [id],
      ),
    ).toMatchObject({ payment_status: "paid", invoice_id: "in_primary" });
    expect(
      (
        await row(
          `select count(*)::int as n from payment_events where event_id='evt_refund_additional'`,
        )
      ).n,
    ).toBe(1);
    await refund(accepted, "evt_refund_primary");
    expect(
      await row(
        `select payment_status,invoice_id from client_orders where id=$1`,
        [id],
      ),
    ).toMatchObject({ payment_status: "refunded", invoice_id: "in_primary" });
  });
  it("keeps access suspended when a reversal arrives before the success event", async () => {
    const id = await makeOrder();
    const attempt = await stripeAttempt(id);
    await db.query(
      `select record_payment_reversal($1,$2,$3,'evt_early_refund','refunded')`,
      [id, attempt, `pi_${attempt}`],
    );
    expect(await settleStripe(id, attempt, "evt_delayed_success")).toBe(false);
    expect(
      await row(`select payment_status,status from client_orders where id=$1`, [
        id,
      ]),
    ).toMatchObject({ payment_status: "refunded", status: "awaiting_payment" });
  });
  it("rolls back the entire order if any agreement is invalid", async () => {
    const id = randomUUID();
    const payload = {
      id,
      reference: "CAP-ROLLBACK",
      client_id: client,
      item_id: item,
      item_snapshot: { kind: "service" },
      client_name: "Client",
      company: "",
      billing_address: "Test",
      brief: "Test",
      request_key: randomUUID(),
      total_minor: 9900,
      currency: "USD",
      status: "awaiting_agreement",
      accepted_terms: "Terms",
      accepted_license: "",
    };
    await expect(
      db.query(`select create_order_bundle($1,$2,'{}')`, [
        JSON.stringify(payload),
        JSON.stringify([
          { kind: "invalid", title: "Bad", body: "Bad", sha256: "hash" },
        ]),
      ]),
    ).rejects.toThrow();
    expect(
      (
        await row("select count(*)::int as n from client_orders where id=$1", [
          id,
        ])
      ).n,
    ).toBe(0);
  });
});
