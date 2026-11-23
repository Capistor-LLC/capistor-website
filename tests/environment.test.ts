import { describe, expect, it } from "vitest";
import {
  appOrigin,
  assertPaymentEnvironment,
  requestOriginAllowed,
  validateStripeKey,
} from "../server/environment.js";

describe("deployment payment boundaries", () => {
  it("never allows a sandbox to disclose real bank or Bitcoin instructions", () => {
    expect(() => assertPaymentEnvironment("bank", {})).toThrow();
    expect(() =>
      assertPaymentEnvironment("btcpay", { STRIPE_MODE: "test" }),
    ).toThrow();
    expect(() =>
      assertPaymentEnvironment("stripe", {
        STRIPE_MODE: "test",
        VERCEL_ENV: "preview",
      }),
    ).not.toThrow();
  });
  it("rejects keys and deployments from the wrong payment environment", () => {
    expect(() =>
      validateStripeKey("sk_test_example", { STRIPE_MODE: "live" }),
    ).toThrow();
    expect(() =>
      validateStripeKey("sk_live_example", { STRIPE_MODE: "test" }),
    ).toThrow();
    expect(() =>
      validateStripeKey("sk_live_example", {
        STRIPE_MODE: "live",
        VERCEL_ENV: "preview",
      }),
    ).toThrow();
    expect(() =>
      validateStripeKey("sk_test_example", {
        STRIPE_MODE: "test",
        VERCEL_ENV: "production",
      }),
    ).toThrow();
    expect(() =>
      validateStripeKey("sk_live_example", {
        STRIPE_MODE: "live",
        VERCEL_ENV: "production",
      }),
    ).not.toThrow();
  });
  it("accepts exact deployment origins and rejects lookalikes and missing origins", () => {
    const preview = {
      VERCEL_ENV: "preview",
      VERCEL_URL: "build-123.vercel.app",
      VERCEL_BRANCH_URL: "capistor-staging.vercel.app",
    };
    expect(appOrigin(preview)).toBe("https://capistor-staging.vercel.app");
    expect(requestOriginAllowed("https://build-123.vercel.app", preview)).toBe(
      true,
    );
    expect(requestOriginAllowed("https://other.vercel.app", preview)).toBe(
      false,
    );
    expect(
      requestOriginAllowed(
        "https://capistor-staging.vercel.app.evil.test",
        preview,
      ),
    ).toBe(false);
    expect(requestOriginAllowed(undefined, preview)).toBe(false);
    expect(
      requestOriginAllowed("https://build-123.vercel.app", {
        ...preview,
        VERCEL_ENV: "production",
        APP_ORIGIN: "https://www.capistor.com",
      }),
    ).toBe(false);
  });
});
