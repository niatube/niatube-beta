import { supabaseAdmin } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { creator_name, video_id, amount } = body;

    if (!creator_name || !amount) {
      return NextResponse.json(
        { error: "creator_name and amount are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("tips")
      .insert({
        creator_name,
        video_id: video_id || null,
        amount: Number(amount),
        from_user: "Anonymous",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create tip" },
      { status: 500 }
    );
  }
}