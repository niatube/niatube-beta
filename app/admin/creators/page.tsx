"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

type CreatorProfile = {
  id: string;
  creator_name: string;
  email?: string | null;
  country?: string | null;
  verified?: boolean | null;
  created_at?: string | null;
};
type CreatorStats = {
  totalCreators: number;
  creatorsWithUploads: number;
  totalVideos: number;
  publishedVideos: number;
  processingVideos: number;
};

export default function AdminCreatorsPage() {
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadCreators() {
    setLoading(true);

    const response = await fetch("/api/admin/creators", {
      method: "GET",
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      setMessage(result.error || "Could not load creators.");
      setLoading(false);
      return;
    }

    setCreators(result.creators || []);
    setStats(result.stats || null);
    setLoading(false);
  }

  useEffect(() => {
    loadCreators();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-black uppercase tracking-wide text-yellow-600">
          Admin Creators
        </p>

        <h1 className="mt-2 text-4xl font-black text-gray-900">
          Creator Management
        </h1>

        <p className="mt-3 max-w-4xl text-gray-600">
          Monitor creator growth, creator profiles, uploads, and publishing activity.
        </p>

        {message && (
          <p className="mt-6 rounded-xl bg-yellow-50 p-4 text-sm font-bold text-yellow-800">
            {message}
          </p>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Total Creators</p>
            <p className="mt-2 text-3xl font-black text-gray-900">
              {stats?.totalCreators || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Creators With Uploads</p>
            <p className="mt-2 text-3xl font-black text-blue-700">
              {stats?.creatorsWithUploads || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Total Videos</p>
            <p className="mt-2 text-3xl font-black text-gray-900">
              {stats?.totalVideos || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Published Videos</p>
            <p className="mt-2 text-3xl font-black text-green-700">
              {stats?.publishedVideos || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Processing Videos</p>
            <p className="mt-2 text-3xl font-black text-yellow-700">
              {stats?.processingVideos || 0}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            Loading creator management data...
          </div>
        ) : creators.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-8 text-gray-500 shadow-sm">
            No creator profiles found.
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="grid grid-cols-6 gap-4 border-b bg-gray-100 px-5 py-4 text-sm font-black text-gray-700">
  <p>Creator</p>
  <p>Email</p>
  <p>Country</p>
  <p>Verified</p>
  <p>Joined</p>
  <p>Channel</p>
</div>
            {creators.map((creator) => (
              <div
                key={creator.id}
              className="grid grid-cols-6 gap-4 border-b px-5 py-4 text-sm last:border-b-0"
              >
                <p className="font-bold text-gray-900">
                  {creator.creator_name}
                </p>

<p className="text-gray-700">
  {creator.country || "Not set"}
</p>

                <p className="text-gray-700">
                  {creator.verified ? "Verified" : "Not verified"}
                </p>

                <p className="text-gray-700">
                  {creator.created_at
                    ? new Date(creator.created_at).toLocaleDateString()
                    : "Not available"}
                </p>

                <a
                  href={`/channel/${creator.creator_name}`}
                  className="font-bold text-blue-700 underline"
                >
                  Open Channel
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}