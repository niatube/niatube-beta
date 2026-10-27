import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { requireAdminRequestPermission } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authorization = await requireAdminRequestPermission(
      request,
      "governance.read"
    );

    if (!authorization.success) {
      return NextResponse.json(
        {
          success: false,
          error: authorization.error,
        },
        { status: authorization.status }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: creators, error: creatorsError } =
      await supabaseAdmin
        .from("creator_profiles")
        .select("*")
        .order("creator_name");

    if (creatorsError) {
      throw creatorsError;
    }

    const { data: uploads } = await supabaseAdmin
      .from("uploads")
      .select("creator,status");

    const totalCreators = creators?.length || 0;
    const totalVideos = uploads?.length || 0;

    const publishedVideos =
      uploads?.filter(
        (video) => video.status === "published"
      ).length || 0;

    const processingVideos =
      uploads?.filter(
        (video) => video.status === "processing"
      ).length || 0;

  const officialCreatorNames = new Set(
  (creators || []).map((creator) => creator.creator_name)
);

const creatorsWithUploads = new Set(
  (uploads || [])
    .map((video) => video.creator)
    .filter((creatorName) => officialCreatorNames.has(creatorName))
).size;
    return NextResponse.json({
      success: true,
      stats: {
        totalCreators,
        creatorsWithUploads,
        totalVideos,
        publishedVideos,
        processingVideos,
      },
      creators: creators || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unexpected error.",
      },
      { status: 500 }
    );
  }
}