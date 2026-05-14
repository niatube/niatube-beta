"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";

type UploadItem = {
  id: string;
  title: string;
  creator: string;
  thumbnail_url: string | null;
  status?: string;
};

function DiscoverContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [videos, setVideos] = useState<UploadItem[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/uploads?all=true", {
          cache: "no-store",
        });

        const data = await res.json();
        setVideos(data.uploads || []);
      } catch (error) {
        console.error("Failed to load discover videos:", error);
      }
    };

    fetchVideos();
  }, []);

  const filteredVideos = videos.filter((video) => {
    const searchText = `${video.title} ${video.creator}`.toLowerCase();

    return searchText.includes(query.toLowerCase());
  });

  const displayVideos = query ? filteredVideos : videos;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f6f6f6] p-6">
        <h1 className="mb-2 text-4xl font-extrabold">
          Discover Videos
        </h1>

        {query && (
          <p className="mb-6 text-gray-600">
            Search results for:{" "}
            <span className="font-bold">{query}</span>
          </p>
        )}

        {displayVideos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900">
              No videos found
            </h2>

            <p className="mt-2 text-gray-600">
              Try searching by video title or creator name.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {displayVideos.map((video) => (
              <a
                key={video.id}
                href={`/watch/${video.id}`}
                className="block overflow-hidden rounded-xl bg-white shadow hover:shadow-lg"
              >
                <img
                  src={video.thumbnail_url || "/default-thumbnail.jpg"}
                  onError={(e) => {
                    e.currentTarget.src = "/default-thumbnail.jpg";
                  }}
                  className="h-48 w-full object-cover"
                  alt={video.title}
                />

                <div className="p-4">
                  <h3 className="line-clamp-2 text-lg font-bold">
                    {video.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-600">
                    {video.creator}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading discover...</div>}>
      <DiscoverContent />
    </Suspense>
  );
}