"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

type Video = {
  id: string;
  title: string;
  creator: string;
  thumbnail_url?: string;
  image?: string;
  views?: number;
  likes?: number;
  trending_score?: number;
};

export default function TrendingPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrending() {
      const res = await fetch("/api/uploads");
      const data = await res.json();

      setVideos(Array.isArray(data.uploads) ? data.uploads : []);
      setLoading(false);
    }

    loadTrending();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-4xl font-black text-gray-900">
          Trending on NiaTube
        </h1>

        <p className="mt-2 text-gray-600">
          Videos gaining momentum through views, likes, and freshness.
        </p>

        {loading ? (
          <p className="mt-8 text-gray-500">Loading trending videos...</p>
        ) : videos.length === 0 ? (
          <p className="mt-8 text-gray-500">No trending videos yet.</p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {videos.map((video, index) => (
              <a
                key={video.id}
                href={`/watch/${video.id}`}
                className="overflow-hidden rounded-3xl bg-white shadow-sm hover:shadow-md"
              >
                <div className="relative">
                  <img
                    src={
                      video.thumbnail_url ||
                      video.image ||
                      "/default-thumbnail.jpg"
                    }
                    alt={video.title}
                    className="h-52 w-full object-cover"
                  />

                  <span className="absolute left-4 top-4 rounded-full bg-yellow-400 px-4 py-1 text-sm font-black text-black">
                    #{index + 1} Trending
                  </span>
                </div>

                <div className="p-5">
                  <h2 className="line-clamp-2 text-xl font-black text-gray-900">
                    {video.title}
                  </h2>

                  <p className="mt-2 text-sm font-semibold text-gray-600">
                    {video.creator}
                  </p>

                  <p className="mt-3 text-sm text-gray-500">
                    {video.views || 0} views • {video.likes || 0} likes
                  </p>

                  <p className="mt-2 text-xs font-bold text-yellow-700">
                    Trending Score: {Math.round(Number(video.trending_score || 0))}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}