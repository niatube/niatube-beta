import { authorizePayment } from "@/lib/payment-authorization";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { recordCreatorWalletEntry } from "@/lib/creator-wallet-engine";
import {
  calculateNetAmount,
  calculatePlatformFee,
  normalizeCurrencyCode,
  TRANSACTION_STATUS,
} from "@/lib/creator-economy";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();

    const creatorName = body.creator_name || body.creatorName;
    const creatorId = body.creator_id || body.creatorId || creatorName;

    const viewerId =
      body.viewer_id ||
      body.viewerId ||
      body.member_id ||
      body.memberId ||
      "anonymous-member";

    const viewerName =
      body.viewer_name ||
      body.viewerName ||
      body.member_name ||
      body.memberName ||
      "Member";

    const tier = body.tier || "Supporter";
    const amount = Number(body.amount || 5);
    const currencyCode = normalizeCurrencyCode(
      body.currency_code || body.currency || "USD"
    );

    const country =
      body.country || body.country_name || body.countryName || "United States";

    const paymentMethod = String(
      body.payment_method || body.paymentMethod || "CARD"
    ).toUpperCase();

    if (!creatorName) {
      return NextResponse.json(
        { error: "Creator name is required." },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Membership amount must be greater than zero." },
        { status: 400 }
      );
    }

    const authorization = await authorizePayment({
      viewerId,
      creatorId,
      country,
      currency: currencyCode,
      paymentMethod,
      amount,
    });

    if (!authorization.approved) {
      return NextResponse.json(
        {
          error: authorization.message,
          authorization_code: authorization.code,
          authorization_reason: authorization.reason,
          risk_score: authorization.riskScore,
        },
        { status: 403 }
      );
    }

    const platformFee = calculatePlatformFee(amount);
    const netAmount = calculateNetAmount(amount);

    const now = new Date();
    const nextBillingDate = new Date(now);
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    const { data: membershipData, error: membershipError } =
      await supabaseAdmin
        .from("creator_memberships")
        .insert([
          {
            creator_name: creatorName,
            viewer_id: viewerId,
            viewer_name: viewerName,
            tier,
            currency_code: currencyCode,
            gross_amount: amount,
            platform_fee: platformFee,
            net_amount: netAmount,
            status: "active",
            billing_period: "monthly",
            started_at: now.toISOString(),
            next_billing_date: nextBillingDate.toISOString(),
          },
        ])
        .select()
        .single();

    if (membershipError) {
      console.error("Membership insert error:", membershipError);
      return NextResponse.json(
        { error: membershipError.message },
        { status: 500 }
      );
    }

    try {
      await recordCreatorWalletEntry({
        supabaseAdmin,
        creatorName,
        transactionType: "membership",
        referenceId: membershipData.id,
        currencyCode,
        amount: netAmount,
        status: TRANSACTION_STATUS.COMPLETED,
      });
    } catch (error: any) {
      console.error("Membership wallet error:", error);

      return NextResponse.json(
        {
          error:
            error?.message || "Failed to record membership wallet entry.",
        },
        { status: 500 }
      );
    }

    await supabaseAdmin.from("notifications").insert([
      {
        creator_name: creatorName,
        type: "membership",
        title: "New membership started",
        message: `${viewerName} joined your membership at ${currencyCode} ${amount}/month.`,
      },
    ]);

    return NextResponse.json(
      {
        membership: membershipData,
        payment_authorization: {
          approved: authorization.approved,
          message: authorization.message,
          risk_score: authorization.riskScore,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Membership join API error:", error);

    return NextResponse.json(
      { error: error?.message || "Failed to create membership." },
      { status: 500 }
    );
  }
}