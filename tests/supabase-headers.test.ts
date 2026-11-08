import { afterEach, expect, it, vi } from "vitest";
import { supabaseFetch } from "../src/lib/supabaseFetch.js";
afterEach(() => vi.unstubAllGlobals());
it.each(["sb_publishable_example", "sb_secret_example"])(
  "keeps %s out of the JWT header",
  async (key) => {
    const request = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", request);
    await supabaseFetch("https://example.supabase.co/rest/v1/shop_items", {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const headers = request.mock.calls[0][1].headers as Headers;
    expect(headers.get("apikey")).toBe(key);
    expect(headers.has("authorization")).toBe(false);
  },
);
it("preserves authenticated user JWTs", async () => {
  const request = vi.fn().mockResolvedValue(new Response("{}"));
  vi.stubGlobal("fetch", request);
  await supabaseFetch("https://example.supabase.co/auth/v1/user", {
    headers: {
      apikey: "sb_publishable_example",
      Authorization: "Bearer user.jwt.signature",
    },
  });
  expect(
    (request.mock.calls[0][1].headers as Headers).get("authorization"),
  ).toBe("Bearer user.jwt.signature");
});
