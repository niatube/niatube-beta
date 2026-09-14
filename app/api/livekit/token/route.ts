import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { requireAuthenticatedCreator } from "@/lib/creator-auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TokenRequestBody = {
  roomName?: string;
  participantName?: string;
  role?: "creator" | "viewer";
};

export async function POST(request: NextRequest) {
  try {
    const livekitUrl = process.env.LIVEKIT_URL;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!livekitUrl || !apiKey || !apiSecret) {
      return NextResponse.json(
        {
          error:
            "LiveKit environment variables are not completely configured.",
        },
        { status: 500 }
      );
    }

    const body = (await request.json()) as TokenRequestBody;

    const roomName = body.roomName?.trim();
    const participantName = body.participantName?.trim();
    const role = body.role === "creator" ? "creator" : "viewer";

    if (!roomName) {
      return NextResponse.json(
        { error: "Room name is required." },
        { status: 400 }
      );
    }
if (!participantName) {
  return NextResponse.json(
    { error: "Participant name is required." },
    { status: 400 }
  );
}

if (role === "creator") {
  const roomPrefix = "niatube-live-";

  if (!roomName.startsWith(roomPrefix)) {
    return NextResponse.json(
      { error: "Invalid NiaTube live room." },
      { status: 403 }
    );
  }

  const streamId = roomName.slice(roomPrefix.length).trim();

  if (!streamId) {
    return NextResponse.json(
      { error: "Live stream ID is missing." },
      { status: 403 }
    );
  }

  let authenticatedCreator;

  try {
    authenticatedCreator =
      await requireAuthenticatedCreator(request);
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error?.message ||
          "Authentication is required to publish a live stream.",
      },
      { status: 401 }
    );
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data: stream, error: streamError } = await supabaseAdmin
    .from("uploads")
    .select("creator_user_id")
    .eq("id", streamId)
    .maybeSingle();

  if (streamError) {
    console.error(
      "LiveKit creator authorization lookup error:",
      streamError
    );

    return NextResponse.json(
      { error: "Unable to verify live stream ownership." },
      { status: 500 }
    );
  }

  const creatorOwnsStream =
    stream !== null &&
    stream.creator_user_id === authenticatedCreator.userId;

  if (!creatorOwnsStream) {
    return NextResponse.json(
      { error: "You are not authorized to publish this live stream." },
      { status: 403 }
    );
  }
}

if (role === "viewer") {
      const roomPrefix = "niatube-live-";

      if (!roomName.startsWith(roomPrefix)) {
        return NextResponse.json(
          { error: "Invalid NiaTube live room." },
          { status: 403 }
        );
      }

      const streamId = roomName.slice(roomPrefix.length).trim();

      if (!streamId) {
        return NextResponse.json(
          { error: "Live stream ID is missing." },
          { status: 403 }
        );
      }

      const supabaseAdmin = getSupabaseAdmin();

      const { data: stream, error: streamError } = await supabaseAdmin
        .from("uploads")
        .select("status, moderation_status, is_live, live_status")
        .eq("id", streamId)
        .maybeSingle();

      if (streamError) {
        console.error(
          "LiveKit viewer authorization lookup error:",
          streamError
        );

        return NextResponse.json(
          { error: "Unable to verify this live stream." },
          { status: 500 }
        );
      }

      const moderationAllowsViewing =
        stream?.moderation_status === "approved" ||
        stream?.moderation_status === "legacy_unreviewed";

           const viewerAccessAllowed =
        stream !== null &&
        stream.status === "published" &&
        moderationAllowsViewing &&
        stream.is_live === true &&
        stream.live_status === "live";

      if (!viewerAccessAllowed) {
        return NextResponse.json(
          { error: "This live stream is not available for viewing." },
          { status: 403 }
        );
      }
    }

    const participantIdentity = `${role}-${participantName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-${crypto.randomUUID()}`;

    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      name: participantName,
      ttl: "2h",
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: role === "creator",
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();

    return NextResponse.json({
      token: jwt,
      serverUrl: livekitUrl,
      roomName,
      participantIdentity,
      role,
    });
  } catch (error) {
    console.error("LiveKit token generation error:", error);

    return NextResponse.json(
      { error: "Unable to generate LiveKit access token." },
      { status: 500 }
    );
  }
}