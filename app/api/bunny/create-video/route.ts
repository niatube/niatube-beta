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
    const title = body.title;

    if (!title) {
      return NextResponse.json(
        { error: "Video title is required." },
        { status: 400 }
      );
    }

    const createRes = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      {
        method: "POST",
        headers: {
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

    return NextResponse.json({
      success: true,
      libraryId,
      videoId: createdVideo.guid,
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