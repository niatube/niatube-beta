import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-server";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get("all") === "true";

    let query = supabaseAdmin
      .from("uploads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!showAll) {
      query = query.eq("status", "published");
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch uploads" },
        { status: 500 }
      );
    }

    return NextResponse.json({ uploads: data || [] });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

   const {
  title,
 creator,
  description,
  thumbnail_url,
  video_url,
  category,
  duration_seconds,
} = body;

    const { data, error } = await supabaseAdmin
      .from("uploads")
      .insert([
        {
  title,
creator,
description: description?.trim() || "",
thumbnail_url: thumbnail_url || null,
video_url: video_url || null,
category: category || "culture",
duration_seconds: duration_seconds || 0,
status: "published",
},
])
.select()
.single();
    if (error) {
  console.error("Upload insert error:", error);

  return NextResponse.json(
    { error: error.message },
    { status: 500 }
  );
}

    return NextResponse.json({ upload: data });
  } catch (err: any) {
  console.error("Upload API unexpected error:", err);

  return Response.json(
    { error: err?.message || "Unexpected error" },
    { status: 500 }
  );
}
}