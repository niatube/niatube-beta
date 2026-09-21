import { NextResponse } from "next/server";

import {
  getStripeServerClient,
} from "@/lib/stripe-server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";

/**
 * Stripe webhook foundation.
 *
 * Phase 1 responsibilities:
 *
 * - receive the raw Stripe webhook payload
 * - require the Stripe-Signature header
 * - verify the event cryptographically
 * - reject unverified events
 *
 * Settlement mutations are intentionally not
 * performed here yet. Event-to-settlement mapping
 * will be added only after signature verification
 * has been validated in Stripe test mode.
 */
export async function POST(
  request: Request,
) {
  const webhookSecret = String(
    process.env.STRIPE_WEBHOOK_SECRET || "",
  ).trim();

  if (!webhookSecret) {
    console.error(
      "Stripe webhook rejected: STRIPE_WEBHOOK_SECRET is not configured.",
    );

    return NextResponse.json(
      {
        error:
          "Stripe webhook is not configured.",
      },
      {
        status: 503,
      },
    );
  }

  const signature =
    request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      {
        error:
          "Missing Stripe-Signature header.",
      },
      {
        status: 400,
      },
    );
  }

  /*
   * Stripe signature verification requires the
   * exact raw request body. Do not call
   * request.json() before constructEvent().
   */
  const rawBody = await request.text();

  try {
    const stripe =
      getStripeServerClient();

    const event =
      stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );

    console.log(
      "Verified Stripe webhook event:",
      event.id,
      event.type,
    );

    const supabaseAdmin =
      getSupabaseAdmin();

    const {
      data: webhookEvent,
      error: webhookEventError,
    } = await supabaseAdmin
      .from("stripe_webhook_events")
      .insert([
        {
          stripe_event_id: event.id,
          event_type: event.type,
          livemode: event.livemode,
          api_version:
            event.api_version || null,
          processing_status: "RECEIVED",
        },
      ])
      .select()
      .single();

    if (webhookEventError) {
      if (
        webhookEventError.code === "23505"
      ) {
        const {
          data: existingEvent,
          error: lookupError,
        } = await supabaseAdmin
          .from("stripe_webhook_events")
          .select("*")
          .eq(
            "stripe_event_id",
            event.id,
          )
          .maybeSingle();

        if (
          !lookupError &&
          existingEvent
        ) {
          console.log(
            "Duplicate Stripe webhook event acknowledged:",
            event.id,
            event.type,
          );

          return NextResponse.json(
            {
              received: true,
              duplicate: true,
              eventId: event.id,
              eventType: event.type,
              processingStatus:
                existingEvent.processing_status,
            },
            {
              status: 200,
            },
          );
        }
      }

      console.error(
        "Stripe webhook event persistence failed:",
        webhookEventError,
      );

      return NextResponse.json(
        {
          error:
            "Failed to persist Stripe webhook event.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      received: true,
      duplicate: false,
      eventId: event.id,
      eventType: event.type,
      processingStatus:
        webhookEvent.processing_status,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown Stripe webhook verification error.";

    console.error(
      "Stripe webhook signature verification failed:",
      message,
    );

    return NextResponse.json(
      {
        error:
          "Invalid Stripe webhook signature.",
      },
      {
        status: 400,
      },
    );
  }
}
