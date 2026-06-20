import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabaseAdmin
    .from("advertising_inventory")
    .select(
      "slot_name, status, advertiser_name, campaign_name, headline, subheadline, cta_text, ad_image_url, landing_url, start_date, end_date"
    )
    .eq("slot_name", "Homepage Banner")
    .eq("status", "live");

  if (error) {
    return NextResponse.json(
      { ad: null, error: error.message },
      { status: 500 }
    );
  }

  const activeAds = (data || []).filter((ad) => {
    const startOk =
      !ad.start_date || ad.start_date <= today;

    const endOk =
      !ad.end_date || ad.end_date >= today;

    return startOk && endOk;
  });

  const selectedAd =
    activeAds.length > 0
      ? activeAds[Math.floor(Math.random() * activeAds.length)]
      : null;

  return NextResponse.json({ ad: selectedAd });
}