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
  thumbnail_url?: string | null;
  is_live?: boolean | null;
  category?: string | null;
  created_at?: string | null;
};

export default function LivePage() {
  const [liveStreams, setLiveStreams] = useState<Video[]>([]);
  const [pastLiveEvents, setPastLiveEvents] = useState<Video[]>([]);
  const [liveAd, setLiveAd] = useState<any | null>(null);
  const [liveAdImpressionRecorded, setLiveAdImpressionRecorded] =
    useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    async function recordLiveAdImpression() {
      if (!liveAd?.campaign_name || liveAdImpressionRecorded) {
        return;
      }

      try {
        await supabase.from("ad_events").insert({
          ad_id: liveAd.campaign_name,
          event_type: "impression",
          placement: "Live Page",
        });

        setLiveAdImpressionRecorded(true);
      } catch (error) {
        console.error("Failed to record live ad impression", error);
      }
    }

    recordLiveAdImpression();
  }, [liveAd, liveAdImpressionRecorded]);

  async function loadData() {
    setLoading(true);

    const { data: liveData } = await supabase
      .from("uploads")
      .select("*")
      .eq("status", "published")
      .eq("is_live", true)
      .order("created_at", { ascending: false });

    if (liveData) {
      setLiveStreams(liveData as Video[]);
    }

    const { data: pastData } = await supabase
      .from("uploads")
      .select("*")
      .eq("status", "published")
      .eq("is_live", false)
      .eq("category", "Live")
      .order("created_at", { ascending: false })
      .limit(12);

    if (pastData) {
      setPastLiveEvents(pastData as Video[]);
    }

    const adResponse = await fetch(`/api/ads/live?ts=${Date.now()}`, {
      cache: "no-store",
    });

    const adData = await adResponse.json();
    setLiveAd(adData.ad || null);

    setLoading(false);
  }

  const recordLiveAdClick = async () => {
    if (!liveAd?.landing_url) {
      return;
    }

    const targetUrl = liveAd.landing_url.trim();

    window.open(targetUrl, "_blank", "noopener,noreferrer");

    if (!liveAd?.campaign_name) {
      return;
    }

    try {
      await supabase.from("ad_events").insert({
        ad_id: liveAd.campaign_name,
        event_type: "click",
        placement: "Live Page",
      });
    } catch (error) {
      console.error("Failed to record live ad click", error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase text-red-600">
            NiaTube Live
          </p>

          <h1 className="mt-2 text-4xl font-black text-gray-900">
            Live Events Library
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Watch current live events and replay past live broadcasts from
            creators across Africa and the diaspora.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900">
                  Live Now
                </h2>
              </div>

              {loading ? (
                <p className="rounded-2xl bg-white p-6 font-bold text-gray-600 shadow-sm">
                  Loading live events...
                </p>
              ) : liveStreams.length === 0 ? (
                <p className="rounded-2xl bg-white p-6 font-bold text-gray-700 shadow-sm">
                  No livestream is active right now.
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
                        <h3 className="text-base font-bold text-gray-900">
                          {stream.title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-600">
                          {stream.creator}
                        </p>

                        <p className="mt-2 text-sm font-bold text-red-600">
                          {stream.views || 0} watching
                        </p>

                        <div className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-bold text-white">
                          View Live
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900">
                  Past Live Events
                </h2>
              </div>

              {loading ? (
                <p className="rounded-2xl bg-white p-6 font-bold text-gray-600 shadow-sm">
                  Loading past live events...
                </p>
              ) : pastLiveEvents.length === 0 ? (
                <p className="rounded-2xl bg-white p-6 font-bold text-gray-700 shadow-sm">
                  No past live events are available yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {pastLiveEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={`/watch/${event.id}`}
                      className="overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md"
                    >
                      <div className="relative flex h-[210px] items-center justify-center bg-black">
                        {event.thumbnail_url ? (
                          <img
                            src={event.thumbnail_url}
                            alt={event.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="text-white">Live Replay</div>
                        )}

                        <span className="absolute left-3 top-3 rounded bg-gray-800 px-3 py-1 text-xs font-bold text-white">
                          Replay
                        </span>
                      </div>

                      <div className="p-4">
                        <h3 className="text-base font-bold text-gray-900">
                          {event.title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-600">
                          {event.creator}
                        </p>

                        <p className="mt-2 text-sm font-bold text-gray-600">
                          {event.views || 0} views
                        </p>

                        <div className="mt-3 rounded-lg bg-black px-4 py-2 text-center text-sm font-bold text-white">
                          View Event
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-4">
            {liveAd && (
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase text-yellow-700">
                  Sponsored
                </p>

                {liveAd?.ad_image_url && (
                  <img
                    src={liveAd.ad_image_url}
                    alt={liveAd.headline || "Sponsored Ad"}
                    className="mb-4 h-32 w-full rounded-xl object-cover"
                  />
                )}

                <h2 className="mt-2 text-lg font-black text-gray-900">
                  {liveAd?.headline || liveAd?.campaign_name}
                </h2>

                <p className="mt-2 text-sm text-gray-700">
                  {liveAd?.subheadline ||
                    "Reach engaged viewers during live streams."}
                </p>

                <button
                  type="button"
                  onClick={recordLiveAdClick}
                  className="mt-4 block w-full rounded-lg bg-black px-4 py-2 text-center text-sm font-bold text-white"
                >
                  {liveAd?.cta_text || "Learn More"}
                </button>
              </div>
            )}

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-gray-900">
                About NiaTube Live
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                NiaTube Live features broadcasts, conversations, performances,
                community events, and cultural programming from creators across
                Africa and the diaspora.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}