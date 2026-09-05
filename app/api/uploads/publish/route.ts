import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { getPublicationDecision } from "@/lib/content-moderation-enforcement";
import { requireAdminRequestPermission } from "@/lib/admin-session";

export async function POST(req: Request) {
  try {
    const adminAccess = await requireAdminRequestPermission(
      req,
      "moderation.manage"
    );

    if (!adminAccess.success) {
      return NextResponse.json(
        { error: adminAccess.error },
        { status: adminAccess.status }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await req.json();

        const { data: upload, error: uploadError } = await supabaseAdmin
      .from("uploads")
      .select("id, moderation_status")
      .eq("id", id)
      .single();

    if (uploadError || !upload) {
      return NextResponse.json(
        { error: "Upload not found" },
        { status: 404 }
      );
    }

    const publicationDecision = getPublicationDecision(
      upload.moderation_status
    );

    if (!publicationDecision.allowed) {
      return NextResponse.json(
        {
          error: "Content is not approved for publication",
          moderation_status: publicationDecision.moderationStatus,
          reason: publicationDecision.reason,
        },
        { status: 403 }
      );
    }

   const { data: publishedUpload, error } = await supabaseAdmin
  .from("uploads")
  .update({
    status: "published",
    published_at: new Date().toISOString(),
  })
  .eq("id", id)
  .in("moderation_status", ["approved", "legacy_unreviewed"])
  .select("id")
  .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "Failed to publish" },
        { status: 500 }
      );
    }
if (!publishedUpload) {
  return NextResponse.json(
    {
      error: "Content is no longer approved for publication",
    },
    { status: 409 }
  );
}
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}