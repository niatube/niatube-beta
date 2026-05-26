import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-server";

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get("all") === "true";

    let query = supabaseAdmin
      .from("uploads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

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

    const scoredUploads = (data || []).map((upload) => ({
      ...upload,
      trending_score: calculateTrendingScore(upload),
    }));

    scoredUploads.sort((a, b) => {
      const scoreDifference =
        Number(b.trending_score || 0) - Number(a.trending_score || 0);

      if (scoreDifference !== 0) return scoreDifference;

      return (
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
      );
    });

    return NextResponse.json({ uploads: scoredUploads.slice(0, 20) });
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
          trending_score: 100,
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

    return NextResponse.json(
      { error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}