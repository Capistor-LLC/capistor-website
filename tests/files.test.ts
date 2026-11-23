import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "node:stream";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Context } from "../server/auth.js";
import { finishUpload } from "../server/files.js";
import { sha256 } from "../server/policy.js";

const send = vi.hoisted(() => vi.fn());
vi.mock("../server/runtime.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../server/runtime.js")>()),
  env: () => "test-bucket",
  storage: () => ({ send }),
}));
vi.mock("../server/orders.js", () => ({
  getOrder: vi.fn().mockResolvedValue({}),
  agreementsReady: vi.fn().mockResolvedValue(true),
  event: vi.fn(),
}));

const verified = Buffer.from("verified content");
const file = {
  id: "file",
  order_id: "order",
  filename: "drawing.pdf",
  version_label: "1",
  size_bytes: verified.length,
  sha256: sha256(verified),
  status: "uploading",
  stage_key: "staging/file",
  object_key: "private/file",
};

function databaseResponse(data: unknown) {
  return { data, error: null };
}

function storageObject(bytes = verified) {
  return {
    Body: Readable.from([bytes.subarray(0, 5), bytes.subarray(5)]),
    ContentLength: bytes.length,
  };
}

function storageFailure(httpStatusCode: number) {
  return { $metadata: { httpStatusCode } };
}

function context() {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValueOnce(databaseResponse(file)),
  };
  const finalize = vi
    .fn()
    .mockResolvedValue(
      databaseResponse({ status: "quarantined", promoted: true }),
    );
  const rpc = vi.fn().mockReturnValue({ single: finalize });
  const ctx = {
    user: { id: "uploader" },
    db: { from: vi.fn().mockReturnValue(query), rpc },
  } as unknown as Context;
  return { ctx, finalize, rpc };
}

describe("finalizing private files", () => {
  beforeEach(() => {
    send.mockReset();
  });
  afterEach(() => vi.restoreAllMocks());

  it("writes exactly the verified bytes once and succeeds if stage cleanup fails", async () => {
    const { ctx, rpc } = context();
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    send
      .mockResolvedValueOnce(storageObject())
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(storageFailure(503));

    await expect(finishUpload(ctx, file.id)).resolves.toEqual({
      status: "quarantined",
    });
    const [get, put, remove] = send.mock.calls.map(([command]) => command);
    expect(get).toBeInstanceOf(GetObjectCommand);
    expect(get.input.Key).toBe(file.stage_key);
    expect(put).toBeInstanceOf(PutObjectCommand);
    expect(put.input).toMatchObject({
      Key: file.object_key,
      Body: verified,
      ContentLength: verified.length,
      IfNoneMatch: "*",
    });
    expect(remove).toBeInstanceOf(DeleteObjectCommand);
    expect(rpc).toHaveBeenCalledWith("finalize_upload", {
      p_file: file.id,
      p_actor: "uploader",
    });
    expect(warning).toHaveBeenCalledOnce();
  });

  it("refuses to release an existing destination whose hash differs", async () => {
    const { ctx, rpc } = context();
    send
      .mockResolvedValueOnce(storageObject())
      .mockRejectedValueOnce(storageFailure(412))
      .mockResolvedValueOnce(storageObject(Buffer.alloc(verified.length, 1)));

    await expect(finishUpload(ctx, file.id)).rejects.toMatchObject({
      status: 503,
    });
    expect(send.mock.calls[2][0].input.Key).toBe(file.object_key);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("resumes from a verified private object after the stage object expires", async () => {
    const { ctx, rpc } = context();
    send
      .mockRejectedValueOnce(storageFailure(404))
      .mockResolvedValueOnce(storageObject())
      .mockResolvedValueOnce({});

    await expect(finishUpload(ctx, file.id)).resolves.toEqual({
      status: "quarantined",
    });
    expect(send.mock.calls[1][0].input.Key).toBe(file.object_key);
    expect(
      send.mock.calls.some(([command]) => command instanceof PutObjectCommand),
    ).toBe(false);
    expect(rpc).toHaveBeenCalledOnce();
  });

  it("rejects a staging hash mismatch before writing the destination", async () => {
    const { ctx, rpc } = context();
    send
      .mockResolvedValueOnce(storageObject(Buffer.alloc(verified.length, 1)))
      .mockRejectedValueOnce(storageFailure(404));

    await expect(finishUpload(ctx, file.id)).rejects.toMatchObject({
      status: 400,
    });
    expect(
      send.mock.calls.every(([command]) => command instanceof GetObjectCommand),
    ).toBe(true);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("recovers the verified private object after staging content changes", async () => {
    const { ctx, rpc } = context();
    send
      .mockResolvedValueOnce(storageObject(Buffer.alloc(verified.length, 1)))
      .mockResolvedValueOnce(storageObject())
      .mockResolvedValueOnce({});

    await expect(finishUpload(ctx, file.id)).resolves.toEqual({
      status: "quarantined",
    });
    expect(
      send.mock.calls.some(([command]) => command instanceof PutObjectCommand),
    ).toBe(false);
    expect(rpc).toHaveBeenCalledOnce();
  });

  it("returns the current state and skips cleanup when another finish won", async () => {
    const { ctx, finalize } = context();
    finalize.mockResolvedValueOnce(
      databaseResponse({ status: "approved", promoted: false }),
    );
    send
      .mockResolvedValueOnce(storageObject())
      .mockRejectedValueOnce(storageFailure(412))
      .mockResolvedValueOnce(storageObject());

    await expect(finishUpload(ctx, file.id)).resolves.toEqual({
      status: "approved",
    });
    expect(send).toHaveBeenCalledTimes(3);
  });
});
