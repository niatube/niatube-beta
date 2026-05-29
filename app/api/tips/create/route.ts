import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase environment variables are missing." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { creator_name, video_id, amount, currency_code } = body;

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
  currency_code: currency_code || "USD",
  from_user: "Anonymous",
})
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to create tip" },
      { status: 500 }
    );
  }
}