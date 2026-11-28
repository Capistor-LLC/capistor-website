# Google login activation

Status, 28 November 2026: application support exists, but the production Google OAuth provider is not configured. Google Cloud was signed out in the available browser during handover. Do not claim Google sign-in is active until a real callback test passes.

## Existing application wiring

- `src/lib/supabase.ts`: PKCE session client; `enabledSignInProviders()` reads Supabase `/auth/v1/settings`.
- `src/commerce/Login.tsx`: only displays Google when the provider is enabled; starts `signInWithOAuth({ provider: 'google', options: { redirectTo } })`.
- Return URL is the current origin's `/login?next=...`, with `next` restricted to a local path.
- `server/auth.ts`: validates the resulting session; staff still requires AAL2 and a staff role. Google Pay is unrelated.

## Owner configuration

1. Sign into https://console.cloud.google.com/apis/credentials with the account that will own the application. Select or create the intended project.
2. Configure Google Auth branding/audience: Capistor Technologies, the verified business domain, support contact, homepage and privacy/terms URLs. Use basic identity scopes only.
3. Create a Web application OAuth client. Production origin: `https://capistortechnologies.com`. Exact authorized redirect URI: `https://mqzxzvesyjfftddquxik.supabase.co/auth/v1/callback`.
4. Store its client ID and secret in the production Supabase Google provider configuration at https://supabase.com/dashboard/project/mqzxzvesyjfftddquxik . Never commit the secret or put it in a VITE variable.
5. Check the Supabase redirect allowlist for the actual `/login?next=...` flow. Use tightly scoped allowed redirects; do not allow arbitrary return domains. Use a separate OAuth client for staging where practical.
6. Follow Google's audience/publishing requirements for use beyond test users; do not leave a customer-facing login restricted to an unpublished test audience.

## Acceptance tests

- Google button appears only when configured.
- New ordinary Google customer returns to the intended checkout; no admin access.
- Existing customer re-signs in without creating an unintended second purchase history.
- Owner account remains mapped to the intended user and still needs authenticator verification for staff actions.
- Cancelled sign-in returns safely; sign-out and repeat sign-in work.
- Test callback in the real production domain, not only a localhost tab.

Official guide: https://supabase.com/docs/guides/auth/social-sign-in/auth-google

This setup is the remaining external configuration; no new frontend Google SDK is needed for the existing Supabase redirect flow. Apple login is not being added under the current request.
