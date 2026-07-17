"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";

type LiveSettings = {
  id: string;
  is_live: boolean;
  chat_paused: boolean;
  chat_locked: boolean;
  slow_mode: boolean;
  subscriber_only: boolean;
  monetization_enabled: boolean;
};

export default function BroadcastStatusPage() {
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [likes, setLikes] = useState(0);
  const [messagesPerMinute, setMessagesPerMinute] = useState(0);
  const [streamDuration, setStreamDuration] = useState(0);
  const [chatPaused, setChatPaused] = useState(false);
  const [monetizationEnabled, setMonetizationEnabled] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    loadLiveSettings();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isLive) {
      interval = setInterval(() => {
        setStreamDuration((prev) => prev + 1);
        setViewerCount((prev) => prev + Math.floor(Math.random() * 3));
        setLikes((prev) => prev + Math.floor(Math.random() * 2));
        setMessagesPerMinute(Math.floor(Math.random() * 40) + 5);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isLive]);

  async function loadLiveSettings() {
    const { data, error } = await supabase
      .from("live_stream_settings")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      console.error("Live settings load error:", error);
      setStatusMessage("Could not load live settings.");
      return;
    }

    const settings = data as LiveSettings;

    setSettingsId(settings.id);
    setIsLive(settings.is_live);
    setChatPaused(settings.chat_paused);
    setMonetizationEnabled(settings.monetization_enabled);
  }

  async function updateLiveSettings(updates: Partial<LiveSettings>) {
    if (!settingsId) {
      setStatusMessage("Live settings are still loading. Try again.");
      return false;
    }

    const { error } = await supabase
      .from("live_stream_settings")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", settingsId);

    if (error) {
      console.error("Live settings update error:", error);
      setStatusMessage("Could not update live settings.");
      return false;
    }

    setStatusMessage("Live settings updated.");
    return true;
  }

  function formatDuration(seconds: number) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  async function startBroadcast() {
    const saved = await updateLiveSettings({ is_live: true });

    if (saved) {
      setIsLive(true);
    }
  }

  async function endBroadcast() {
    const saved = await updateLiveSettings({
      is_live: false,
      chat_paused: false,
      monetization_enabled: false,
    });

    if (saved) {
      setIsLive(false);
      setStreamDuration(0);
      setChatPaused(false);
      setMonetizationEnabled(false);
    }
  }

  async function pauseChat() {
    const saved = await updateLiveSettings({ chat_paused: true });

    if (saved) {
      setChatPaused(true);
    }
  }

  async function resumeChat() {
    const saved = await updateLiveSettings({ chat_paused: false });

    if (saved) {
      setChatPaused(false);
    }
  }

  async function toggleMonetization() {
    const nextValue = !monetizationEnabled;

    const saved = await updateLiveSettings({
      monetization_enabled: nextValue,
    });

    if (saved) {
      setMonetizationEnabled(nextValue);
    }
  }

  async function shareStream() {
    try {
      await navigator.clipboard.writeText(window.location.origin + "/live");
      setShareCopied(true);

      setTimeout(() => {
        setShareCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Clipboard copy failed:", error);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900">
              Broadcast Status
            </h1>

            <p className="mt-2 text-lg text-gray-600">
              Configure and monitor your livestream status.
            </p>

            {statusMessage && (
              <p className="mt-3 text-sm font-bold text-blue-700">
                {statusMessage}
              </p>
            )}
          </div>

          <Link
            href="/live/control/chat"
            className="rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-800"
          >
            Open Live Chat
          </Link>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-gray-500">
                Stream Status
              </p>

              <div className="mt-3 flex items-center gap-3">
                <div
                  className={`h-4 w-4 rounded-full ${
                    isLive ? "animate-pulse bg-red-600" : "bg-gray-400"
                  }`}
                />

                <p
                  className={`text-3xl font-black ${
                    isLive ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  {isLive ? "LIVE" : "OFFLINE"}
                </p>
              </div>

              <p className="mt-4 text-gray-600">
                Duration: {formatDuration(streamDuration)}
              </p>

              <p className="mt-2 text-gray-600">
                Chat: {chatPaused ? "Paused" : "Active"}
              </p>

              <p className="mt-2 text-gray-600">
                Monetization:{" "}
                {monetizationEnabled ? "Enabled" : "Not Enabled"}
              </p>
            </div>

            <div className="flex gap-4">
              {!isLive ? (
                <button
                  onClick={startBroadcast}
                  className="rounded-2xl bg-red-600 px-6 py-4 text-lg font-bold text-white transition hover:bg-red-700"
                >
                  Start Stream
                </button>
              ) : (
                <button
                  onClick={endBroadcast}
                  className="rounded-2xl bg-black px-6 py-4 text-lg font-bold text-white transition hover:bg-gray-800"
                >
                  End Stream
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase text-gray-500">
              Current Viewers
            </p>
            <p className="mt-4 text-4xl font-black text-gray-900">
              {viewerCount}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase text-gray-500">
              Stream Likes
            </p>
            <p className="mt-4 text-4xl font-black text-gray-900">
              {likes}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase text-gray-500">
              Chat Activity
            </p>
            <p className="mt-4 text-4xl font-black text-gray-900">
              {chatPaused ? "Paused" : `${messagesPerMinute}/min`}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase text-gray-500">
              Stream Health
            </p>
            <p className="mt-4 text-3xl font-black text-green-600">
              Excellent
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900">
            Broadcast Controls
          </h2>

          <div className="mt-6 flex flex-wrap gap-4">
            {!chatPaused ? (
              <button
                onClick={pauseChat}
                className="rounded-xl bg-yellow-500 px-5 py-3 font-bold text-white hover:bg-yellow-600"
              >
                Pause Chat
              </button>
            ) : (
              <button
                onClick={resumeChat}
                className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
              >
                Resume Chat
              </button>
            )}

          <button
  onClick={toggleMonetization}
  className={`rounded-xl px-5 py-3 font-bold text-white ${
    monetizationEnabled
      ? "bg-green-700 hover:bg-green-800"
      : "bg-green-600 hover:bg-green-700"
  }`}
>
              {monetizationEnabled
                ? "Monetization Enabled"
                : "Enable Monetization"}
            </button>

            <button
              onClick={shareStream}
              className="rounded-xl bg-purple-600 px-5 py-3 font-bold text-white hover:bg-purple-700"
            >
              {shareCopied ? "Link Copied!" : "Share Stream"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}