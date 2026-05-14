"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

type Video = {
  id: string;
  title: string;
  creator: string;
  views?: number;
  thumbnail_url?: string;
};

export default function LivePage() {
  const [liveStreams, setLiveStreams] = useState<Video[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const { data } = await supabase
        .from("uploads")
        .select("*")
        .eq("is_live", true)
        .order("created_at", { ascending: false });

      if (data) setLiveStreams(data);

      const { data: adsData } = await supabase
        .from("ads")
        .select("*")
        .eq("is_active", true)
        .limit(1);

      if (adsData) setAds(adsData);

      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">🔴 Live Now</h1>
            <p className="mt-1 text-sm text-gray-600">
              Watch live events across Africa and the diaspora.
            </p>
          </div>

          <div className="hidden rounded-xl bg-yellow-100 px-4 py-3 text-sm font-bold text-yellow-800 md:block">
            Sponsored Live Events
          </div>
        </div>

        {/* MAIN GRID (ALWAYS SHOWS) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          {/* LEFT: STREAMS */}
          <div>
            {loading ? (
              <p className="text-gray-600">Loading live streams...</p>
            ) : liveStreams.length === 0 ? (
              <p className="text-gray-600">
                No live streams right now. Start a live stream to appear here.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {liveStreams.map((stream) => (
                  <Link
                    key={stream.id}
                    href={`/watch/${stream.id}`}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md"
                  >
                    <div className="relative flex h-[210px] items-center justify-center bg-black">
                      {stream.thumbnail_url ? (
                        <img
                          src={stream.thumbnail_url}
                          alt={stream.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-white">Live Preview</div>
                      )}

                      <span className="absolute left-3 top-3 rounded bg-red-600 px-3 py-1 text-xs font-bold text-white">
                        🔴 LIVE
                      </span>
                    </div>

                    <div className="p-4">
                      <h2 className="text-base font-bold text-gray-900">
                        {stream.title}
                      </h2>

                      <p className="mt-1 text-sm text-gray-600">
                        {stream.creator}
                      </p>

                      <p className="mt-2 text-sm font-bold text-red-600">
                        {stream.views || 0} watching
                      </p>

                      <button className="mt-3 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white">
                        ▶ Watch Live
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: ADS (ALWAYS VISIBLE) */}
          <aside className="space-y-4">
            {ads.length > 0 && (
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase text-yellow-700">
                  Sponsored
                </p>

                <h2 className="mt-2 text-lg font-black text-gray-900">
                  {ads[0].title}
                </h2>

                <p className="mt-2 text-sm text-gray-700">
                  {ads[0].description}
                </p>

                <a
                  href={ads[0].link}
                  className="mt-4 block w-full rounded-lg bg-black px-4 py-2 text-center text-sm font-bold text-white"
                >
                  {ads[0].cta}
                </a>
              </div>
            )}

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Live Monetization
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Sponsor live events and reach engaged audiences in real time.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}