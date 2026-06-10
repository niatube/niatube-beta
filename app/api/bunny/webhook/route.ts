import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();
    console.log("BUNNY WEBHOOK RECEIVED:", JSON.stringify(body, null, 2));

   const videoId =
  body?.videoId ||
  body?.VideoId ||
  body?.VideoGuid ||
  body?.guid ||
  body?.Guid ||
  body?.video?.guid ||
  body?.video?.id;

    if (!videoId) {
      return NextResponse.json(
        { error: "Missing Bunny video ID.", received: body },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("uploads")
      .update({
        status: "published",
      })
      .eq("bunny_video_id", videoId)
     .select()
.maybeSingle();
    if (error) {
  return NextResponse.json(
    { error: error.message, videoId },
    { status: 500 }
  );
}

if (!data) {
  return NextResponse.json(
    { success: false, message: "No matching upload found.", videoId },
    { status: 200 }
  );
}

    return NextResponse.json({
      success: true,
      message: "Video published successfully.",
      videoId,
      upload: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Bunny webhook failed.",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}