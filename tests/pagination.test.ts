import { describe, expect, it } from "vitest";
import { allRows, rowsForIds } from "../server/pagination.js";

describe("complete history export", () => {
  it("includes history beyond the default database response cap", async () => {
    const history = Array.from({ length: 1203 }, (_, id) => ({ id }));
    const result = await allRows(async (from, to) => ({
      data: history.slice(from, to + 1),
      error: null,
    }));
    expect(result).toEqual(history);
  });
  it("rejects a failed later page instead of producing a partial record", async () => {
    await expect(
      allRows(async (from) =>
        from === 0
          ? { data: Array.from({ length: 500 }, (_, id) => id), error: null }
          : { data: null, error: { code: "P0001" } },
      ),
    ).rejects.toThrow();
  });
  it("batches long ID filters without omitting the last records", async () => {
    const ids = Array.from({ length: 207 }, (_, id) => String(id));
    const calls: number[] = [];
    expect(
      await rowsForIds(ids, async (batch) => {
        calls.push(batch.length);
        return batch;
      }),
    ).toEqual(ids);
    expect(calls).toEqual([100, 100, 7]);
  });
});
