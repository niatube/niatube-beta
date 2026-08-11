import { NextResponse } from "next/server";

import {
  SettlementStatus,
  settlementEngine,
} from "@/lib/settlement-engine";

import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(
  request: Request,
) {
  try {
    const supabaseAdmin =
      getSupabaseAdmin();

    const body =
      await request.json();

    const {
      settlementId,
      nextStatus,
      transitionReason,
      paymentProvider,
      providerReference,
    } = body;

    if (!settlementId) {
      return NextResponse.json(
        {
          error:
            "settlementId is required.",
        },
        { status: 400 },
      );
    }

    switch (nextStatus) {
      case SettlementStatus.CAPTURED:
        return NextResponse.json(
          await settlementEngine.capture({
            supabaseAdmin,
            settlementId,
            transitionReason,
            paymentProvider,
            providerReference,
          }),
        );

      case SettlementStatus.SETTLEMENT_PENDING:
        return NextResponse.json(
          await settlementEngine.settle({
            supabaseAdmin,
            settlementId,
            transitionReason,
            paymentProvider,
            providerReference,
          }),
        );

      case SettlementStatus.SETTLED:
        return NextResponse.json(
          await settlementEngine.confirmSettlement({
            supabaseAdmin,
            settlementId,
            transitionReason,
            paymentProvider,
            providerReference,
          }),
        );

      case SettlementStatus.AVAILABLE:
        return NextResponse.json(
          await settlementEngine.releaseFunds({
            supabaseAdmin,
            settlementId,
            transitionReason,
            paymentProvider,
            providerReference,
          }),
        );

      case SettlementStatus.WITHDRAWAL_REQUESTED:
        return NextResponse.json(
          await settlementEngine.requestWithdrawal({
            supabaseAdmin,
            settlementId,
            transitionReason,
            paymentProvider,
            providerReference,
          }),
        );

      case SettlementStatus.PAYOUT_QUEUED:
        return NextResponse.json(
          await settlementEngine.queuePayout({
            supabaseAdmin,
            settlementId,
            transitionReason,
            paymentProvider,
            providerReference,
          }),
        );

      case SettlementStatus.PAYOUT_PROCESSING:
        return NextResponse.json(
          await settlementEngine.processPayout({
            supabaseAdmin,
            settlementId,
            transitionReason,
            paymentProvider,
            providerReference,
          }),
        );

      case SettlementStatus.PAID_OUT:
        return NextResponse.json(
          await settlementEngine.completePayout({
            supabaseAdmin,
            settlementId,
            transitionReason,
            paymentProvider,
            providerReference,
          }),
        );

      default:
        return NextResponse.json(
          {
            error:
              "Unsupported settlement status.",
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error(
      "Settlement transition error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Settlement transition failed.",
      },
      { status: 500 },
    );
  }
}