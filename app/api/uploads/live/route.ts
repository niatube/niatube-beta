import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { requireAuthenticatedCreator } from "@/lib/creator-auth";


export async function POST(req: NextRequest) {
  try {
    const authenticatedCreator =
      await requireAuthenticatedCreator(req);

    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();
    const { videoId, isLive, streamTitle, liveStatus } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

const updateData: any = {
  is_live: isLive === true,
};

if (
  liveStatus === "live" ||
  liveStatus === "scheduled" ||
  liveStatus === "ended"
) {
  updateData.live_status = liveStatus;
}

if (streamTitle) {
  updateData.title = streamTitle;
}

if (isLive === true && liveStatus === "live") {
  const { data: existingUpload, error: existingUploadError } =
    await supabaseAdmin
      .from("uploads")
      .select("moderation_status")
      .eq("id", videoId)
      .eq("creator_user_id", authenticatedCreator.userId)
      .maybeSingle();

  if (existingUploadError) {
    console.error(
      "Live moderation check error FULL:",
      JSON.stringify(existingUploadError, null, 2)
    );

    return NextResponse.json(
      {
        error: existingUploadError.message,
        details: existingUploadError,
      },
      { status: 500 }
    );
  }

  if (!existingUpload) {
    return NextResponse.json(
      {
        error: "You are not authorized to update this live stream.",
      },
      { status: 403 }
    );
  }

  if (existingUpload.moderation_status !== "approved") {
    return NextResponse.json(
      {
        error:
          "This live event cannot be published until moderation is approved.",
      },
      { status: 403 }
    );
  }

  updateData.status = "published";
}

    const { data, error } = await supabaseAdmin
  .from("uploads")
  .update(updateData)
  .eq("id", videoId)
  .eq("creator_user_id", authenticatedCreator.userId)
  .select()
  .maybeSingle();

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

if (!data) {
  return NextResponse.json(
    {
      error: "You are not authorized to update this live stream.",
    },
    { status: 403 }
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