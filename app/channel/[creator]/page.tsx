"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  verified: boolean | null;
};

export default function CreatorChannelPage() {
  const params = useParams();
  const creatorParam = params.creator as string;
  const creatorName = decodeURIComponent(creatorParam);

  const [videos, setVideos] = useState<UploadItem[]>([]);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCreatorChannel() {
      try {
        const res = await fetch(`/api/uploads?all=true&ts=${Date.now()}`, {
          cache: "no-store",
        });

        const data = await res.json();
        const uploads: UploadItem[] = Array.isArray(data.uploads)
          ? data.uploads
          : [];

        const creatorVideos = uploads.filter(
          (video) =>
            video.creator.toLowerCase() === creatorName.toLowerCase() &&
            video.status === "published"
        );

        setVideos(creatorVideos);

        const cleanCreatorName = creatorName.trim();

        const { data: profileData, error: profileError } = await supabase
          .from("creator_profiles")
          .select("*")
          .ilike("creator_name", cleanCreatorName)
          .maybeSingle();

        if (profileError) {
          console.error("Profile error:", profileError);
        }

        setProfile(profileData || null);
      } catch (error) {
        console.error("Failed to load creator channel", error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCreatorChannel();
  }, [creatorName]);

  const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0);
  const totalLikes = videos.reduce((sum, video) => sum + (video.likes || 0), 0);

  return (
    <main className="min-h-screen bg-[#f6f6f6] px-6 py-8 text-black">
      <div className="mx-auto max-w-6xl">
        <a href="/" className="text-sm font-semibold text-yellow-600">
          ← Back to Home
        </a>

        <section className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="h-48 bg-gradient-to-r from-black via-gray-800 to-yellow-500">
            <img
              src={profile?.banner_url || "/default-banner.jpg"}
              alt={`${creatorName} banner`}
              onError={(e) => {
                e.currentTarget.src = "/default-banner.jpg";
              }}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="p-8">
            <div className="-mt-20 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#FFD700] text-4xl font-extrabold text-black shadow">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url || "/default-avatar.png"}
                      alt={creatorName}
                      onError={(e) => {
                        e.currentTarget.src = "/default-avatar.png";
                      }}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    creatorName.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <h1 className="text-4xl font-extrabold">{creatorName}</h1>

                  {profile?.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      ✓ Verified Creator
                    </span>
                  )}
                </div>

                <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600">
                  {profile?.bio || "Official NiaTube creator channel."}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 shadow-sm">
                  <p className="text-2xl font-extrabold">{videos.length}</p>
                  <p className="text-sm text-gray-500">Videos</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 shadow-sm">
                  <p className="text-2xl font-extrabold">{totalViews}</p>
                  <p className="text-sm text-gray-500">Views</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 shadow-sm">
                  <p className="text-2xl font-extrabold">{totalLikes}</p>
                  <p className="text-sm text-gray-500">Likes</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-extrabold">Videos by {creatorName}</h2>

          {loading ? (
            <p className="mt-4 text-gray-600">Loading channel...</p>
          ) : videos.length === 0 ? (
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
                <div
                  key={video.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <a
                    href={`/watch/${video.id}`}
                    className="block h-[190px] overflow-hidden bg-gray-200"
                  >
                    <img
                      src={video.thumbnail_url || "/default-thumbnail.jpg"}
                      alt={video.title}
                      onError={(e) => {
                        e.currentTarget.src = "/default-thumbnail.jpg";
                      }}
                      className="h-full w-full object-cover"
                    />
                  </a>

                  <div className="p-5">
                    <h3 className="line-clamp-2 text-lg font-extrabold text-gray-900">
                      {video.title}
                    </h3>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-600">
                      <span>👁️ {video.views || 0} views</span>
                      <span>👍 {video.likes || 0} likes</span>
                    </div>

                    <a
                      href={`/watch/${video.id}`}
                      className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
                    >
                      Watch
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}