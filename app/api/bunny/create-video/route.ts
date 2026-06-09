import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    const apiKey = process.env.BUNNY_STREAM_API_KEY;

    if (!libraryId || !apiKey) {
      return NextResponse.json(
        { error: "Missing Bunny environment variables." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const title = body.title || "Untitled Video";

    const createRes = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          AccessKey: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      }
    );

    const createText = await createRes.text();

    if (!createRes.ok) {
      return NextResponse.json(
        {
          error: "Bunny create video failed.",
          details: createText,
        },
        { status: 500 }
      );
    }

    const createdVideo = JSON.parse(createText);
    const videoId = createdVideo.guid;

    if (!videoId) {
      return NextResponse.json(
        { error: "Bunny did not return a video ID." },
        { status: 500 }
      );
    }

    const expirationTime = Math.floor(Date.now() / 1000) + 86400;

    const signature = createHash("sha256")
      .update(`${libraryId}${apiKey}${expirationTime}${videoId}`)
      .digest("hex");

    return NextResponse.json({
      success: true,
      libraryId,
      videoId,
      expirationTime,
      signature,
      tusEndpoint: "https://video.bunnycdn.com/tusupload",
      embedUrl: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`,
      playbackUrl: `https://iframe.mediadelivery.net/play/${libraryId}/${videoId}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to create Bunny upload session.",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}