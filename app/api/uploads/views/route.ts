import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing video id" }, { status: 400 });
    }

    const { data: currentVideo, error: fetchError } = await supabaseAdmin
      .from("uploads")
      .select("views")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    const currentViews = currentVideo?.views || 0;

    const { error: updateError } = await supabaseAdmin
      .from("uploads")
      .update({ views: currentViews + 1 })
      .eq("id", id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("View update error:", error);

    return NextResponse.json(
      { error: "Failed to update views" },
      { status: 500 }
    );
  }
}