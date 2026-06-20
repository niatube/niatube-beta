import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data: campaigns, error: campaignsError } = await supabaseAdmin
      .from("ad_requests")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (campaignsError) {
      return NextResponse.json({ error: campaignsError.message }, { status: 500 });
    }

    const { data: inventory, error: inventoryError } = await supabaseAdmin
      .from("advertising_inventory")
      .select("*")
      .order("location", { ascending: true })
      .order("slot_name", { ascending: true });

    if (inventoryError) {
      return NextResponse.json({ error: inventoryError.message }, { status: 500 });
    }

    return NextResponse.json({
      campaigns: campaigns || [],
      inventory: inventory || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Could not load campaign assignment data." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const campaignId = body.campaignId;
    const inventoryId = body.inventoryId;
    const advertiserName = body.advertiserName;
    const campaignName = body.campaignName;
    const startDate = body.startDate;
    const endDate = body.endDate;

    if (!campaignId || !inventoryId || !advertiserName || !campaignName) {
      return NextResponse.json(
        { error: "Missing required assignment fields." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { error: inventoryError } = await supabaseAdmin
      .from("advertising_inventory")
      .update({
        status: "reserved",
        assigned_campaign_id: campaignId,
        advertiser_name: advertiserName,
        campaign_name: campaignName,
        start_date: startDate || null,
        end_date: endDate || null,
      })
      .eq("id", inventoryId);

    if (inventoryError) {
      return NextResponse.json({ error: inventoryError.message }, { status: 500 });
    }

    const { error: campaignError } = await supabaseAdmin
      .from("ad_requests")
      .update({ status: "scheduled" })
      .eq("id", campaignId);

    if (campaignError) {
      return NextResponse.json({ error: campaignError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Could not assign advertising campaign." },
      { status: 500 }
    );
  }
}