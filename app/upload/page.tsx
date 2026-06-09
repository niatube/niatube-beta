"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import Navbar from "@/components/Navbar";

const MAX_VIDEO_SIZE = 10 * 1024 * 1024 * 1024; // 10GB
const ALLOWED_THUMBNAIL_TYPES = ["image/jpeg", "image/png", "image/webp"];

function encodeMetadata(value: string) {
  return btoa(unescape(encodeURIComponent(value)));
}

function isMp4Video(file: File) {
  return file.type === "video/mp4" || file.name.toLowerCase().endsWith(".mp4");
}

async function uploadVideoToBunnyTus({
  file,
  title,
  tusEndpoint,
  libraryId,
  videoId,
  signature,
  expirationTime,
  onProgress,
}: {
  file: File;
  title: string;
  tusEndpoint: string;
  libraryId: string | number;
  videoId: string;
  signature: string;
  expirationTime: string | number;
  onProgress: (progress: number) => void;
}) {
  const authHeaders = {
    AuthorizationSignature: signature,
    AuthorizationExpire: String(expirationTime),
    VideoId: videoId,
    LibraryId: String(libraryId),
  };

  const createUploadRes = await fetch(tusEndpoint, {
    method: "POST",
    headers: {
      "Tus-Resumable": "1.0.0",
      "Upload-Length": String(file.size),
      "Upload-Metadata": `filename ${encodeMetadata(file.name)},filetype ${encodeMetadata(
        file.type || "video/mp4"
      )},title ${encodeMetadata(title)}`,
      ...authHeaders,
    },
  });

  if (!createUploadRes.ok) {
    throw new Error("Could not start Bunny video upload.");
  }

 const uploadLocation = createUploadRes.headers.get("Location");

if (!uploadLocation) {
  throw new Error("Bunny did not return an upload location.");
}

const uploadUrl = new URL(uploadLocation, tusEndpoint).toString();

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PATCH", uploadUrl);

    xhr.setRequestHeader("Tus-Resumable", "1.0.0");
    xhr.setRequestHeader("Upload-Offset", "0");
    xhr.setRequestHeader("Content-Type", "application/offset+octet-stream");
    xhr.setRequestHeader("AuthorizationSignature", signature);
    xhr.setRequestHeader("AuthorizationExpire", String(expirationTime));
    xhr.setRequestHeader("VideoId", videoId);
    xhr.setRequestHeader("LibraryId", String(libraryId));

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 60);
        onProgress(15 + percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
    reject(
  new Error(
    `Bunny video upload failed. Status: ${xhr.status}. Response: ${xhr.responseText}`
  )
);
      }
    };

    xhr.onerror = () => reject(new Error("Network error during Bunny upload."));

    xhr.send(file);
  });
}

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creator, setCreator] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [uploadedTitle, setUploadedTitle] = useState("");
  const [error, setError] = useState("");
  const [category, setCategory] = useState("culture");
  const [duration, setDuration] = useState<number | null>(null);
  const [uploadedVideoId, setUploadedVideoId] = useState("");

  useEffect(() => {
    async function loadCreatorName() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("creator_profiles")
        .select("creator_name")
        .eq("email", user.email)
        .maybeSingle();

      if (profile?.creator_name) {
        setCreator(profile.creator_name);
      } else if (user.email) {
        setCreator(user.email.split("@")[0].replace(/[._-]/g, " "));
      }
    }

    loadCreatorName();
  }, []);

  function clearErrorAndSuccess() {
    setError("");
    setSubmitted(false);
  }

  function handleVideoMetadata(file: File) {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      setDuration(Math.floor(video.duration));
    };

    video.onerror = () => {
      setDuration(null);
      setError("Could not read video duration. Please try another MP4 file.");
    };

    video.src = URL.createObjectURL(file);
  }

  function handleVideoSelect(file: File | null) {
    clearErrorAndSuccess();

    setVideoFile(null);
    setVideoPreview("");
    setDuration(null);

    if (!file) return;

    if (!isMp4Video(file)) {
      setError("Please choose an MP4 video file.");
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      setError("Video exceeds the 5GB upload limit.");
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    handleVideoMetadata(file);
  }

  function handleThumbnailSelect(file: File | null) {
    clearErrorAndSuccess();

    setThumbnailFile(null);
    setThumbnailPreview("");

    if (!file) return;

    if (!ALLOWED_THUMBNAIL_TYPES.includes(file.type)) {
      setError("Thumbnail must be JPG, PNG, or WebP.");
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (uploading) return;

    setError("");
    setSubmitted(false);

    const cleanTitle = title.trim();
    const cleanCreator = creator.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle) {
      setError("Please enter a video title.");
      return;
    }

    if (!cleanCreator) {
      setError("Please enter a creator name.");
      return;
    }

    if (!videoFile) {
      setError("Please choose an MP4 video file.");
      return;
    }

    if (!thumbnailFile) {
      setError("Please upload a thumbnail image.");
      return;
    }

    if (!isMp4Video(videoFile)) {
      setError("Only MP4 videos are supported for beta.");
      return;
    }

    if (videoFile.size > MAX_VIDEO_SIZE) {
      setError("Video exceeds the 5GB upload limit.");
      return;
    }

    if (!ALLOWED_THUMBNAIL_TYPES.includes(thumbnailFile.type)) {
      setError("Thumbnail must be JPG, PNG, or WebP.");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(5);
      setUploadStage("Creating Bunny video...");

      const bunnyCreateRes = await fetch("/api/bunny/create-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: cleanTitle,
        }),
      });

      const bunnyData = await bunnyCreateRes.json();

      if (!bunnyCreateRes.ok || !bunnyData?.success) {
        console.error("Bunny create video failed:", bunnyData);
        setError(
          bunnyData?.error ||
            "Could not create Bunny video. Please check the Bunny API route."
        );
        return;
      }

      setUploadProgress(15);
      setUploadStage("Uploading video to Bunny...");

      await uploadVideoToBunnyTus({
        file: videoFile,
        title: cleanTitle,
        tusEndpoint: bunnyData.tusEndpoint,
        libraryId: bunnyData.libraryId,
        videoId: bunnyData.videoId,
        signature: bunnyData.signature,
        expirationTime: bunnyData.expirationTime,
        onProgress: setUploadProgress,
      });

      const bunnyEmbedUrl =
        bunnyData.embedUrl ||
        `https://iframe.mediadelivery.net/embed/${bunnyData.libraryId}/${bunnyData.videoId}`;

      setUploadProgress(78);
      setUploadStage("Uploading thumbnail...");

      const thumbExt = thumbnailFile.name.split(".").pop() || "jpg";
      const thumbFileName = `${Date.now()}-thumbnail.${thumbExt}`;
      const thumbnailPath = `thumbnails/${thumbFileName}`;

      const { error: thumbnailUploadError } = await supabase.storage
        .from("videos")
        .upload(thumbnailPath, thumbnailFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (thumbnailUploadError) {
        console.error("Thumbnail upload failed:", thumbnailUploadError);
        setError("Thumbnail upload failed. Please try another image.");
        return;
      }

      setUploadProgress(88);
      setUploadStage("Saving video to NiaTube...");

      const { data: thumbnailPublicData } = supabase.storage
        .from("videos")
        .getPublicUrl(thumbnailPath);

      const thumbnailUrl =
        thumbnailPublicData?.publicUrl || "/default-thumbnail.jpg";

      const metadataRes = await fetch("/api/uploads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: cleanTitle,
          creator: cleanCreator,
          description: cleanDescription,
          thumbnail_url: thumbnailUrl,
          video_url: bunnyEmbedUrl,
          category,
          duration_seconds: duration,
          status: "processing",
           bunny_video_id: bunnyData.videoId,
            is_live: false,
        }),
      });

      let metadataData: any = null;

      try {
        metadataData = await metadataRes.json();
      } catch {
        metadataData = null;
      }

      if (!metadataRes.ok) {
        console.error("Metadata save failed:", metadataData);

        setError(
          metadataData?.error ||
            "Video uploaded, but metadata save failed. Please check the uploads API."
        );

        return;
      }

      setUploadedTitle(cleanTitle);
      setUploadedVideoId(metadataData?.upload?.id || metadataData?.id || "");
      setUploadProgress(100);
      setUploadStage("Upload complete.");
      setSubmitted(true);

      setTitle("");
      setDescription("");
      setVideoFile(null);
      setThumbnailFile(null);
      setVideoPreview("");
      setDuration(null);
      setCategory("culture");
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(err?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f7f2] px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-5 shadow sm:p-8">
          <h1 className="mb-2 text-2xl font-bold">Upload Video</h1>

          <p className="mb-6 text-sm text-gray-600">
            Upload your video for NiaTube beta. Videos appear after the upload
            completes successfully.
          </p>

          <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <p className="font-semibold text-gray-900">Recommended Format</p>
           
           <p className="mt-1 text-sm text-gray-700">
  .mp4 · H.264 · AAC · 720p/1080p · 24–30fps · Max 10GB
</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Video Title"
              value={title}
              disabled={uploading}
              onChange={(e) => {
                clearErrorAndSuccess();
                setTitle(e.target.value);
              }}
              className="w-full rounded-xl border border-gray-300 p-3 disabled:bg-gray-100"
            />

            <textarea
              value={description}
              disabled={uploading}
              onChange={(e) => {
                clearErrorAndSuccess();
                setDescription(e.target.value);
              }}
              className="min-h-[90px] w-full rounded-xl border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
              placeholder="Briefly describe your video..."
            />

            <input
              type="text"
              placeholder="Creator Name"
              value={creator}
              disabled={uploading}
              onChange={(e) => {
                clearErrorAndSuccess();
                setCreator(e.target.value);
              }}
              className="w-full rounded-xl border border-gray-300 p-3 disabled:bg-gray-100"
            />

            <label className="block">
              <span className="text-sm font-semibold text-gray-700">
                Category
              </span>

              <select
                value={category}
                disabled={uploading}
                onChange={(e) => {
                  clearErrorAndSuccess();
                  setCategory(e.target.value);
                }}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 disabled:bg-gray-100"
              >
                <option value="culture">Culture</option>
                <option value="history">History</option>
                <option value="music">Music</option>
                <option value="afrobeats">Afrobeats</option>
                <option value="news">News</option>
                <option value="trending">Trending</option>
                <option value="live">Live</option>
                <option value="shorts">Shorts</option>
                <option value="vlogs">Vlogs</option>
                <option value="podcast">Podcast</option>
                <option value="education">Education</option>
                <option value="business">Business</option>
                <option value="sport">Sport</option>
                <option value="travel">Travel</option>
                <option value="film">Film</option>
              </select>
            </label>

            <div>
              <label className="mb-1 block font-semibold">Video File</label>
              <input
                type="file"
                accept="video/mp4"
                disabled={uploading}
                onChange={(e) =>
                  handleVideoSelect(e.target.files?.[0] || null)
                }
                className="w-full rounded-xl border border-gray-300 p-3 disabled:bg-gray-100"
              />

              <p className="mt-1 text-xs text-gray-500">
  MP4 only. Maximum file size: 10GB.
</p>
            </div>

            <div>
              <label className="mb-1 block font-semibold">
                Thumbnail Image
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading}
                onChange={(e) =>
                  handleThumbnailSelect(e.target.files?.[0] || null)
                }
                className="w-full rounded-xl border border-gray-300 p-3 disabled:bg-gray-100"
              />

              <p className="mt-1 text-xs text-gray-500">
                JPG, PNG, or WebP recommended.
              </p>
            </div>

            <div className="mt-6 rounded-2xl bg-gray-50 p-4">
              <h2 className="text-lg font-bold text-gray-900">
                Upload Preview
              </h2>

              {!thumbnailPreview && !videoPreview && (
                <div className="mt-4 flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm text-gray-500">
                  Preview will appear here after you choose files.
                </div>
              )}

              {thumbnailPreview && (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="mt-4 h-48 w-full rounded-xl object-cover"
                />
              )}

              {videoPreview && (
                <video
                  src={videoPreview}
                  controls
                  className="mt-4 aspect-video w-full rounded-xl bg-black"
                />
              )}

              <div className="mt-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {title || "Video title preview"}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {creator || "Creator name preview"}
                  {duration
                    ? ` • ${Math.floor(duration / 60)}m ${duration % 60}s`
                    : ""}
                </p>

                {description && (
                  <p className="mt-2 text-sm text-gray-700">{description}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full rounded-xl bg-black p-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {uploading ? "Uploading... Please do not refresh" : "Upload"}
            </button>

            {uploading && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="mb-2 flex items-center justify-between text-sm font-bold text-blue-800">
                  <span>{uploadStage || "Uploading..."}</span>
                  <span>{uploadProgress}%</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-blue-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>

                <p className="mt-2 text-xs text-blue-700">
                  Please keep this page open while your video uploads.
                </p>
              </div>
            )}

            {submitted && (
              <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-2xl">✅</div>

                  <div className="flex-1">
                    <h3 className="text-lg font-black text-green-800">
                      Your video was uploaded successfully. It may take just a
                      few minutes to finish processing before playback becomes
                      available.
                    </h3>

                    <p className="mt-1 text-sm text-green-700">
                      Your video <strong>{uploadedTitle}</strong> is now live on
                      NiaTube.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <a
                        href={uploadedVideoId ? `/watch/${uploadedVideoId}` : "/"}
                        className="rounded-xl bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
                      >
                        Watch Video
                      </a>

                      <a
                        href="/creator-dashboard"
                        className="rounded-xl border border-green-700 px-4 py-2 text-sm font-bold text-green-800 hover:bg-green-100"
                      >
                        Go to Creator Dashboard
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}
          </form>
        </div>
      </main>
    </>
  );
}