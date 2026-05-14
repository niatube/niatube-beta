"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Upload = {
  id: string;
  title: string;
  creator: string;
  thumbnail_url?: string;
  video_url?: string;
  status?: string;
  category?: string;
  views?: number;
  duration_seconds?: number;
  created_at?: string;
};

function formatViews(views?: number) {
  if (!views) return "0 views";
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
  return `${views} views`;
}

function isNewVideo(createdAt?: string) {
  if (!createdAt) return false;

  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  return now - created < sevenDays;
}

function formatDuration(seconds?: number) {
  if (!seconds) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function CategoryPage() {
  const params = useParams();
  const type = String(params?.type || "").toLowerCase();

  const [videos, setVideos] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVideos() {
      try {
        const res = await fetch("/api/uploads?all=true", {
          cache: "no-store",
        });

        const data = await res.json();

        const filtered = (data.uploads || data || []).filter((video: Upload) => {
          return (
            video.status === "published" &&
            video.category?.toLowerCase() === type
          );
        });

        setVideos(filtered);
      } catch (error) {
        console.error("Failed to load category videos:", error);
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
  }, [type]);

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold capitalize text-gray-900">
          {type}
        </h1>

        <p className="mt-2 text-gray-600">Videos in the {type} category</p>

        {loading && <p className="mt-8 text-gray-500">Loading videos...</p>}

        {!loading && videos.length === 0 && (
          <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold">No videos yet</h2>
            <p className="mt-2 text-gray-600">
              Once creators upload videos in this category, they will appear here.
            </p>
          </div>
        )}

        {!loading && videos.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <Link
                key={video.id}
                href={`/watch/${video.id}`}
                className="group block"
              >
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:shadow-lg">
                  <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                    <img
                      src={
                        video.thumbnail_url?.trim()
                          ? video.thumbnail_url
                          : "/default-thumbnail.jpg"
                      }
                      alt={video.title}
                      className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                      onError={(e) => {
                        e.currentTarget.src = "/default-thumbnail.jpg";
                      }}
                    />

                    {video.video_url && (
                      <video
                        src={video.video_url}
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => e.currentTarget.pause()}
                      />
                    )}

                    <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
                      {formatDuration(video.duration_seconds)}
                    </div>

                    {isNewVideo(video.created_at) && (
                      <div className="absolute left-2 top-2 rounded bg-yellow-500 px-2 py-1 text-xs font-semibold text-black">
                        NEW
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h2 className="line-clamp-2 text-lg font-semibold text-gray-900 group-hover:text-yellow-600">
                      {video.title}
                    </h2>

                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-xs font-bold text-white">
                        {video.creator?.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex items-center gap-1">
                        <p className="text-sm text-gray-600">
                          {video.creator}
                        </p>

                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                          ✓
                        </span>
                      </div>
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      {formatViews(video.views)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}