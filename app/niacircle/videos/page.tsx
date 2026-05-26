 
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

type NiaCircleVideo = {
  id: string;
  title: string;
  creator: string;
  description?: string;
  thumbnail_url?: string;
  video_url?: string;
  views?: number;
  likes?: number;
  created_at?: string;
};

export default function NiaCircleVideosPage() {
  const [videos, setVideos] = useState<NiaCircleVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVideos() {
      setLoading(true);

      const { data, error } = await supabase
        .from("uploads")
        .select("*")
        .eq("category", "niacircle")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("NiaCircle videos load error:", error);
        setVideos([]);
        setLoading(false);
        return;
      }

      setVideos((data || []) as NiaCircleVideo[]);
      setLoading(false);
    }

    loadVideos();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="mb-3 text-sm font-black uppercase text-yellow-600">
            Explore NiaCircle Videos
          </p>

          <h1 className="text-5xl font-black text-gray-900">
            NiaCircle Video Library
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-gray-700">
            Exclusive creator content uploaded for the NiaCircle community.
          </p>

          <div className="mt-6">
            <Link
              href="/niacircle/upload"
              className="inline-block rounded-xl bg-black px-5 py-3 text-sm font-black text-white hover:bg-gray-800"
            >
              Upload NiaCircle Video
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            Loading NiaCircle videos...
          </div>
        ) : videos.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-gray-600">
              No NiaCircle videos uploaded yet.
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
                    NiaCircle Exclusive
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