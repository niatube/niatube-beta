import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await req.json();

    const { error } = await supabaseAdmin
      .from("uploads")
      .update({ status: "published" })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to publish" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}