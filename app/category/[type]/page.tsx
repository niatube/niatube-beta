"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";

type CategoryVideo = {
  id: string;
  title: string;
  creator: string;
  description?: string;
  thumbnail_url?: string;
  views?: number;
  likes?: number;
  created_at?: string;
  category?: string;
};

function formatCategoryName(category: string) {
  return category
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function CategoryPage() {
  const params = useParams();
  const category = params?.type as string;

  const [videos, setVideos] = useState<CategoryVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const displayName = formatCategoryName(category || "category");

  useEffect(() => {
    async function loadCategoryVideos() {
      setLoading(true);

      const res = await fetch(`/api/uploads?all=true&ts=${Date.now()}`, {
        cache: "no-store",
      });

      const result = await res.json();

      const filteredVideos = Array.isArray(result.uploads)
        ? result.uploads.filter(
            (video: any) =>
              String(video.category || "").toLowerCase() ===
              String(category || "").toLowerCase()
          )
        : [];

      setVideos(filteredVideos as CategoryVideo[]);
      setLoading(false);
    }

    if (category) {
      loadCategoryVideos();
    }
  }, [category]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-yellow-600">
            NiaTube Category
          </p>

          <h1 className="mt-2 text-5xl font-black text-gray-900">
            {displayName} Library
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-gray-700">
            Explore published creator videos in the {displayName} category.
          </p>
        </div>

        {loading ? (
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            Loading {displayName} videos...
          </div>
        ) : videos.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-gray-600">
              No {displayName} videos uploaded yet.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => (
              <Link
                key={video.id}
                href={`/watch/${video.id}`}
                className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <img
                  src={video.thumbnail_url || "/default-thumbnail.jpg"}
                  alt={video.title}
                  className="h-52 w-full object-cover"
                />

                <div className="p-5">
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700">
                    {displayName}
                  </span>

                  <h2 className="mt-4 line-clamp-2 text-xl font-black text-gray-900">
                    {video.title}
                  </h2>

                  <p className="mt-2 text-sm font-semibold text-gray-600">
                    {video.creator}
                  </p>

                  {video.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                      {video.description}
                    </p>
                  )}

                  <p className="mt-4 text-sm text-gray-500">
                    {video.views || 0} views • {video.likes || 0} likes
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}