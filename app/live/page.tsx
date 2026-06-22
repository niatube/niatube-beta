"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

type Video = {
  id: string;
  title: string;
  creator: string;
  views?: number;
  thumbnail_url?: string;
  is_live?: boolean;
};

type ChatMessage = {
  id: string;
  username: string;
  message: string;
  created_at?: string;
};

type LiveSettings = {
  is_live: boolean;
  chat_paused: boolean;
  chat_locked: boolean;
  slow_mode: boolean;
  subscriber_only: boolean;
  monetization_enabled: boolean;
};

export default function LivePage() {
  const [liveStreams, setLiveStreams] = useState<Video[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [username] = useState("Viewer");
  const [liveAd, setLiveAd] = useState<any | null>(null);
  const [liveAdImpressionRecorded, setLiveAdImpressionRecorded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  const [settings, setSettings] = useState<LiveSettings>({
    is_live: false,
    chat_paused: false,
    chat_locked: false,
    slow_mode: false,
    subscriber_only: false,
    monetization_enabled: false,
  });

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const chatDisabled =
    settings.chat_paused || settings.chat_locked || settings.subscriber_only;

  useEffect(() => {
    loadData();
    loadMessages();
    loadLiveSettings();

    const chatChannel = supabase
      .channel("viewer-live-chat-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_chat" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    const settingsChannel = supabase
      .channel("viewer-live-settings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_stream_settings" },
        () => {
          loadLiveSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadData() {
    setLoading(true);

    const { data } = await supabase
      .from("uploads")
      .select("*")
      .eq("status", "published")
      .eq("is_live", true)
      .order("created_at", { ascending: false });

    if (data) setLiveStreams(data as Video[]);

   const adResponse = await fetch(
  `/api/ads/live?ts=${Date.now()}`,
  {
    cache: "no-store",
  }
);

const adData = await adResponse.json();

setLiveAd(adData.ad || null);


      setLoading(false);
  }

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

  async function loadMessages() {
    const { data, error } = await supabase
      .from("live_chat")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) {
      console.error("Live chat load error:", error);
      return;
    }

    setMessages((data || []) as ChatMessage[]);
  }

  async function loadLiveSettings() {
    const { data, error } = await supabase
      .from("live_stream_settings")
      .select(
        "is_live, chat_paused, chat_locked, slow_mode, subscriber_only, monetization_enabled"
      )
      .limit(1)
      .single();

    if (error) {
      console.error("Live settings load error:", error);
      return;
    }

    setSettings(data as LiveSettings);
  }

  async function sendMessage() {
    const finalMessage = input.trim();

    if (chatDisabled) {
      setStatusMessage("Chat is currently restricted.");
      return;
    }

    if (!finalMessage) return;

    const { data, error } = await supabase
      .from("live_chat")
      .insert([
        {
          username,
          message: finalMessage,
          type: "viewer",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Live chat send error:", error);
      setStatusMessage("Could not send message.");
      return;
    }

    if (data) {
      setMessages((prev) => [...prev, data as ChatMessage]);
    }

    setInput("");
    setStatusMessage("");
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

      <section className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              {settings.is_live ? "🔴 Live Now" : "⚫ Live Offline"}
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Watch live events across Africa and the diaspora.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/live/setup"
              className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"
            >
              Start Live Event
            </Link>

            <div
              className={`hidden rounded-xl px-4 py-3 text-sm font-bold md:block ${
                settings.is_live
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {settings.is_live
                ? "Live Broadcast Active"
                : "No Active Broadcast"}
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-gray-500">
              Stream Status
            </p>

            <p
              className={`mt-2 text-2xl font-black ${
                settings.is_live ? "text-red-600" : "text-gray-700"
              }`}
            >
              {settings.is_live ? "LIVE" : "OFFLINE"}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-gray-500">
              Chat Status
            </p>

            <p
              className={`mt-2 text-2xl font-black ${
                chatDisabled ? "text-red-600" : "text-green-700"
              }`}
            >
              {chatDisabled ? "Restricted" : "Open"}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-gray-500">
              Slow Mode
            </p>

            <p className="mt-2 text-2xl font-black text-gray-900">
              {settings.slow_mode ? "On" : "Off"}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-gray-500">
              Monetization
            </p>

            <p className="mt-2 text-2xl font-black text-gray-900">
              {settings.monetization_enabled ? "On" : "Off"}
            </p>
          </div>
        </div>

        {(settings.chat_paused ||
          settings.chat_locked ||
          settings.subscriber_only) && (
          <div className="mb-6 rounded-2xl bg-red-50 p-5 font-bold text-red-700">
            {settings.chat_locked
              ? "Chat is locked by moderation."
              : settings.chat_paused
              ? "Chat is paused by the broadcaster."
              : "Subscriber-only chat is currently active."}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            {loading ? (
              <p className="text-gray-600">Loading live streams...</p>
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
              <h2 className="text-lg font-bold text-gray-900">Live Chat</h2>

              <div className="mt-4 h-[320px] overflow-y-auto rounded-xl border bg-gray-50 p-3">
                {messages.length === 0 ? (
                  <p className="text-sm text-gray-500">No messages yet.</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="mb-3 text-sm">
                      <span className="font-bold text-blue-700">
                        {msg.username}:{" "}
                      </span>

                      <span className="text-gray-700">{msg.message}</span>
                    </div>
                  ))
                )}

                <div ref={chatEndRef} />
              </div>

              {statusMessage && (
                <p className="mt-3 text-sm font-bold text-red-600">
                  {statusMessage}
                </p>
              )}

              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={input}
                  disabled={chatDisabled}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    chatDisabled
                      ? "Chat is currently restricted."
                      : "Type message..."
                  }
                  className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:border-black disabled:bg-gray-100"
                />

                <button
                  onClick={sendMessage}
                  disabled={chatDisabled}
                  className="rounded-xl bg-black px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  Send
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Live Monetization
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                {settings.monetization_enabled
                  ? "Live monetization is enabled for this stream."
                  : "Live monetization is not enabled yet."}
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}