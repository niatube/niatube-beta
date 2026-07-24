"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Room } from "livekit-client";
import { supabase } from "@/lib/supabase-browser";
import {
  connectToLiveKit,
  disconnectFromLiveKit,
} from "@/lib/livekit";

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
  const liveKitRoomRef = useRef<Room | null>(null);

  const [eventId, setEventId] = useState<string | null>(null);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const [isLive, setIsLive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [liveKitConnected, setLiveKitConnected] = useState(false);

  const [viewerCount, setViewerCount] = useState(0);
  const [likes, setLikes] = useState(0);
  const [messagesPerMinute, setMessagesPerMinute] = useState(0);
  const [streamDuration, setStreamDuration] = useState(0);

  const [chatPaused, setChatPaused] = useState(false);
  const [monetizationEnabled, setMonetizationEnabled] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const eventIdFromUrl = searchParams.get("eventId");

    if (eventIdFromUrl) {
      setEventId(eventIdFromUrl);
    } else {
      setStatusMessage(
        "No live event was selected. Return to Create Live Event and create or select an event."
      );
    }

    loadLiveSettings();

    return () => {
      if (liveKitRoomRef.current) {
        liveKitRoomRef.current.disconnect();
        liveKitRoomRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isLive) {
      interval = setInterval(() => {
        setStreamDuration((previous) => previous + 1);

        setViewerCount(
          (previous) => previous + Math.floor(Math.random() * 3)
        );

        setLikes(
          (previous) => previous + Math.floor(Math.random() * 2)
        );

        setMessagesPerMinute(
          Math.floor(Math.random() * 40) + 5
        );
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
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

// A saved database status does not mean this browser is connected.
// The creator must explicitly click Start Stream.
setIsLive(false);
setLiveKitConnected(false);

setChatPaused(settings.chat_paused);
setMonetizationEnabled(settings.monetization_enabled);

if (settings.is_live) {
  setStatusMessage(
    "A previous live status was found. Click Start Stream to connect this browser's camera and microphone."
  );
}
  }

  async function updateLiveSettings(
    updates: Partial<LiveSettings>
  ) {
    if (!settingsId) {
      setStatusMessage(
        "Live settings are still loading. Try again."
      );

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

    return true;
  }

  async function updateLiveEvent(
    updates: {
      is_live?: boolean;
      live_status?: string;
    }
  ) {
    if (!eventId) {
      setStatusMessage(
        "No live event ID is available."
      );

      return false;
    }

    const { error } = await supabase
      .from("uploads")
      .update(updates)
      .eq("id", eventId);

    if (error) {
      console.error("Live event update error:", error);

      setStatusMessage(
        "Could not update the live event record."
      );

      return false;
    }

    return true;
  }

  function formatDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours
      .toString()
      .padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  async function startBroadcast() {
    if (!eventId) {
      setStatusMessage(
        "No live event was selected. Return to Create Live Event."
      );

      return;
    }

    if (!settingsId) {
      setStatusMessage(
        "Live settings are still loading. Try again."
      );

      return;
    }

    if (liveKitRoomRef.current) {
      setStatusMessage(
        "This browser is already connected to LiveKit."
      );

      return;
    }

    setIsConnecting(true);

    setStatusMessage(
      "Requesting camera and microphone access..."
    );

    try {
      const roomName = `niatube-live-${eventId}`;

      const participantName =
        `NiaTube Creator ${eventId.slice(0, 8)}`;

      const room = await connectToLiveKit({
        roomName,
        participantName,
        role: "creator",
      });

      liveKitRoomRef.current = room;
      setLiveKitConnected(true);

      const settingsSaved = await updateLiveSettings({
        is_live: true,
      });

      if (!settingsSaved) {
        await disconnectFromLiveKit(room);

        liveKitRoomRef.current = null;
        setLiveKitConnected(false);

        setStatusMessage(
          "LiveKit connected, but the broadcast status could not be saved."
        );

        return;
      }

      const eventSaved = await updateLiveEvent({
        is_live: true,
        live_status: "live",
      });

      if (!eventSaved) {
        await disconnectFromLiveKit(room);

        liveKitRoomRef.current = null;
        setLiveKitConnected(false);

        await updateLiveSettings({
          is_live: false,
        });

        setStatusMessage(
          "LiveKit connected, but the live event could not be updated."
        );

        return;
      }

      setIsLive(true);
      setStreamDuration(0);

      setStatusMessage(
        "You are connected to LiveKit. Camera and microphone are publishing."
      );
    } catch (error) {
      console.error(
        "LiveKit broadcast start error:",
        error
      );

      if (liveKitRoomRef.current) {
        await disconnectFromLiveKit(
          liveKitRoomRef.current
        );

        liveKitRoomRef.current = null;
      }

      setLiveKitConnected(false);
      setIsLive(false);

      setStatusMessage(
        "Could not start the LiveKit broadcast. Check camera and microphone permission."
      );
    } finally {
      setIsConnecting(false);
    }
  }

  async function endBroadcast() {
    setIsConnecting(true);

    setStatusMessage(
      "Ending the LiveKit broadcast..."
    );

    try {
      if (liveKitRoomRef.current) {
        await disconnectFromLiveKit(
          liveKitRoomRef.current
        );

        liveKitRoomRef.current = null;
      }

      setLiveKitConnected(false);

      const settingsSaved = await updateLiveSettings({
        is_live: false,
        chat_paused: false,
        monetization_enabled: false,
      });

      const eventSaved = await updateLiveEvent({
        is_live: false,
        live_status: "ended",
      });

      setIsLive(false);
      setStreamDuration(0);
      setViewerCount(0);
      setLikes(0);
      setMessagesPerMinute(0);
      setChatPaused(false);
      setMonetizationEnabled(false);

      if (!settingsSaved || !eventSaved) {
        setStatusMessage(
          "The LiveKit broadcast ended, but one or more saved status records could not be updated."
        );

        return;
      }

      setStatusMessage(
        "Broadcast ended successfully."
      );
    } catch (error) {
      console.error(
        "LiveKit broadcast end error:",
        error
      );

      setStatusMessage(
        "Could not end the broadcast cleanly."
      );
    } finally {
      setIsConnecting(false);
    }
  }

  async function pauseChat() {
    const saved = await updateLiveSettings({
      chat_paused: true,
    });

    if (saved) {
      setChatPaused(true);
      setStatusMessage("Live chat paused.");
    }
  }

  async function resumeChat() {
    const saved = await updateLiveSettings({
      chat_paused: false,
    });

    if (saved) {
      setChatPaused(false);
      setStatusMessage("Live chat resumed.");
    }
  }

  async function toggleMonetization() {
    const nextValue = !monetizationEnabled;

    const saved = await updateLiveSettings({
      monetization_enabled: nextValue,
    });

    if (saved) {
      setMonetizationEnabled(nextValue);

      setStatusMessage(
        nextValue
          ? "Live monetization enabled."
          : "Live monetization disabled."
      );
    }
  }

  async function shareStream() {
    if (!eventId) {
      setStatusMessage(
        "No live event link is available."
      );

      return;
    }

    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/watch/${eventId}`
      );

      setShareCopied(true);

      setStatusMessage(
        "Live event watch link copied."
      );

      setTimeout(() => {
        setShareCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Clipboard copy failed:",
        error
      );

      setStatusMessage(
        "Could not copy the live event link."
      );
    }
  }

  const liveChatHref = eventId
    ? `/live/control/chat?eventId=${encodeURIComponent(eventId)}`
    : "/live/control/chat";

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

            {eventId && (
              <p className="mt-2 text-sm font-bold text-gray-500">
                Live Event ID: {eventId}
              </p>
            )}

            {statusMessage && (
              <p className="mt-3 text-sm font-bold text-blue-700">
                {statusMessage}
              </p>
            )}
          </div>

          <Link
            href={liveChatHref}
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
                    isLive
                      ? "animate-pulse bg-red-600"
                      : "bg-gray-400"
                  }`}
                />

                <p
                  className={`text-3xl font-black ${
                    isLive
                      ? "text-red-600"
                      : "text-gray-700"
                  }`}
                >
                  {isLive ? "LIVE" : "OFFLINE"}
                </p>
              </div>

              <p className="mt-4 text-gray-600">
                Duration: {formatDuration(streamDuration)}
              </p>

              <p className="mt-2 text-gray-600">
                LiveKit:{" "}
                {liveKitConnected
                  ? "Connected"
                  : "Not Connected"}
              </p>

              <p className="mt-2 text-gray-600">
                Chat: {chatPaused ? "Paused" : "Active"}
              </p>

              <p className="mt-2 text-gray-600">
                Monetization:{" "}
                {monetizationEnabled
                  ? "Enabled"
                  : "Not Enabled"}
              </p>
            </div>

            <div className="flex gap-4">
              {!isLive ? (
                <button
                  onClick={startBroadcast}
                  disabled={
                    isConnecting ||
                    !settingsId ||
                    !eventId
                  }
                  className="rounded-2xl bg-red-600 px-6 py-4 text-lg font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                >
                  {isConnecting
                    ? "Connecting..."
                    : "Start Stream"}
                </button>
              ) : (
                <button
                  onClick={endBroadcast}
                  disabled={isConnecting}
                  className="rounded-2xl bg-black px-6 py-4 text-lg font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-500"
                >
                  {isConnecting
                    ? "Ending..."
                    : "End Stream"}
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
              {chatPaused
                ? "Paused"
                : `${messagesPerMinute}/min`}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase text-gray-500">
              Stream Health
            </p>

            <p
              className={`mt-4 text-3xl font-black ${
                liveKitConnected
                  ? "text-green-600"
                  : "text-gray-500"
              }`}
            >
              {liveKitConnected
                ? "Connected"
                : "Offline"}
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
              disabled={!eventId}
              className="rounded-xl bg-purple-600 px-5 py-3 font-bold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-300"
            >
              {shareCopied
                ? "Link Copied!"
                : "Share Stream"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}