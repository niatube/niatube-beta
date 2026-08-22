import "server-only";

import Stripe from "stripe";

let stripeClient: Stripe | null = null;

/**
 * Returns the server-side Stripe client.
 *
 * IMPORTANT:
 * This helper is server-only. Never import it into
 * a Client Component or expose STRIPE_SECRET_KEY
 * through a NEXT_PUBLIC_* environment variable.
 *
 * The client is initialized lazily so NiaTube can
 * still build before Stripe credentials are added.
 */
export function getStripeServerClient(): Stripe {
  const secretKey = String(
    process.env.STRIPE_SECRET_KEY || "",
  ).trim();

  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured.",
    );
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

/**
 * Returns true when a Stripe secret key exists.
 *
 * This does not mean Stripe is production-ready.
 * Provider qualification and readiness gates remain
 * authoritative for payout routing.
 */
export function isStripeConfigured(): boolean {
  return Boolean(
    String(
      process.env.STRIPE_SECRET_KEY || "",
    ).trim(),
  );
}

/**
 * Returns true only when the configured secret key
 * is a Stripe test-mode secret key.
 *
 * Initial NiaTube Stripe integration work must remain
 * in test/sandbox mode.
 */
export function isStripeTestModeConfigured(): boolean {
  const secretKey = String(
    process.env.STRIPE_SECRET_KEY || "",
  ).trim();

  return secretKey.startsWith("sk_test_");
}