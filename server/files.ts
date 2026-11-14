import { randomUUID } from "node:crypto";
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  type S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import type { Context } from "./auth.js";
import { administrator } from "./auth.js";
import { getOrder, agreementsReady, event } from "./orders.js";
import { storage, env, check } from "./runtime.js";
import { HttpError, id, sha256, text, validateFile } from "./policy.js";
export async function prepareUpload(ctx: Context, body: unknown) {
  const b = z
    .object({
      order_id: id.optional(),
      item_id: id.optional(),
      filename: text(180),
      size_bytes: z.number().int(),
      sha256: z.string().regex(/^[a-f0-9]{64}$/),
      version_label: text(50),
    })
    .parse(body);
  if (!!b.order_id === !!b.item_id)
    throw new HttpError(400, "Choose one upload destination");
  validateFile(b.filename, b.size_bytes);
  if (b.item_id) {
    administrator(ctx);
    const item = check(
      await ctx.db
        .from("shop_items")
        .select("id")
        .eq("id", b.item_id)
        .maybeSingle(),
    );
    if (!item) throw new HttpError(404, "Product not found");
  }
  if (b.order_id) {
    const o = await getOrder(ctx, b.order_id);
    if (o.item_snapshot.kind !== "service")
      throw new HttpError(
        409,
        "Digital product purchases do not accept project uploads. Start a service order with an NDA.",
      );
    if (["cancelled", "completed"].includes(o.status))
      throw new HttpError(409, "This order is closed");
    if (!(await agreementsReady(ctx, b.order_id, "nda")))
      throw new HttpError(
        409,
        "Both parties must sign the current NDA before uploading project files",
      );
  }
  const allowed = check(
    await ctx.db.rpc("consume_api_limit", {
      p_key: `uploads:${ctx.user.id}`,
      p_limit: 30,
      p_seconds: 3600,
    }),
  );
  if (!allowed)
    throw new HttpError(429, "Upload limit reached. Please try later.");
  const fileId = randomUUID(),
    stageKey = `staging/${ctx.user.id}/${fileId}`,
    key = `private/${b.order_id || b.item_id}/${fileId}`;
  const row = check(
    await ctx.db
      .from("project_files")
      .insert({
        ...b,
        id: fileId,
        uploaded_by: ctx.user.id,
        mime: "application/octet-stream",
        stage_key: stageKey,
        object_key: key,
      })
      .select("id")
      .single(),
  );
  const url = await getSignedUrl(
    storage(),
    new PutObjectCommand({
      Bucket: env("R2_BUCKET"),
      Key: stageKey,
      ContentType: "application/octet-stream",
      ContentLength: b.size_bytes,
    }),
    { expiresIn: 300 },
  );
  return { id: row.id, url };
}

async function verifiedBytes(
  s3: S3Client,
  bucket: string,
  key: string,
  expectedSize: number,
  expectedHash: string,
) {
  const object = await s3.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );
  if (!object.Body || object.ContentLength !== expectedSize)
    throw new HttpError(400, "Uploaded size does not match");
  const bytes = Buffer.allocUnsafe(expectedSize);
  let offset = 0;
  for await (const chunk of object.Body as AsyncIterable<Uint8Array>) {
    if (offset + chunk.length > expectedSize)
      throw new HttpError(400, "Uploaded size does not match");
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  if (offset !== expectedSize || sha256(bytes) !== expectedHash)
    throw new HttpError(400, "File checksum mismatch. Please upload again.");
  return bytes;
}

function storageStatus(error: unknown) {
  return (error as { $metadata?: { httpStatusCode?: number } } | null)
    ?.$metadata?.httpStatusCode;
}

export async function finishUpload(ctx: Context, fileId: string) {
  const f = check(
    await ctx.db
      .from("project_files")
      .select("*")
      .eq("id", fileId)
      .eq("uploaded_by", ctx.user.id)
      .single(),
  );
  if (f.status !== "uploading") return { status: f.status };
  if (f.order_id) {
    await getOrder(ctx, f.order_id);
    if (!(await agreementsReady(ctx, f.order_id, "nda")))
      throw new HttpError(409, "Current NDA signatures are required");
  } else administrator(ctx);
  validateFile(f.filename, f.size_bytes);
  const s3 = storage(),
    Bucket = env("R2_BUCKET");
  let stageError: HttpError | undefined;
  const bytes = await verifiedBytes(
    s3,
    Bucket,
    f.stage_key,
    f.size_bytes,
    f.sha256,
  ).catch((error: unknown) => {
    if (error instanceof HttpError) stageError = error;
    else if (storageStatus(error) !== 404) throw error;
    return null;
  });
  let created = false;
  if (bytes) {
    created = await s3
      .send(
        new PutObjectCommand({
          Bucket,
          Key: f.object_key,
          Body: bytes,
          ContentLength: bytes.length,
          IfNoneMatch: "*",
          ContentType: "application/octet-stream",
          ContentDisposition: "attachment",
        }),
      )
      .then(
        () => true,
        (error: unknown) => {
          if (storageStatus(error) !== 412) throw error;
          return false;
        },
      );
  }
  if (!created) {
    try {
      await verifiedBytes(s3, Bucket, f.object_key, f.size_bytes, f.sha256);
    } catch (error) {
      if (storageStatus(error) === 404)
        throw (
          stageError ?? new HttpError(409, "Upload the file before finishing.")
        );
      if (error instanceof HttpError)
        throw new HttpError(
          503,
          "This file requires storage reconciliation. Contact Capistor.",
        );
      throw error;
    }
  }
  const finalized = check(
    await ctx.db
      .rpc("finalize_upload", { p_file: fileId, p_actor: ctx.user.id })
      .single<{ status: string; promoted: boolean }>(),
  );
  if (!finalized.promoted) return { status: finalized.status };
  try {
    await s3.send(new DeleteObjectCommand({ Bucket, Key: f.stage_key }), {
      abortSignal: AbortSignal.timeout(3000),
    });
  } catch {
    console.warn(
      "Staging file cleanup failed; lifecycle expiration will retry cleanup",
    );
  }
  return { status: finalized.status };
}
export async function downloadFile(
  ctx: Context,
  fileId: string,
  review = false,
) {
  const f = check(
    await ctx.db
      .from("project_files")
      .select("*")
      .eq("id", fileId)
      .maybeSingle(),
  );
  if (!f) throw new HttpError(404, "File not found");
  if (f.order_id) {
    const order = await getOrder(ctx, f.order_id);
    if (
      !ctx.isAdmin &&
      f.uploaded_by !== ctx.user.id &&
      order.payment_status !== "paid"
    )
      throw new HttpError(
        403,
        "Confirmed payment is required to download deliverables",
      );
  } else if (!ctx.isAdmin) {
    const entries = check(
      await ctx.db
        .from("order_entitlements")
        .select("order_id")
        .eq("file_id", fileId),
    );
    const ids = entries.map((e) => e.order_id);
    const orders = ids.length
      ? check(
          await ctx.db
            .from("client_orders")
            .select("id")
            .in("id", ids)
            .eq("client_id", ctx.user.id)
            .eq("payment_status", "paid"),
        )
      : [];
    if (!orders.length) throw new HttpError(404, "File not found");
  }
  if (
    f.status !== "approved" &&
    !(ctx.isAdmin && review && f.status === "quarantined")
  )
    throw new HttpError(
      409,
      "This file is awaiting review or has been rejected",
    );
  const url = await getSignedUrl(
    storage(),
    new GetObjectCommand({
      Bucket: env("R2_BUCKET"),
      Key: f.object_key,
      ResponseContentType: "application/octet-stream",
      ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(f.filename)}`,
    }),
    { expiresIn: 60 },
  );
  if (f.order_id)
    await event(
      ctx,
      f.order_id,
      "download",
      review ? "File retrieved for security review" : "File download requested",
      f.filename,
    );
  return { url };
}
