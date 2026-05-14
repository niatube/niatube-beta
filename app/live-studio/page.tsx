"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

export default function LiveStudioPage() {
  const [streamTitle, setStreamTitle] = useState("NiaTube Live Stream");
  const [isLive, setIsLive] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [videoId, setVideoId] = useState("");

  async function startLive() {
  if (!videoId.trim()) {
    setStatusMessage("Please enter a video ID first.");
    return;
  }

  const res = await fetch("/api/uploads/live", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      videoId: videoId.trim(),
      isLive: true,
      streamTitle: streamTitle.trim() || "NiaTube Live Stream",
    }),
  });

  const result = await res.json();

  if (!res.ok) {
    console.error("Start live error:", result);
    setStatusMessage(result.error || "Could not start live.");
    return;
  }

  setIsLive(true);
  setStatusMessage("You are now live.");
}

async function endLive() {
  if (!videoId.trim()) {
    setStatusMessage("Please enter a video ID first.");
    return;
  }

  const res = await fetch("/api/uploads/live", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      videoId: videoId.trim(),
      isLive: false,
    }),
  });

  const result = await res.json();

  if (!res.ok) {
    console.error("End live error:", result);
    setStatusMessage(result.error || "Could not end live.");
    return;
  }

  setIsLive(false);
  setStatusMessage("Your live stream has ended.");
}

return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f6f6f6] px-6 py-8">
        <section className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase text-yellow-600">
            Creator Studio
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
            Live Control Room
          </h1>

          <p className="mt-2 text-gray-600">
            Start, stop, and manage your NiaTube live session.
          </p>

          <div className="mb-5">
  <label className="text-sm font-bold text-gray-900">
    Video ID
  </label>

  <input
    value={videoId}
    onChange={(e) => setVideoId(e.target.value)}
    className="mt-2 w-full rounded-lg border px-4 py-3 text-sm"
    placeholder="Enter uploaded video ID"
  />
</div>

          <div className="mt-6 rounded-2xl bg-gray-50 p-5">
            <label className="text-sm font-bold text-gray-900">
              Stream Title
            </label>

            <input
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              className="mt-2 w-full rounded-lg border px-4 py-3 text-sm"
              placeholder="Enter live stream title"
            />

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={startLive}
                disabled={isLive}
                className="rounded-lg bg-red-600 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Start Live
              </button>

              <button
                onClick={endLive}
                disabled={!isLive}
                className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                End Live
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-white p-4">
              <p className="text-sm font-bold text-gray-900">Live Status</p>

              <p className="mt-2 text-sm text-gray-700">
                {isLive ? "🔴 Live now" : "⚫ Offline"}
              </p>

              {statusMessage && (
                <p className="mt-2 text-sm font-semibold text-green-700">
                  {statusMessage}
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}