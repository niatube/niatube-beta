"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import Navbar from "@/components/Navbar";


export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creator, setCreator] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

const [videoPreview, setVideoPreview] = useState("");
const [thumbnailPreview, setThumbnailPreview] = useState("");

  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadedTitle, setUploadedTitle] = useState("");
  const [error, setError] = useState("");
  const [category, setCategory] = useState("culture");
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    async function loadCreatorName() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("creator_profiles")
        .select("creator_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.creator_name) {
        setCreator(profile.creator_name);
      } else if (user.email) {
        setCreator(user.email.split("@")[0].replace(/[._-]/g, " "));
      }
    }

    loadCreatorName();
  }, []);

  function handleVideoMetadata(file: File) {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      setDuration(Math.floor(video.duration));
    };

    video.src = URL.createObjectURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSubmitted(false);

    if (!title || !creator || !videoFile || !thumbnailFile) {
      setError("Please fill all fields and upload a thumbnail.");
      return;
    }
    <textarea
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  className="mt-3 min-h-[90px] w-full rounded-lg border px-3 py-2 text-sm"
  placeholder="Briefly describe your video..."
/>

    if (videoFile.type !== "video/mp4") {
      setError("Only MP4 videos are supported for beta.");
      return;
    }

    const maxSize = 500 * 1024 * 1024;

    if (videoFile.size > maxSize) {
      setError("Video exceeds 500MB beta upload limit.");
      return;
    }

    try {
      setUploading(true);

      const videoExt = videoFile.name.split(".").pop();
      const videoFileName = `${Date.now()}-video.${videoExt}`;
      const videoPath = `uploads/${videoFileName}`;

      const { error: videoUploadError } = await supabase.storage
        .from("videos")
        .upload(videoPath, videoFile);

      if (videoUploadError) throw videoUploadError;

      const { data: videoPublicData } = supabase.storage
        .from("videos")
        .getPublicUrl(videoPath);

      const videoUrl = videoPublicData.publicUrl;

      const thumbExt = thumbnailFile.name.split(".").pop();
      const thumbFileName = `${Date.now()}-thumbnail.${thumbExt}`;
      const thumbnailPath = `thumbnails/${thumbFileName}`;

      const { error: thumbnailUploadError } = await supabase.storage
        .from("videos")
        .upload(thumbnailPath, thumbnailFile);

      if (thumbnailUploadError) throw thumbnailUploadError;

      const { data: thumbnailPublicData } = supabase.storage
        .from("videos")
        .getPublicUrl(thumbnailPath);

      const thumbnailUrl = thumbnailPublicData.publicUrl;

      const metadataRes = await fetch("/api/uploads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          creator,
          description: description.trim(),
          thumbnail_url: thumbnailUrl,
          video_url: videoUrl,
          category,
          duration_seconds: duration,
          status: "published",
        }),
      });

      const metadataData = await metadataRes.json();

      if (!metadataRes.ok) {
        console.error("Metadata save failed:", metadataData);
        setError(
          metadataData.error || "Video uploaded, but metadata save failed."
        );
        return;
      }

      setUploadedTitle(title);
      setSubmitted(true);

      setTitle("");
      setVideoFile(null);
      setThumbnailFile(null);
      setDuration(null);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(err.message || "Upload failed. Check console.");
    } finally {
      setUploading(false);
    }
  }

  return (
  <>
    <Navbar />
    <main className="min-h-screen bg-[#f7f7f2] px-6 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-4 text-2xl font-bold">Upload Video</h1>

        <div className="mb-6 rounded border bg-yellow-50 p-4">
          <p className="font-semibold">Recommended Format</p>
          <p className="text-sm text-gray-600">
            .mp4 · H.264 · AAC · 720p/1080p · 24–30fps
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Video Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border p-3"
          />
          <textarea
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  className="mt-3 min-h-[90px] w-full rounded-lg border px-3 py-2 text-sm"
  placeholder="Briefly describe your video..."
/>

          <input
            type="text"
            placeholder="Creator Name"
            value={creator}
            onChange={(e) => setCreator(e.target.value)}
            className="w-full rounded border p-3"
          />

          <label className="block">
            <span className="text-sm font-semibold text-gray-700">
              Category
            </span>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"
            >
             <option value="culture">Culture</option>
             <option value="history">History</option>
             <option value="music">Music</option>
             <option value="news">News</option>
             <option value="trending">Trending</option>
             <option value="live">Live</option>
             <option value="shorts">Shorts</option>
             <option value="niacircle">NiaCircle</option>
             <option value="vlogs">Vlogs</option>
            </select>
          </label>

          <div>
            <label className="mb-1 block font-semibold">Video File</label>
            <input
              type="file"
              accept="video/mp4"
              onChange={(e) => {
  const file = e.target.files?.[0] || null;

  setVideoFile(file);

  if (file) {
    setVideoPreview(URL.createObjectURL(file));
  }
}}
              className="w-full rounded border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold">Thumbnail Image</label>
            <input
              type="file"
             onChange={(e) => {
  const file = e.target.files?.[0] || null;

  setThumbnailFile(file);

  if (file) {
    setThumbnailPreview(URL.createObjectURL(file));
  }
}}
              className="w-full rounded border p-3"
            />
          </div>
          <div className="mt-6 rounded-2xl bg-gray-50 p-4">
  <h2 className="text-lg font-bold text-gray-900">
    Upload Preview
  </h2>

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

    {description && (
      <p className="mt-2 text-sm text-gray-700">
        {description}
      </p>
    )}
  </div>
</div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full rounded bg-black p-3 font-bold text-white disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {submitted && (
          <div className="mt-4 rounded border bg-green-100 p-4">
            Uploaded: <strong>{uploadedTitle}</strong>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded border bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}
      </div>
       </main>
  </>
);
}