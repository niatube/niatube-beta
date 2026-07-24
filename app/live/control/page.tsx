"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function LiveControlPage() {
  const [eventId, setEventId] = useState<string | null>(null);
  const [routeLoaded, setRouteLoaded] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const eventIdFromUrl = searchParams.get("eventId");

    setEventId(eventIdFromUrl);
    setRouteLoaded(true);
  }, []);

  const broadcastHref = eventId
    ? `/live/control/broadcast?eventId=${encodeURIComponent(eventId)}`
    : "/live/setup";

  const chatHref = eventId
    ? `/live/control/chat?eventId=${encodeURIComponent(eventId)}`
    : "/live/setup";

  const moderationHref = eventId
    ? `/live/control/moderation?eventId=${encodeURIComponent(eventId)}`
    : "/live/setup";

  const watchHref = eventId
    ? `/watch/${encodeURIComponent(eventId)}`
    : "/live/setup";

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <p className="mb-3 text-sm font-black uppercase text-red-600">
            Live Control Room
          </p>

          <h1 className="text-5xl font-black text-gray-900">
            Manage Your Live Broadcast
          </h1>

          <p className="mt-5 max-w-3xl text-lg text-gray-700">
            Control your livestream status, audience chat, event details,
            moderation, and viewer experience from one live event.
          </p>

          {routeLoaded && eventId && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
              <p className="text-xs font-black uppercase text-green-700">
                Selected Live Event
              </p>

              <p className="mt-2 break-all text-sm font-bold text-gray-800">
                Event ID: {eventId}
              </p>
            </div>
          )}

          {routeLoaded && !eventId && (
            <div className="mt-6 rounded-2xl border border-yellow-300 bg-yellow-50 p-5">
              <p className="font-black text-yellow-900">
                No live event was selected.
              </p>

              <p className="mt-2 text-sm text-yellow-800">
                Create or select a live event before opening the broadcast
                controls.
              </p>

              <Link
                href="/live/setup"
                className="mt-4 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-black text-white transition hover:bg-gray-800"
              >
                Create a Live Event
              </Link>
            </div>
          )}

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Link
              href={broadcastHref}
              className={`block rounded-2xl border p-6 transition ${
                eventId
                  ? "cursor-pointer bg-red-50 hover:scale-[1.02] hover:bg-red-100"
                  : "cursor-not-allowed bg-gray-100 opacity-70"
              }`}
            >
              <h2 className="text-xl font-black">
                Broadcast Status
              </h2>

              <p className="mt-3 text-gray-700">
                Connect your camera and microphone, then start or end this
                livestream.
              </p>

              <p className="mt-4 text-sm font-bold text-red-700">
                {eventId
                  ? "Open Broadcast Status →"
                  : "Create an event first →"}
              </p>
            </Link>

            <Link
              href={watchHref}
              className={`block rounded-2xl border p-6 transition ${
                eventId
                  ? "cursor-pointer bg-green-50 hover:scale-[1.02] hover:bg-green-100"
                  : "cursor-not-allowed bg-gray-100 opacity-70"
              }`}
            >
              <h2 className="text-xl font-black">
                Viewer Watch Page
              </h2>

              <p className="mt-3 text-gray-700">
                Open the public page where viewers receive the LiveKit video
                and audio.
              </p>

              <p className="mt-4 text-sm font-bold text-green-700">
                {eventId
                  ? "Open Viewer Page →"
                  : "Create an event first →"}
              </p>
            </Link>

            <Link
              href={chatHref}
              className={`rounded-2xl border p-6 transition ${
                eventId
                  ? "bg-yellow-50 hover:scale-[1.02] hover:bg-yellow-100"
                  : "cursor-not-allowed bg-gray-100 opacity-70"
              }`}
            >
              <h2 className="text-xl font-black">
                Live Chat
              </h2>

              <p className="mt-3 text-gray-700">
                Manage audience chat and engagement for this live event.
              </p>

              <p className="mt-4 text-sm font-bold text-yellow-700">
                {eventId
                  ? "Open Live Chat →"
                  : "Create an event first →"}
              </p>
            </Link>

            <Link
              href={moderationHref}
              className={`rounded-2xl border p-6 transition ${
                eventId
                  ? "bg-blue-50 hover:scale-[1.02] hover:bg-blue-100"
                  : "cursor-not-allowed bg-gray-100 opacity-70"
              }`}
            >
              <h2 className="text-xl font-black">
                Moderation
              </h2>

              <p className="mt-3 text-gray-700">
                Review moderation tools and safety controls for this event.
              </p>

              <p className="mt-4 text-sm font-bold text-blue-700">
                {eventId
                  ? "Open Moderation →"
                  : "Create an event first →"}
              </p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}