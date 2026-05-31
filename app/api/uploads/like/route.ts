import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { video_id, current_likes } = await req.json();

    if (!video_id) {
      return NextResponse.json(
        { error: "video_id is required" },
        { status: 400 }
      );
    }

    const newLikes = Number(current_likes || 0) + 1;

    const { data, error } = await supabaseAdmin
      .from("uploads")
      .update({ likes: newLikes })
      .eq("id", video_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to like video" },
      { status: 500 }
    );
  }
}