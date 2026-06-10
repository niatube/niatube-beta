import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isBunnyVideoReady(video: any) {
  const status = Number(video?.status ?? video?.Status);

  // Bunny Stream commonly uses 4 for finished/ready.
  return status === 4 || video?.availableResolutions || video?.AvailableResolutions;
}

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    const apiKey = process.env.BUNNY_STREAM_API_KEY;

    if (!libraryId || !apiKey) {
      return NextResponse.json(
        { error: "Missing Bunny environment variables." },
        { status: 500 }
      );
    }

    const { data: uploads, error } = await supabaseAdmin
      .from("uploads")
      .select("*")
      .eq("status", "processing")
      .lt("processing_deadline_at", new Date().toISOString());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const overdueUploads = uploads || [];
    const results: any[] = [];

    for (const upload of overdueUploads) {
      if (!upload.bunny_video_id) {
        results.push({
          uploadId: upload.id,
          title: upload.title,
          action: "skipped",
          reason: "Missing bunny_video_id",
        });

        continue;
      }

      const bunnyRes = await fetch(
        `https://video.bunnycdn.com/library/${libraryId}/videos/${upload.bunny_video_id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            AccessKey: apiKey,
          },
        }
      );

      const bunnyText = await bunnyRes.text();

      if (!bunnyRes.ok) {
        results.push({
          uploadId: upload.id,
          title: upload.title,
          bunnyVideoId: upload.bunny_video_id,
          action: "checked",
          published: false,
          reason: "Bunny status request failed",
          bunnyStatusCode: bunnyRes.status,
          bunnyResponse: bunnyText,
        });

        continue;
      }

      const bunnyVideo = JSON.parse(bunnyText);
      const ready = isBunnyVideoReady(bunnyVideo);

      if (!ready) {
        results.push({
          uploadId: upload.id,
          title: upload.title,
          bunnyVideoId: upload.bunny_video_id,
          action: "checked",
          published: false,
          reason: "Bunny video not ready yet",
          bunnyStatus: bunnyVideo?.status ?? bunnyVideo?.Status,
          availableResolutions:
            bunnyVideo?.availableResolutions ??
            bunnyVideo?.AvailableResolutions ??
            null,
        });

        continue;
      }

      const { data: updatedUpload, error: updateError } = await supabaseAdmin
        .from("uploads")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
        })
        .eq("id", upload.id)
        .select()
        .single();

      if (updateError) {
        results.push({
          uploadId: upload.id,
          title: upload.title,
          bunnyVideoId: upload.bunny_video_id,
          action: "publish_failed",
          error: updateError.message,
        });

        continue;
      }

      results.push({
        uploadId: upload.id,
        title: upload.title,
        bunnyVideoId: upload.bunny_video_id,
        action: "published",
        upload: updatedUpload,
      });
    }

    return NextResponse.json({
      success: true,
      checked: overdueUploads.length,
      published: results.filter((item) => item.action === "published").length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Unexpected error",
      },
      { status: 500 }
    );
  }
}