import { check } from "./runtime.js";
import { HttpError } from "./policy.js";

// Supabase caps individual responses. Never silently export only the first page.
export async function allRows<T>(
  read: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const result: T[] = [];
  for (let offset = 0; offset < 50000; offset += 500) {
    const page = check(await read(offset, offset + 499));
    result.push(...page);
    if (page.length < 500) return result;
  }
  throw new HttpError(
    413,
    "This record needs an assisted export. Contact Capistor; no partial export has been produced.",
  );
}

export async function rowsForIds<T>(
  ids: string[],
  read: (ids: string[]) => Promise<T[]>,
): Promise<T[]> {
  const result: T[] = [];
  for (let offset = 0; offset < ids.length; offset += 100)
    result.push(...(await read(ids.slice(offset, offset + 100))));
  return result;
}
