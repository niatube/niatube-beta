import { supabaseAdmin } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const creatorName = searchParams.get("creator");

  let query = supabaseAdmin
    .from("tips")
    .select("*")
    .order("created_at", { ascending: false });

  if (creatorName) {
    query = query.eq("creator_name", creatorName);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase tips error:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data ?? []);
}