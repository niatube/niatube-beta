"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

type SportsVideo = {
  id: string;
  title: string;
  creator: string;
  thumbnail_url: string | null;
  views?: number | null;
  likes?: number | null;
  status?: string | null;
  created_at?: string | null;
};

export default function SportsCategoryPage() {
  const [videos, setVideos] = useState<SportsVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSportsVideos() {
      const { data, error } = await supabase
        .from("uploads")
        .select(
          "id, title, creator, thumbnail_url, views, likes, status, created_at"
        )
        .eq("category", "sports")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Sports category error:", error);
        setVideos([]);
        setLoading(false);
        return;
      }

      setVideos((data || []) as SportsVideo[]);
      setLoading(false);
    }

    loadSportsVideos();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl bg-gradient-to-r from-green-700 via-green-600 to-yellow-400 p-8 text-white shadow-sm">
          <p className="text-sm font-black uppercase tracking-widest text-yellow-100">
            NiaTube Sports
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Sports Across Africa and Beyond
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-green-50">
            Discover football, athletics, basketball, boxing, rugby,
            motorsport, tennis, wrestling, eSports, and creator-led sports
            coverage from across Africa and the global African diaspora.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-black text-gray-900">
            Latest Sports Videos
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            New sports stories, commentary, highlights, interviews, and
            analysis published by NiaTube creators.
          </p>
        </div>

        {loading ? (
          <p className="mt-6 text-gray-600">
            Loading sports videos...
          </p>
        ) : videos.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <h3 className="text-2xl font-black text-gray-900">
              Sports is ready for creators
            </h3>

            <p className="mx-auto mt-3 max-w-2xl leading-7 text-gray-600">
              No published sports videos are available yet. NiaTube creators
              can begin building this category by uploading sports stories,
              analysis, documentaries, interviews, and event coverage.
            </p>

            <Link
              href="/upload"
              className="mt-6 inline-block rounded-xl bg-black px-6 py-3 font-black text-white hover:bg-gray-800"
            >
              Upload a Sports Video
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <article
                key={video.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                <Link
                  href={`/watch/${video.id}`}
                  className="block h-52 overflow-hidden bg-gray-200"
                >
                  <img
                    src={
                      video.thumbnail_url || "/default-thumbnail.jpg"
                    }
                    alt={video.title}
                    onError={(event) => {
                      event.currentTarget.src =
                        "/default-thumbnail.jpg";
                    }}
                    className="h-full w-full object-cover"
                  />
                </Link>

                <div className="p-5">
                  <h3 className="line-clamp-2 text-lg font-black text-gray-900">
                    {video.title}
                  </h3>

                  <p className="mt-2 text-sm font-semibold text-gray-600">
                    {video.creator}
                  </p>

                  <div className="mt-3 flex gap-4 text-sm font-semibold text-gray-500">
                    <span>
                      👁️ {Number(video.views || 0).toLocaleString()}
                    </span>

                    <span>
                      👍 {Number(video.likes || 0).toLocaleString()}
                    </span>
                  </div>

                  <Link
                    href={`/watch/${video.id}`}
                    className="mt-4 inline-block rounded-lg bg-green-700 px-4 py-2 text-sm font-black text-white hover:bg-green-800"
                  >
                    Watch
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}