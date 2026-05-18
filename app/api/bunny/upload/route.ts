import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    bunnyLibraryIdPresent: Boolean(process.env.BUNNY_STREAM_LIBRARY_ID),
    bunnyApiKeyPresent: Boolean(process.env.BUNNY_STREAM_API_KEY),
  });
}

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

    const formData = await req.formData();
    const title = String(formData.get("title") || "");
    const file = formData.get("file") as File | null;

    if (!title || !file) {
      return NextResponse.json(
        { error: "Title and video file are required." },
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
          status: createRes.status,
          details: createText,
        },
        { status: 500 }
      );
    }

    const createdVideo = JSON.parse(createText);
    const videoId = createdVideo.guid;

    if (!videoId) {
      return NextResponse.json(
        {
          error: "Bunny did not return a video ID.",
          details: createdVideo,
        },
        { status: 500 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();

    const uploadRes = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      {
        method: "PUT",
        headers: {
          AccessKey: apiKey,
          "Content-Type": "application/octet-stream",
        },
        body: Buffer.from(arrayBuffer),
      }
    );

    const uploadText = await uploadRes.text();

    if (!uploadRes.ok) {
      return NextResponse.json(
        {
          error: "Bunny video file upload failed.",
          status: uploadRes.status,
          details: uploadText,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bunny_video_id: videoId,
      playback_url: `https://iframe.mediadelivery.net/play/${libraryId}/${videoId}`,
      embed_url: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to upload video to Bunny.",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}