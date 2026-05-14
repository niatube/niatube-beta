import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { videoId, isLive, streamTitle } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      is_live: isLive,
    };

    if (streamTitle) {
      updateData.title = streamTitle;
    }

    const { data, error } = await supabaseAdmin
      .from("uploads")
      .update(updateData)
      .eq("id", videoId)
      .select()
      .single();

    if (error) {
  console.error("Live update error FULL:", JSON.stringify(error, null, 2));

  return NextResponse.json(
    {
      error: error.message,
      details: error,
    },
    { status: 500 }
  );
}

    return NextResponse.json({ upload: data });
  } catch (err: any) {
    console.error("Live API error FULL:", err);

    return NextResponse.json(
      { error: err?.message || "Unexpected live update error" },
      { status: 500 }
    );
  }
}