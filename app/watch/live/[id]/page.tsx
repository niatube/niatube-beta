"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  RemoteTrack,
  Room,
  RoomEvent,
  Track,
} from "livekit-client";
import {
  connectToLiveKit,
  disconnectFromLiveKit,
} from "@/lib/livekit";

import { supabase } from "@/lib/supabase-browser";
import { COUNTRY_REGISTRY } from "@/lib/country-registry";

export default function LiveWatchPage() {
  const params = useParams<{ id: string }>();

  const roomRef = useRef<Room | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const audioContainerRef = useRef<HTMLDivElement | null>(null);

  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [creatorConnected, setCreatorConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Select Join Live Stream to begin watching."
  );
  // ---------- Super Support ----------
const [username, setUsername] = useState("");
const [viewerCountry, setViewerCountry] = useState("Rwanda");
const [viewerCurrency, setViewerCurrency] = useState("RWF");

const [supportTier, setSupportTier] = useState("Support");
const [supportMessage, setSupportMessage] = useState("");

const [isSendingSupport, setIsSendingSupport] = useState(false);
const [supportStatus, setSupportStatus] = useState("");
const [creatorName, setCreatorName] = useState("");

  const streamId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

    function handleViewerCountryChange(countryName: string) {
  setViewerCountry(countryName);

  const countryRecord = COUNTRY_REGISTRY.find(
    (record) => record.country === countryName
  );

  if (countryRecord) {
    setViewerCurrency(countryRecord.currencyCode);
  }
}

  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }

      clearMediaContainers();
    };
  }, []);
  useEffect(() => {
  async function loadStreamMetadata() {
    if (!streamId) return;

    const { data, error } = await supabase
      .from("uploads")
      .select("creator")
      .eq("id", streamId)
      .maybeSingle();

    if (error) {
      console.error("Live stream metadata error:", error);
      return;
    }

    if (data?.creator) {
      setCreatorName(data.creator);
    }
  }

  loadStreamMetadata();
}, [streamId]);

  function clearMediaContainers() {
    if (videoContainerRef.current) {
      videoContainerRef.current
        .querySelectorAll("video")
        .forEach((element) => element.remove());
    }

    if (audioContainerRef.current) {
      audioContainerRef.current
        .querySelectorAll("audio")
        .forEach((element) => element.remove());
    }
  }

  function attachTrack(track: RemoteTrack) {
    const mediaElement = track.attach();

    mediaElement.autoplay = true;

    if (track.kind === Track.Kind.Video) {
      mediaElement.className =
        "h-full w-full rounded-2xl bg-black object-contain";

      videoContainerRef.current?.appendChild(mediaElement);
      setCreatorConnected(true);
      setStatusMessage("The creator is live.");
      return;
    }

    if (track.kind === Track.Kind.Audio) {
      mediaElement.className = "hidden";
      audioContainerRef.current?.appendChild(mediaElement);
    }
  }

  function detachTrack(track: RemoteTrack) {
    track.detach().forEach((element) => {
      element.remove();
    });
  }

  async function joinLiveStream() {
    if (!streamId) {
      setStatusMessage("The live stream ID is missing.");
      return;
    }

    if (roomRef.current) {
      setStatusMessage("You are already connected to this live stream.");
      return;
    }

    setIsConnecting(true);
    setStatusMessage("Connecting to the live stream...");

    try {
      const roomName = `niatube-live-${streamId}`;

      const participantName = `Viewer ${crypto
        .randomUUID()
        .slice(0, 8)}`;

      const room = await connectToLiveKit({
        roomName,
        participantName,
        role: "viewer",
      });

      roomRef.current = room;

      room.on(
        RoomEvent.TrackSubscribed,
        (track) => {
          attachTrack(track);
        }
      );

      room.on(
        RoomEvent.TrackUnsubscribed,
        (track) => {
          detachTrack(track);
        }
      );

      room.on(RoomEvent.ParticipantConnected, () => {
        setCreatorConnected(true);
        setStatusMessage("The creator has joined the live stream.");
      });

      room.on(RoomEvent.ParticipantDisconnected, () => {
        setCreatorConnected(false);
        setStatusMessage("The creator has left the live stream.");
      });

      room.on(RoomEvent.Disconnected, () => {
        setIsConnected(false);
        setCreatorConnected(false);
        setStatusMessage("Disconnected from the live stream.");
        clearMediaContainers();
      });

      setIsConnected(true);

      if (room.remoteParticipants.size > 0) {
        setCreatorConnected(true);
        setStatusMessage("Connected. Loading the creator’s broadcast...");
      } else {
        setStatusMessage(
          "Connected. Waiting for the creator to begin broadcasting."
        );
      }
    } catch (error) {
      console.error("LiveKit viewer connection error:", error);

      roomRef.current = null;
      setIsConnected(false);
      setCreatorConnected(false);

      setStatusMessage(
        "Could not join the live stream. Confirm that the creator is broadcasting."
      );
    } finally {
      setIsConnecting(false);
    }
  }

  async function leaveLiveStream() {
    setIsConnecting(true);
    setStatusMessage("Leaving the live stream...");

    try {
      await disconnectFromLiveKit(roomRef.current);

      roomRef.current = null;
      clearMediaContainers();

      setIsConnected(false);
      setCreatorConnected(false);
      setStatusMessage("You have left the live stream.");
    } catch (error) {
      console.error("LiveKit viewer disconnect error:", error);
      setStatusMessage("Could not leave the live stream cleanly.");
    } finally {
      setIsConnecting(false);
    }
  }
  async function sendSuperSupport() {
  if (!streamId || !creatorName) {
    setSupportStatus("Unable to identify this live stream.");
    return;
  }

  if (!supportMessage.trim()) {
    setSupportStatus("Please enter a message.");
    return;
  }

  setIsSendingSupport(true);
  setSupportStatus("");

  try {
    const amountMap: Record<string, number> = {
      Support: 5,
      Champion: 20,
      Legend: 100,
    };

    const response = await fetch("/api/super-support", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        live_video_id: streamId,
        supporter_name: username || "Guest",
        creator_name: creatorName,
        amount: amountMap[supportTier] || 5,
        currency_code: viewerCurrency,
        tier: supportTier,
        message: supportMessage,
        country: viewerCountry,
        payment_method: "CARD",
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setSupportStatus(
        result.error || "Super Support could not be completed."
      );
      return;
    }

    setSupportStatus("✅ Super Support sent successfully!");
    setSupportMessage("");
  } catch (err) {
    console.error(err);
    setSupportStatus("An unexpected error occurred.");
  } finally {
    setIsSendingSupport(false);
  }
}

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${
                  creatorConnected
                    ? "animate-pulse bg-red-600 text-white"
                    : "bg-gray-700 text-gray-200"
                }`}
              >
                {creatorConnected ? "Live" : "Offline"}
              </span>

              <h1 className="text-3xl font-black">
                NiaTube Live
              </h1>
            </div>

            <p className="mt-2 text-sm text-gray-400">
              Stream ID: {streamId || "Unavailable"}
            </p>
          </div>

          <Link
            href="/live"
            className="w-fit rounded-xl bg-white px-5 py-3 text-sm font-bold text-gray-950 transition hover:bg-gray-200"
          >
            Back to Live
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section>
            <div className="overflow-hidden rounded-3xl border border-gray-800 bg-black shadow-2xl">
              <div
                ref={videoContainerRef}
                className="flex aspect-video items-center justify-center bg-black"
              >
                {!creatorConnected && (
                  <div className="px-6 text-center">
                    <div className="mx-auto h-4 w-4 rounded-full bg-gray-600" />

                    <p className="mt-5 text-xl font-black text-white">
                      Live stream unavailable
                    </p>

                    <p className="mt-2 text-sm text-gray-400">
                      Join the room and wait for the creator to begin
                      broadcasting.
                    </p>
                  </div>
                )}
              </div>

              <div ref={audioContainerRef} />
            </div>

            <div className="mt-5 rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <p className="font-bold text-gray-100">
                {statusMessage}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                {!isConnected ? (
                  <button
                    onClick={joinLiveStream}
                    disabled={isConnecting || !streamId}
                    className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-900"
                  >
                    {isConnecting
                      ? "Connecting..."
                      : "Join Live Stream"}
                  </button>
                ) : (
                  <button
                    onClick={leaveLiveStream}
                    disabled={isConnecting}
                    className="rounded-xl bg-gray-700 px-6 py-3 font-bold text-white transition hover:bg-gray-600 disabled:cursor-not-allowed disabled:bg-gray-800"
                  >
                    {isConnecting
                      ? "Leaving..."
                      : "Leave Stream"}
                  </button>
                )}
              </div>
            </div>

           <div className="mt-5 rounded-2xl border border-gray-800 bg-gray-900 p-6">
  <h2 className="text-2xl font-black">
    ⭐ Super Support
  </h2>

  <p className="mt-2 text-sm text-gray-400">
    Support this creator during the live broadcast.
  </p>

  <div className="mt-6 space-y-4">

    <select
  value={viewerCountry}
  onChange={(e) => handleViewerCountryChange(e.target.value)}
  className="w-full rounded-xl border border-gray-700 bg-gray-950 p-3 text-white"
>
  {COUNTRY_REGISTRY.map((record) => (
    <option key={record.isoCode} value={record.country}>
      {record.country}
    </option>
  ))}
</select>

    <input
      type="text"
      placeholder="Your country"
      value={viewerCountry}
      onChange={(e) => setViewerCountry(e.target.value)}
      className="w-full rounded-xl border border-gray-700 bg-gray-950 p-3 text-white"
    />

    <div className="rounded-xl border border-gray-700 bg-gray-950 p-3">
  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
    Support Currency
  </p>

  <p className="mt-1 text-lg font-black text-yellow-400">
    {viewerCurrency}
  </p>

  <p className="mt-1 text-xs text-gray-500">
    Automatically selected from the viewer country.
  </p>
</div>

    <select
      value={supportTier}
      onChange={(e) => setSupportTier(e.target.value)}
      className="w-full rounded-xl border border-gray-700 bg-gray-950 p-3 text-white"
    >
      <option value="Support">Support</option>
      <option value="Champion">Champion</option>
      <option value="Legend">Legend</option>
    </select>

    <textarea
      rows={4}
      placeholder="Leave a message for the creator..."
      value={supportMessage}
      onChange={(e) => setSupportMessage(e.target.value)}
      className="w-full rounded-xl border border-gray-700 bg-gray-950 p-3 text-white"
    />

    <button
      onClick={sendSuperSupport}
      disabled={isSendingSupport}
      className="w-full rounded-xl bg-yellow-500 px-6 py-3 font-black text-black hover:bg-yellow-400 disabled:opacity-50"
    >
      {isSendingSupport
        ? "Sending..."
        : `⭐ Send ${supportTier} Support`}
    </button>

    {supportStatus && (
      <p className="text-sm font-semibold text-green-400">
        {supportStatus}
      </p>
    )}

  </div>
</div>
          </section>

          <aside className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-xl font-black">
              Live Chat
            </h2>

            <div className="mt-5 flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-gray-700 bg-gray-950 p-6 text-center">
              <p className="text-sm text-gray-500">
                The existing NiaTube live chat will be connected here
                after video playback is verified.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}