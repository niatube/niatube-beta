import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { requireAdminRequestPermission } from "@/lib/admin-session";
import { detectContentModeration } from "@/lib/content-moderation-detector";
import { enforceModerationDecision } from "@/lib/content-moderation-enforcement";


export const dynamic = "force-dynamic";

function calculateTrendingScore(upload: any) {
  const views = Number(upload.views || 0);
  const likes = Number(upload.likes || 0);

  const createdAt = upload.created_at
    ? new Date(upload.created_at).getTime()
    : Date.now();

  const ageHours = Math.max(
    1,
    (Date.now() - createdAt) / (1000 * 60 * 60)
  );

  const freshnessBoost = Math.max(0, 100 - ageHours);

  return views * 1 + likes * 4 + freshnessBoost;
}

export async function GET(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get("all") === "true";

    if (showAll) {
      const adminAccess = await requireAdminRequestPermission(
        req,
        "moderation.read"
      );

      if (!adminAccess.success) {
        return NextResponse.json(
          { error: adminAccess.error },
          { status: adminAccess.status }
        );
      }
    }

    let query = supabaseAdmin
      .from("uploads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!showAll) {
      query = query
        .eq("status", "published")
        .in("moderation_status", [
          "approved",
          "legacy_unreviewed",
        ]);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch uploads" },
        { status: 500 }
      );
    }

    const scoredUploads = (data || []).map((upload) => ({
      ...upload,
      trending_score: calculateTrendingScore(upload),
    }));

   scoredUploads.sort((a, b) => {
  const aIsLive =
    Boolean(a.is_live) && a.live_status === "live";

  const bIsLive =
    Boolean(b.is_live) && b.live_status === "live";

  // Active livestreams must always appear first.
  if (aIsLive && !bIsLive) return -1;
  if (!aIsLive && bIsLive) return 1;

  const scoreDifference =
    Number(b.trending_score || 0) -
    Number(a.trending_score || 0);

  if (scoreDifference !== 0) {
    return scoreDifference;
  }

  return (
    new Date(b.created_at || 0).getTime() -
    new Date(a.created_at || 0).getTime()
  );
});

    return NextResponse.json({ uploads: scoredUploads });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();

  const {
  title,
  creator,
  description,
  thumbnail_url,
  video_url,
  category,
  duration_seconds,
  status,
  bunny_video_id,
  processing_started_at,
processing_deadline_at,
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
          bunny_video_id: bunny_video_id || null,
          processing_started_at:
         processing_started_at || null,
         processing_deadline_at:
         processing_deadline_at || null,
          category: category || "culture",
          duration_seconds: duration_seconds || 0,
          status: "processing",
          trending_score: 100,
          is_live: false,
          live_status: null,
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

    const moderationDetection = await detectContentModeration({
      uploadId: data.id,
      creatorName: data.creator || creator,
      title: data.title || title || "",
      description: data.description || description?.trim() || "",
      category: data.category || category || "culture",
      thumbnailUrl: data.thumbnail_url || null,
      videoUrl: data.video_url || null,
      bunnyVideoId: data.bunny_video_id || null,
      isLive: Boolean(data.is_live),
    });

    await enforceModerationDecision({
      supabaseAdmin,
      uploadId: data.id,
      creatorName: data.creator || creator,
      decision: moderationDetection.decision,
    });

    return NextResponse.json({
      upload: {
        ...data,
        moderation_status: moderationDetection.decision.moderationStatus,
        moderation_reason: moderationDetection.decision.reason,
        moderation_policy_category:
          moderationDetection.decision.policyCategory,
        moderation_confidence:
          moderationDetection.decision.confidence,
        moderation_detector:
          moderationDetection.decision.detector,
        moderation_detector_version:
          moderationDetection.decision.detectorVersion,
      },
    });
  } catch (err: any) {
    console.error("Upload API unexpected error:", err);

    return NextResponse.json(
      { error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
