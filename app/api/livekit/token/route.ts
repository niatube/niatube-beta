import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TokenRequestBody = {
  roomName?: string;
  participantName?: string;
  role?: "creator" | "viewer";
};

export async function POST(request: Request) {
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