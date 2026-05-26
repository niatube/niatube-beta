 "use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

const MAX_VIDEO_SIZE = 1024 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = ["video/mp4"];
const ALLOWED_THUMBNAIL_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function NiaCircleUploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creator, setCreator] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [duration, setDuration] = useState<number | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [uploadedTitle, setUploadedTitle] = useState("");
  const [uploadedVideoId, setUploadedVideoId] = useState("");
  const [error, setError] = useState("");

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

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setError("Only MP4 videos are supported for NiaCircle uploads.");
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      setError("Video exceeds the 1GB upload limit.");
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

    try {
      setUploading(true);
      setUploadProgress(15);
      setUploadStage("Uploading NiaCircle video...");

      const bunnyFormData = new FormData();
      bunnyFormData.append("title", cleanTitle);
      bunnyFormData.append("file", videoFile);

      const bunnyRes = await fetch(
        "https://niatube-beta-production.up.railway.app/upload",
        {
          method: "POST",
          body: bunnyFormData,
        }
      );

      let bunnyData: any = null;

      try {
        bunnyData = await bunnyRes.json();
      } catch {
        bunnyData = null;
      }

      if (!bunnyRes.ok) {
        console.error("Bunny upload failed:", bunnyData);
        setError(
          bunnyData?.error
            ? `${bunnyData.error} ${bunnyData.details || ""}`
            : "Video upload failed. Please try again."
        );
        return;
      }

      const bunnyEmbedUrl = bunnyData?.embedUrl || bunnyData?.embed_url;

      if (!bunnyEmbedUrl) {
        setError("Video uploaded, but Bunny did not return a playable URL.");
        return;
      }

      setUploadProgress(70);
      setUploadStage("Uploading thumbnail...");

      const thumbExt = thumbnailFile.name.split(".").pop() || "jpg";
      const thumbFileName = `${Date.now()}-niacircle-thumbnail.${thumbExt}`;
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

      const { data: thumbnailPublicData } = supabase.storage
        .from("videos")
        .getPublicUrl(thumbnailPath);

      const thumbnailUrl =
        thumbnailPublicData?.publicUrl || "/default-thumbnail.jpg";

      setUploadProgress(85);
      setUploadStage("Saving NiaCircle video...");

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
          category: "niacircle",
          duration_seconds: duration,
          status: "published",
          is_live: false,
        }),
      });

      const metadataData = await metadataRes.json();

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
      setUploadStage("NiaCircle upload complete.");
      setSubmitted(true);

      setTitle("");
      setDescription("");
      setVideoFile(null);
      setThumbnailFile(null);
      setVideoPreview("");
      setThumbnailPreview("");
      setDuration(null);
    } catch (err: any) {
      console.error("NiaCircle upload failed:", err);
      setError(err?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 py-14">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="mb-3 text-sm font-black uppercase text-yellow-600">
            NiaCircle
          </p>

          <h1 className="text-4xl font-black text-gray-900">
            Upload Exclusive Content
          </h1>

          <p className="mt-4 text-gray-700">
            Upload premium creator content for the NiaCircle community.
          </p>

          <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <p className="font-semibold text-gray-900">Recommended Format</p>
            <p className="mt-1 text-sm text-gray-700">
              .mp4 · H.264 · AAC · 720p/1080p · Max 1GB · Bunny embed supported
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <input
              type="text"
              placeholder="Video Title"
              value={title}
              disabled={uploading}
              onChange={(e) => {
                clearErrorAndSuccess();
                setTitle(e.target.value);
              }}
              className="w-full rounded-xl border px-4 py-3 disabled:bg-gray-100"
            />

            <textarea
              placeholder="Briefly describe this NiaCircle video..."
              value={description}
              disabled={uploading}
              onChange={(e) => {
                clearErrorAndSuccess();
                setDescription(e.target.value);
              }}
              className="min-h-[100px] w-full rounded-xl border px-4 py-3 disabled:bg-gray-100"
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
              className="w-full rounded-xl border px-4 py-3 disabled:bg-gray-100"
            />

            <div>
              <label className="mb-1 block font-semibold">Video File</label>
              <input
                type="file"
                accept="video/mp4"
                disabled={uploading}
                onChange={(e) =>
                  handleVideoSelect(e.target.files?.[0] || null)
                }
                className="w-full rounded-xl border px-4 py-3 disabled:bg-gray-100"
              />
            </div>

            {videoPreview && (
              <video
                src={videoPreview}
                controls
                className="aspect-video w-full rounded-2xl bg-black"
              />
            )}

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
                className="w-full rounded-xl border px-4 py-3 disabled:bg-gray-100"
              />
            </div>

            {thumbnailPreview && (
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="h-48 w-full rounded-2xl object-cover"
              />
            )}

            {uploading && (
              <div className="rounded-xl bg-gray-100 p-4">
                <p className="text-sm font-bold text-gray-700">
                  {uploadStage}
                </p>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-300">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">
                {error}
              </p>
            )}

            {submitted && (
              <div className="rounded-xl bg-green-50 p-4 text-sm font-bold text-green-700">
                NiaCircle video uploaded successfully: {uploadedTitle}
                {uploadedVideoId && (
                  <a
                    href={`/watch/${uploadedVideoId}`}
                    className="mt-2 block underline"
                  >
                    Watch uploaded video
                  </a>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full rounded-xl bg-black px-6 py-3 text-sm font-black text-white hover:bg-gray-800 disabled:bg-gray-400"
            >
              {uploading ? "Uploading..." : "Upload to NiaCircle"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}