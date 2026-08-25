import { NextRequest, NextResponse } from "next/server";

import { requireAuthenticatedCreator } from "@/lib/creator-auth";
import {
  getPayoutProviderQualification,
} from "@/lib/payout-provider-qualifications";
import {
  getStripeServerClient,
  isStripeTestModeConfigured,
} from "@/lib/stripe-server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    /*
     * Stripe Connect integration is sandbox-only
     * during the current implementation phase.
     */
    if (!isStripeTestModeConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Stripe Connect account creation is restricted to Stripe test mode.",
        },
        { status: 503 },
      );
    }

    /*
     * Never trust creator_id supplied by the client.
     * The verified Supabase user ID is canonical.
     */
    const creator =
      await requireAuthenticatedCreator(request);

    const supabaseAdmin = getSupabaseAdmin();
    const stripe = getStripeServerClient();

    /*
     * Reuse an existing Stripe provider account.
     * One creator should not receive duplicate
     * Stripe Connected Accounts.
     */
    const {
      data: existingProviderAccount,
      error: existingProviderAccountError,
    } = await supabaseAdmin
      .from("creator_payment_provider_accounts")
      .select(
        "id, creator_id, payment_provider, provider_account_id, provider_account_type, onboarding_status, details_submitted, charges_enabled, payouts_enabled, is_active",
      )
      .eq("creator_id", creator.userId)
      .eq("payment_provider", "STRIPE")
      .maybeSingle();

    if (existingProviderAccountError) {
      throw new Error(
        existingProviderAccountError.message ||
          "Failed to load existing Stripe provider account.",
      );
    }

    /*
     * Existing Stripe accounts are synchronized
     * through Accounts v2 only.
     *
     * We intentionally keep NiaTube's production
     * enablement booleans false until onboarding
     * and capability activation are implemented
     * and explicitly verified.
     */
    if (existingProviderAccount) {
      const stripeAccount =
        await stripe.v2.core.accounts.retrieve(
          existingProviderAccount.provider_account_id,
        );

      if (stripeAccount.livemode) {
        throw new Error(
          "A live-mode Stripe account cannot be used by the sandbox Connect integration.",
        );
      }

      const merchantApplied =
        stripeAccount.applied_configurations?.includes(
          "merchant",
        ) === true;

      const recipientApplied =
        stripeAccount.applied_configurations?.includes(
          "recipient",
        ) === true;

      const {
        data: updatedProviderAccount,
        error: updateError,
      } = await supabaseAdmin
        .from("creator_payment_provider_accounts")
        .update({
          provider_account_type:
            "CONNECT_V2_EXPRESS",
          onboarding_status:
            existingProviderAccount.onboarding_status ||
            "ACCOUNT_CREATED",
          details_submitted: false,
          charges_enabled: false,
          payouts_enabled: false,
          provider_metadata: {
            sandbox: true,
            stripe_api_version: "v2",
            stripe_livemode: stripeAccount.livemode,
            applied_configurations:
              stripeAccount.applied_configurations || [],
            merchant_applied: merchantApplied,
            recipient_applied: recipientApplied,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingProviderAccount.id)
        .select("*")
        .single();

      if (updateError) {
        throw new Error(
          updateError.message ||
            "Failed to synchronize Stripe provider account.",
        );
      }

      return NextResponse.json({
        success: true,
        created: false,
        providerAccount: updatedProviderAccount,
      });
    }

    /*
     * Stripe account creation requires the creator's
     * payout-country and payout-currency configuration.
     */
    const {
      data: payoutProfile,
      error: payoutProfileError,
    } = await supabaseAdmin
      .from("creator_payout_profiles")
      .select(
        "creator_id, payout_country_code, payout_currency, payout_preference_enabled",
      )
      .eq("creator_id", creator.userId)
      .maybeSingle();

    if (payoutProfileError) {
      throw new Error(
        payoutProfileError.message ||
          "Failed to load creator payout profile.",
      );
    }

    if (!payoutProfile) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Creator payout profile must be configured before Stripe Connect onboarding.",
        },
        { status: 409 },
      );
    }

    if (
      payoutProfile.payout_preference_enabled ===
      false
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Creator payout preference is disabled.",
        },
        { status: 409 },
      );
    }

    const countryCode = String(
      payoutProfile.payout_country_code || "",
    )
      .trim()
      .toUpperCase();

    const currencyCode = String(
      payoutProfile.payout_currency || "",
    )
      .trim()
      .toUpperCase();

    if (!countryCode || !currencyCode) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Creator payout country and currency must be configured before Stripe Connect onboarding.",
        },
        { status: 409 },
      );
    }

    /*
     * Commercial qualification is checked before
     * creating a Stripe Connected Account.
     *
     * This does not make the corridor production-ready.
     */
    const qualification =
  getPayoutProviderQualification({
    provider: "STRIPE",
    product: "CONNECT",
    countryCode,
    currencyCode,
  });

    if (
      !qualification ||
      qualification.commercialStatus !== "QUALIFIED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Stripe Connect onboarding is not commercially qualified for this creator payout market.",
          countryCode,
          currencyCode,
          commercialStatus:
            qualification?.commercialStatus ??
            "UNREGISTERED",
        },
        { status: 409 },
      );
    }

 /*
  * Stripe Accounts v2 sandbox experiment.
  *
  * IMPORTANT:
  * This route belongs to the Stripe Connect integration,
  * but the account configuration below currently applies
  * Stripe's Recipient configuration with stripe_transfers.
  *
  * It must not be interpreted as completed Connect
  * Direct Charges support or as production-ready payout
  * execution.
  *
  * Merchant configuration for Connect Direct Charges
  * will be implemented and validated separately for
  * markets where Stripe confirms support.
  *
  * Stripe Global Payouts recipient and outbound-payment
  * execution will also be implemented separately through
  * the GLOBAL_PAYOUTS product path.
  *
  * Until those integrations are completed, this account
  * remains sandbox-only and all NiaTube production
  * enablement flags remain fail-closed.
  */
    const stripeAccount =
      await stripe.v2.core.accounts.create(
        {
          contact_email:
            creator.email ?? undefined,

          display_name:
  creator.email?.split("@")[0] ||
  "NiaTube Creator",

dashboard: "express",

identity: {
  country: countryCode,
},

defaults: {
  currency: currencyCode.toLowerCase(),

  responsibilities: {
  fees_collector: "application_express",
  losses_collector: "application",
},
},

configuration: {
  recipient: {
    capabilities: {
      stripe_balance: {
        stripe_transfers: {
          requested: true,
        },
      },
    },
  },
},
metadata: {
  niatube_creator_id: creator.userId,
  niatube_environment: "sandbox",
  niatube_payout_country: countryCode,
  niatube_payout_currency: currencyCode,
},
        },
        {
          idempotencyKey:
            `niatube-connect-v2-account-${creator.userId}`,
        },
      );

    if (stripeAccount.livemode) {
      throw new Error(
        "Stripe returned a live-mode account during sandbox account creation.",
      );
    }

    const merchantApplied =
      stripeAccount.applied_configurations?.includes(
        "merchant",
      ) === true;

    const recipientApplied =
      stripeAccount.applied_configurations?.includes(
        "recipient",
      ) === true;

    const {
      data: providerAccount,
      error: providerAccountError,
    } = await supabaseAdmin
      .from("creator_payment_provider_accounts")
      .insert({
        creator_id: creator.userId,
        payment_provider: "STRIPE",
        provider_account_id: stripeAccount.id,
        provider_account_type:
          "CONNECT_V2_EXPRESS",
        onboarding_status: "ACCOUNT_CREATED",

        /*
         * Fail closed.
         *
         * These remain false until Stripe onboarding
         * and capability status are explicitly verified.
         */
        details_submitted: false,
        charges_enabled: false,
        payouts_enabled: false,

        is_active: true,

        provider_metadata: {
          sandbox: true,
          stripe_api_version: "v2",
          stripe_livemode: stripeAccount.livemode,
          payout_country_code: countryCode,
          payout_currency: currencyCode,
          applied_configurations:
            stripeAccount.applied_configurations || [],
          merchant_applied: merchantApplied,
          recipient_applied: recipientApplied,
        },
      })
      .select("*")
      .single();

    if (providerAccountError) {
      throw new Error(
        providerAccountError.message ||
          "Stripe account was created but NiaTube could not persist the provider account record.",
      );
    }

    return NextResponse.json(
      {
        success: true,
        created: true,
        providerAccount,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected Stripe Connect account error.";

    console.error(
      "Stripe Connect account creation error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
