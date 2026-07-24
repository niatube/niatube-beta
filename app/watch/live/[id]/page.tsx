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

  const streamId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }

      clearMediaContainers();
    };
  }, []);

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
                Live Broadcast
              </h2>

              <p className="mt-2 text-gray-400">
                Creator information, live viewer count, reactions, and
                Super Support will appear here in the next integration
                stages.
              </p>
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