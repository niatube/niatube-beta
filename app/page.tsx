"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { fallbackVideos } from "../lib/fallbackVideos";

type UploadItem = {
  id: string;
  title: string;
  creator: string;
  thumbnail_url: string | null;
  video_url: string | null;
  status: string;
  created_at: string;
  language?: string;
  likes?: number | null;
  views?: number | null;
  is_live?: boolean | null;
};

export default function Home() {
  const [liveUploads, setLiveUploads] = useState<UploadItem[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("niatube_language");
    setSelectedLanguage(savedLanguage);

    async function fetchUploads() {
      try {
        const res = await fetch(`/api/uploads?all=true&ts=${Date.now()}`, {
          cache: "no-store",
        });

        const data = await res.json();
        setLiveUploads(Array.isArray(data.uploads) ? data.uploads : []);
      } catch (error) {
        console.error("Failed to fetch uploads", error);
        setLiveUploads([]);
      }
    }

    fetchUploads();
  }, []);

  const uploadedVideos = liveUploads
    .filter((item) => item.status === "published")
    .map((item) => ({
      id: item.id,
      title: item.title,
      creator: item.creator,
      views: item.views || 0,
      likes: item.likes || 0,
      language: item.language,
      image: item.thumbnail_url || "/default-thumbnail.jpg",
      created_at: item.created_at,
      is_live: item.is_live || false,
      isLiveUpload: true,
    }));

  const uniqueFallbackVideos = fallbackVideos.filter(
    (fallback) =>
      !uploadedVideos.some(
        (upload) =>
          upload.title === fallback.title && upload.creator === fallback.creator
      )
  );

  const fallbackWithStats = uniqueFallbackVideos.map(
    (item: any, index: number) => ({
      ...item,
      id:
        item.id ||
        item.title
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") ||
        `fallback-video-${index}`,
      views: item.views || 0,
      likes: item.likes || 0,
      image: item.image || item.thumbnail_url || "/default-thumbnail.jpg",
      is_live: item.is_live || false,
      isLiveUpload: false,
    })
  );

  const filteredVideos = [...uploadedVideos, ...fallbackWithStats].filter(
    (video) => {
      if (!selectedLanguage) return true;
      return video.language === selectedLanguage;
    }
  );

  const sortedVideos = [...filteredVideos].sort((a: any, b: any) => {
    if (a.is_live && !b.is_live) return -1;
    if (!a.is_live && b.is_live) return 1;

    if (a.isLiveUpload && !b.isLiveUpload) return -1;
    if (!a.isLiveUpload && b.isLiveUpload) return 1;

    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;

    return bTime - aTime;
  });

  const videos = sortedVideos.slice(0, 6);

  return (
    <main className="min-h-screen bg-[#f6f6f6] text-black">
      <Navbar />

      <section className="mx-auto max-w-[1400px] px-3 pb-2 pt-2 md:px-4 md:pt-0">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_320px]">
          <div>
            <div className="relative overflow-hidden rounded-[26px] bg-[#123ea8] shadow-sm">
              <img
                src="/hero-banner.png"
                alt="Pan-African storytelling banner"
                className="h-[560px] w-full object-cover object-center sm:h-[520px]"
              />

              <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0b2d93]/90 via-[#1450d3]/65 to-transparent" />

              <div className="absolute left-8 top-8 z-20 max-w-[560px] md:left-10 md:top-10">
                <div className="mb-5 inline-block rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-black">
                  PAN-AFRICAN VIDEO PLATFORM
                </div>

                <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
                  The Heartbeat of
                  <span className="mt-2 block text-yellow-400">
                    Pan-Africanism
                  </span>
                </h1>

                <p className="mt-6 max-w-[520px] text-xl leading-relaxed text-white/95">
                  Empowering African creators with visibility, community, and
                  future monetization.
                </p>

                <p className="mt-2 text-sm text-gray-200">
                  Join early creators building the future of African media.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
  href="/login"
  className="inline-flex items-center justify-center rounded-full bg-yellow-400 px-7 py-3 text-sm font-extrabold text-black shadow-lg hover:bg-yellow-300"
>
  Join as Creator
</Link>
                  <Link
  href="/discover"
                    className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-extrabold text-black shadow-lg hover:bg-gray-100"
                  >
                    Explore Videos
                  </Link>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-4 max-w-[980px] px-4">
              <div className="flex items-center gap-3 rounded-lg bg-black px-4 py-2 text-white">
                <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>

                <div className="text-sm">
                  <span className="font-semibold">Now uploading:</span>{" "}
                  <span className="text-gray-300">
                    {uploadedVideos.length > 0
                      ? uploadedVideos.map((item) => item.title).join(" • ")
                      : "Approved creator uploads will appear here."}
                  </span>
                </div>
              </div>
            </div>

            <section id="videos" className="mt-10">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-4xl font-extrabold text-black">
                    Discover on NiaTube
                  </h2>
                  <p className="mt-2 text-xl text-gray-700">
                    Content that informs, inspires, and connects Africa & the
                    Diaspora.
                  </p>
                </div>

                <a
                  href="/discover"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-yellow-400 px-4 text-sm font-semibold text-black hover:bg-yellow-300"
                >
                  View All
                </a>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                {videos.map((video, i) => {
                  const watchHref = video.id ? `/watch/${video.id}` : "/discover";

                  return (
                    <div
                      key={`${video.title}-${i}`}
                      className={`group overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                        i === 0 ? "ring-2 ring-yellow-400" : ""
                      }`}
                    >
                      <Link
                        href={watchHref}
                        className="relative block h-[210px] overflow-hidden bg-gray-100 sm:h-[190px]"
                      >
                        {video.is_live && (
                          <div className="absolute left-3 top-3 z-10 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                            LIVE
                          </div>
                        )}

                        <img
                          src={video.image || "/default-thumbnail.jpg"}
                          alt={video.title}
                          onError={(e) => {
                            e.currentTarget.src = "/default-thumbnail.jpg";
                          }}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-black/20"></div>

                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative h-5 w-9 drop-shadow-md">
                            <div
                              className="absolute inset-0 bg-red-600"
                              style={{
                                clipPath:
                                  "polygon(10% 0%, 78% 0%, 100% 50%, 78% 100%, 10% 100%, 0% 50%)",
                                borderRadius: "10px",
                              }}
                            />

                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-extrabold text-white">
                                N
                              </span>
                            </div>
                          </div>
                        </div>

                        {i === 0 && (
                          <div className="absolute left-3 top-3 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black shadow">
                            NEW
                          </div>
                        )}
                      </Link>

                      <div className="p-5">
                        <div className="text-xs font-semibold text-green-600">
                          ● Active now
                        </div>

                        <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-gray-900">
                          {video.title}
                        </h3>

                        <a
                          href={`/channel/${encodeURIComponent(video.creator)}`}
                          className="mt-1 block text-sm font-semibold text-gray-600 hover:text-yellow-600"
                        >
                          {video.creator}
                        </a>

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-600">
                          <span>👁️ {video.views || 0} views</span>
                          <span>👍 {video.likes || 0} likes</span>
                          <span>
                            📅{" "}
                            {video.created_at
                              ? new Date(video.created_at).toLocaleDateString()
                              : "Recently uploaded"}
                          </span>
                        </div>

                        <Link
                          href={watchHref}
                          className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
                        >
                          Watch
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-6 space-y-5">
              <div className="rounded-2xl bg-black p-5 text-white">
                <p className="text-xs font-bold uppercase text-yellow-400">
                  Sponsored
                </p>
                <h3 className="mt-2 text-xl font-extrabold">
                  Advertise on NiaTube
                </h3>
                <p className="mt-2 text-sm text-gray-300">
                  Reach Pan-African creators, viewers, and diaspora audiences.
                </p>
                <a
                  href="/advertise"
                  className="mt-4 inline-block rounded-md bg-yellow-400 px-4 py-2 text-sm font-bold text-black"
                >
                  Book Ad Space
                </a>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <h3 className="text-lg font-extrabold">Rising Creators</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <p>1. Kigali Stories — 1.2K subscribers</p>
                  <p>2. Lagos Vibes — 980 subscribers</p>
                  <p>3. Accra Voices — 760 subscribers</p>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <h3 className="text-lg font-extrabold">Creator Leaderboard</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <p>🔥 Most viewed this week</p>
                  <p>⭐ Most liked creators</p>
                  <p>🌍 Trending across Africa</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <footer className="mt-12 border-t bg-white py-8">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <p className="font-bold">Become a Creator on NiaTube</p>

          <div className="flex gap-6 text-sm text-gray-600">
            <a href="/about">About</a>
            <a href="/creator/apply">Creator</a>
            <a href="/press">Press</a>
            <a href="/privacy">Privacy</a>
          </div>
        </div>
      </footer>
    </main>
  );
}