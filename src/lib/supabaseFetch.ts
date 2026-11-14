// New Supabase API keys authenticate through apikey. Only user/legacy JWTs
// belong in Authorization. Some SDK paths still copy the API key there.
export const supabaseFetch: typeof fetch = (input, init) => {
  const headers = new Headers(
    init?.headers ?? (input instanceof Request ? input.headers : undefined),
  );
  const key = headers.get("apikey");
  if (
    key &&
    /^sb_(publishable|secret)_/.test(key) &&
    headers.get("authorization") === `Bearer ${key}`
  )
    headers.delete("authorization");
  return fetch(input, { ...init, headers });
};
