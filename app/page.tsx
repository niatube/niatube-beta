"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";
import { fallbackVideos } from "../lib/fallbackVideos";

type UploadItem = {
  id: string;
  title: string;
  creator: string;
  thumbnail_url: string | null;
  video_url: string | null;
  status: string;
  created_at: string;
  language?: string | null;
  likes?: number | null;
  views?: number | null;
  is_live?: boolean | null;
};

function formatUploadTime(dateString?: string | null) {
  if (!dateString) return "Recently uploaded";

  const uploadedTime = new Date(dateString).getTime();
  if (Number.isNaN(uploadedTime)) return "Recently uploaded";

  const now = Date.now();
  const seconds = Math.floor((now - uploadedTime) / 1000);

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export default function Home() {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [homepageAd, setHomepageAd] = useState<any | null>(null);
  const [impressionRecorded, setImpressionRecorded] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("niatube_language");
    setSelectedLanguage(savedLanguage);

    async function fetchUploads() {
      try {
        const res = await fetch(`/api/uploads?all=true&ts=${Date.now()}`, {
          cache: "no-store",
        });

        const data = await res.json();
        setUploads(Array.isArray(data.uploads) ? data.uploads : []);
      const adResponse = await fetch(`/api/ads/homepage?ts=${Date.now()}`, {
  cache: "no-store",
});

const adData = await adResponse.json();

setHomepageAd(adData.ad || null);
      } catch (error) {
        console.error("Failed to fetch uploads", error);
        setUploads([]);
      }
    }

    fetchUploads();
  }, []);

  useEffect(() => {
  async function recordImpression() {
if (!homepageAd?.campaign_name || impressionRecorded) {
  return;
}

    try {
      await supabase
        .from("ad_events")
        .insert({
          ad_id: homepageAd.campaign_name,
          event_type: "impression",
        });

      setImpressionRecorded(true);
    } catch (error) {
      console.error("Failed to record ad impression", error);
    }
  }

  recordImpression();
}, [homepageAd, impressionRecorded]);

  const uploadedVideos = uploads
    .filter((item) => item.status === "published")
    .map((item) => ({
      id: item.id,
      title: item.title,
      creator: item.creator,
      views: item.views || 0,
      likes: item.likes || 0,
      language: item.language || null,
      image: item.thumbnail_url || "/default-thumbnail.jpg",
      created_at: item.created_at,
      is_live: Boolean(item.is_live),
      isUploadedVideo: true,
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
      language: item.language || null,
      is_live: Boolean(item.is_live),
      isUploadedVideo: false,
    })
  );

  const filteredVideos = [...uploadedVideos, ...fallbackWithStats].filter(
    (video) => {
      if (!selectedLanguage) return true;

      if (video.isUploadedVideo && !video.language) return true;

      return video.language === selectedLanguage;
    }
  );
  
  const sortedVideos = [...filteredVideos].sort((a: any, b: any) => {
    if (a.is_live && !b.is_live) return -1;
    if (!a.is_live && b.is_live) return 1;

    if (a.isUploadedVideo && !b.isUploadedVideo) return -1;
    if (!a.isUploadedVideo && b.isUploadedVideo) return 1;

    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;

    return bTime - aTime;
  });

  const videos = sortedVideos.filter((video: any) => !video.is_live).slice(0, 6);

  const recommendedVideos = [...sortedVideos]
    .filter((video: any) => !video.is_live)
    .sort((a: any, b: any) => {
      const aScore = Number(a.views || 0) + Number(a.likes || 0) * 4;
      const bScore = Number(b.views || 0) + Number(b.likes || 0) * 4;
      return bScore - aScore;
    })
    .slice(0, 6);

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
                <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />

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

                <Link
                  href="/discover"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-yellow-400 px-4 text-sm font-semibold text-black hover:bg-yellow-300"
                >
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                {videos.map((video: any, i: number) => {
                  const watchHref = video.id ? `/watch/${video.id}` : "/discover";

                  return (
                    <div
                      key={`${video.id}-${i}`}
                      className={`group overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                        i === 0 ? "ring-2 ring-yellow-400" : ""
                      }`}
                    >
                      <Link
                        href={watchHref}
                        className="relative block h-[210px] overflow-hidden bg-gray-100 sm:h-[190px]"
                      >
                        {i === 0 && (
                          <div className="absolute left-3 top-3 z-20 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black shadow">
                            NEW
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

                        <div className="absolute inset-0 bg-black/20" />
                      </Link>

                      <div className="p-5">
                        <div className="text-xs font-semibold text-green-600">
                          ● Available now
                        </div>

                        <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-gray-900">
                          {video.title}
                        </h3>

                        <Link
                          href={`/channel/${encodeURIComponent(video.creator)}`}
                          className="mt-1 block text-sm font-semibold text-gray-600 hover:text-yellow-600"
                        >
                          {video.creator}
                        </Link>

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-600">
                          <span>👁️ {video.views || 0} views</span>
                          <span>👍 {video.likes || 0} likes</span>
                          <span>📅 {formatUploadTime(video.created_at)}</span>
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

              <div className="mt-12 rounded-3xl bg-white p-6 shadow-sm">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900">
                      Recommended for You
                    </h2>

                    <p className="mt-2 text-gray-600">
                      Suggested videos based on engagement, views, likes, and
                      creator momentum.
                    </p>
                  </div>

                  <Link
                    href="/discover"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-black px-4 text-sm font-bold text-white hover:bg-gray-800"
                  >
                    Explore More
                  </Link>
                </div>

                {recommendedVideos.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Recommendations will appear as more videos are published.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {recommendedVideos.map((video: any, i: number) => (
                      <Link
                        key={`recommended-${video.id}-${i}`}
                        href={`/watch/${video.id}`}
                        className="group overflow-hidden rounded-2xl border bg-gray-50 transition hover:bg-white hover:shadow-md"
                      >
                        <div className="relative h-[170px] overflow-hidden bg-gray-100">
                          <img
                            src={video.image || "/default-thumbnail.jpg"}
                            alt={video.title}
                            onError={(e) => {
                              e.currentTarget.src = "/default-thumbnail.jpg";
                            }}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />

                          <div className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-xs font-black text-white">
                            Recommended
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="line-clamp-2 text-base font-black text-gray-900">
                            {video.title}
                          </h3>

                          <p className="mt-1 text-sm font-semibold text-gray-600">
                            {video.creator}
                          </p>

                          <p className="mt-2 text-sm text-gray-500">
                            {video.views || 0} views • {video.likes || 0} likes
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {uploadedVideos.some((video: any) => video.is_live) && (
                <div className="mt-10 rounded-3xl border border-red-100 bg-red-50 p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-extrabold text-red-700">
                        🔴 Live Now
                      </h2>

                      <p className="mt-1 text-sm text-red-700/80">
                        Join active livestreams happening now on NiaTube.
                      </p>
                    </div>

                    <Link
                      href="/live"
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                    >
                      View Live
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {uploadedVideos
                      .filter((video: any) => video.is_live)
                      .slice(0, 3)
                      .map((video: any, i: number) => (
                        <Link
                          key={`live-${video.id}-${i}`}
                          href={`/watch/${video.id}`}
                          className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >
                          <div className="relative h-[190px] overflow-hidden bg-black">
                            <div className="absolute left-3 top-3 z-20 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                              🔴 LIVE
                            </div>

                            <img
                              src={video.image || "/default-thumbnail.jpg"}
                              alt={video.title}
                              onError={(e) => {
                                e.currentTarget.src = "/default-thumbnail.jpg";
                              }}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />

                            <div className="absolute inset-0 bg-black/25" />
                          </div>

                          <div className="p-5">
                            <p className="text-xs font-bold text-red-600">
                              ● Live now
                            </p>

                            <h3 className="mt-2 line-clamp-2 text-base font-bold text-gray-900">
                              {video.title}
                            </h3>

                            <p className="mt-1 text-sm font-semibold text-gray-600">
                              {video.creator}
                            </p>

                            <button className="mt-4 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white">
                              Watch Live
                            </button>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="hidden xl:block">
          <div className="sticky top-6 space-y-5">
 <div className="rounded-2xl border-2 border-black bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 p-5 text-gray-900 shadow-sm">
      {homepageAd?.ad_image_url && (
    <img
      src={homepageAd.ad_image_url}
      alt={homepageAd?.advertiser_name || "Sponsored ad"}
      className="mb-4 h-32 w-full rounded-xl object-cover"
    />
  )}

  <p className="inline-block rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold uppercase text-black">
  Sponsored
</p>

  <h3 className="mt-2 text-xl font-extrabold">
  {homepageAd?.headline ||
    homepageAd?.advertiser_name ||
    "Advertise on NiaTube"}
</h3>

  <p className="mt-2 text-sm text-black">
  {homepageAd?.subheadline ||
    homepageAd?.campaign_name ||
    "Reach Pan-African creators, viewers, and diaspora audiences."}
</p>

  {homepageAd?.landing_url ? (
    <a
      href={homepageAd.landing_url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 inline-block rounded-md bg-yellow-400 px-4 py-2 text-sm font-bold text-black"
    >
      {homepageAd?.cta_text || "Learn More"}
    </a>
  ) : !homepageAd ? (
    <Link
      href="/advertise"
      className="mt-4 inline-block rounded-md bg-yellow-400 px-4 py-2 text-sm font-bold text-black"
    >
      Book Ad Space
    </Link>
  ) : null}
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
                <h3 className="text-lg font-extrabold">
                  Creator Leaderboard
                </h3>

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
            <Link href="/about">About</Link>
            <Link href="/creator/apply">Creator</Link>
            <Link href="/press">Press</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}