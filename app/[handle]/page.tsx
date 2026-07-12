"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";

type UploadItem = {
  id: string;
  title: string;
  creator: string;
  thumbnail_url: string | null;
  video_url: string | null;
  status: string;
  created_at: string;
  likes?: number | null;
  views?: number | null;
};

type CreatorProfile = {
  id: string;
  creator_name: string;
  channel_handle: string;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  verified: boolean | null;
  account_status: string | null;
};

export default function CreatorHandlePage() {
  const params = useParams();
  const rawHandle = params.handle as string;

  const decodedHandle = decodeURIComponent(rawHandle || "");
  const hasHandlePrefix = decodedHandle.startsWith("@");
  const channelHandle = decodedHandle.replace(/^@/, "").toLowerCase();

  const [videos, setVideos] = useState<UploadItem[]>([]);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchCreatorChannel() {
      if (!hasHandlePrefix || !channelHandle) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const { data: profileData, error: profileError } = await supabase
          .from("creator_profiles")
          .select(
            "id, creator_name, channel_handle, avatar_url, banner_url, bio, verified, account_status"
          )
          .eq("channel_handle", channelHandle)
          .maybeSingle();

        if (profileError) {
          console.error("Creator profile error:", profileError);
          setNotFound(true);
          return;
        }

        if (!profileData) {
          setNotFound(true);
          return;
        }

        if (
          profileData.account_status === "suspended" ||
          profileData.account_status === "terminated"
        ) {
          setNotFound(true);
          return;
        }

        setProfile(profileData);

        const response = await fetch(
          `/api/uploads?all=true&ts=${Date.now()}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        const uploads: UploadItem[] = Array.isArray(data.uploads)
          ? data.uploads
          : [];

        const creatorVideos = uploads.filter(
          (video) =>
            video.creator.toLowerCase() ===
              profileData.creator_name.toLowerCase() &&
            video.status === "published"
        );

        setVideos(creatorVideos);
      } catch (error) {
        console.error("Failed to load creator channel:", error);
        setNotFound(true);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCreatorChannel();
  }, [channelHandle, hasHandlePrefix]);

  const totalViews = videos.reduce(
    (sum, video) => sum + (video.views || 0),
    0
  );

  const totalLikes = videos.reduce(
    (sum, video) => sum + (video.likes || 0),
    0
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f6f6] px-6 py-16 text-black">
        <div className="mx-auto max-w-6xl">
          <p className="text-gray-600">Loading creator channel...</p>
        </div>
      </main>
    );
  }

  if (notFound || !profile) {
    return (
      <main className="min-h-screen bg-[#f6f6f6] px-6 py-16 text-black">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-black text-gray-900">
            Creator channel not found
          </h1>

          <p className="mt-4 text-gray-600">
            This creator handle does not exist or the channel is not
            currently available.
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-yellow-400 px-6 py-3 font-black text-black hover:bg-yellow-300"
          >
            Return to NiaTube
          </Link>
        </div>
      </main>
    );
  }

  const creatorName = profile.creator_name;

  return (
    <main className="min-h-screen bg-[#f6f6f6] px-6 py-8 text-black">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="text-sm font-semibold text-yellow-600 hover:underline"
        >
          ← Back to Home
        </Link>

        <section className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="h-48 bg-gradient-to-r from-black via-gray-800 to-yellow-500">
            <img
              src={profile.banner_url || "/default-banner.jpg"}
              alt={`${creatorName} banner`}
              onError={(event) => {
                event.currentTarget.src = "/default-banner.jpg";
              }}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="p-8">
            <div className="-mt-20 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#FFD700] text-4xl font-extrabold text-black shadow">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={creatorName}
                      onError={(event) => {
                        event.currentTarget.src = "/default-avatar.png";
                      }}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    creatorName.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <h1 className="text-4xl font-extrabold">
                    {creatorName}
                  </h1>

                  {profile.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      ✓ Verified Creator
                    </span>
                  )}
                </div>

                <p className="mt-2 text-base font-bold text-gray-500">
                  @{profile.channel_handle}
                </p>

                <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600">
                  {profile.bio || "Official NiaTube creator channel."}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 shadow-sm">
                  <p className="text-2xl font-extrabold">
                    {videos.length}
                  </p>
                  <p className="text-sm text-gray-500">Videos</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 shadow-sm">
                  <p className="text-2xl font-extrabold">
                    {totalViews}
                  </p>
                  <p className="text-sm text-gray-500">Views</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 shadow-sm">
                  <p className="text-2xl font-extrabold">
                    {totalLikes}
                  </p>
                  <p className="text-sm text-gray-500">Likes</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-extrabold">
            Videos by {creatorName}
          </h2>

          {videos.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900">
                No videos yet
              </h3>

              <p className="mt-2 text-gray-600">
                This creator has not published any videos yet.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <article
                  key={video.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <Link
                    href={`/watch/${video.id}`}
                    className="block h-[190px] overflow-hidden bg-gray-200"
                  >
                    <img
                      src={
                        video.thumbnail_url ||
                        "/default-thumbnail.jpg"
                      }
                      alt={video.title}
                      onError={(event) => {
                        event.currentTarget.src =
                          "/default-thumbnail.jpg";
                      }}
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  <div className="p-5">
                    <h3 className="line-clamp-2 text-lg font-extrabold text-gray-900">
                      {video.title}
                    </h3>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-600">
                      <span>👁️ {video.views || 0} views</span>
                      <span>👍 {video.likes || 0} likes</span>
                    </div>

                    <Link
                      href={`/watch/${video.id}`}
                      className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
                    >
                      Watch
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}