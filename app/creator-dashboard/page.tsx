"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";

type Upload = {
  id: string;
  title: string;
  creator: string;
  status?: string;
  views?: number;
  likes?: number;
  duration_seconds?: number;
  created_at?: string;
  thumbnail_url?: string;
};

type Tip = {
  id: string;
  creator_name: string;
  amount: number;
  currency_code?: string;
  message?: string;
  created_at?: string;
};

type PayoutRequest = {
  id: string;
  creator_name: string;
  amount: number;
  status?: string;
  requested_at?: string;
};

export default function CreatorDashboardPage() {
  const router = useRouter();

  const [creatorName, setCreatorName] = useState("Creator");
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creatorSince, setCreatorSince] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const videosPerPage = 6;

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      if (user.created_at) {
        setCreatorSince(
          new Date(user.created_at).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        );
      }

      let activeCreatorName =
        user.user_metadata?.creator_name ||
        user.email?.split("@")[0] ||
        "Creator";

      const { data: profileByEmail } = await supabase
        .from("creator_profiles")
        .select("creator_name,email")
        .eq("email", user.email)
        .maybeSingle();

      if (profileByEmail?.creator_name) {
        activeCreatorName = profileByEmail.creator_name;
      }

      setCreatorName(activeCreatorName);

      const { data: uploadsData } = await supabase
        .from("uploads")
        .select("*")
        .eq("creator", activeCreatorName)
        .order("created_at", { ascending: true });

      const { data: tipsData } = await supabase
        .from("tips")
        .select("*")
        .eq("creator_name", activeCreatorName)
        .order("created_at", { ascending: true });

      const { data: payoutData } = await supabase
        .from("payout_requests")
        .select("*")
        .eq("creator_name", activeCreatorName)
        .order("requested_at", { ascending: false });

      const { data: subscriberData } = await supabase
        .from("creator_subscriptions")
        .select("*")
        .eq("creator_name", activeCreatorName);

      setUploads((uploadsData || []) as Upload[]);
      setTips((tipsData || []) as Tip[]);
      setPayouts((payoutData || []) as PayoutRequest[]);
      setSubscriberCount(subscriberData?.length || 0);

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  const totalViews = uploads.reduce(
    (sum, upload) => sum + Number(upload.views || 0),
    0
  );

  const totalLikes = uploads.reduce(
    (sum, upload) => sum + Number(upload.likes || 0),
    0
  );

  const totalWatchHours = uploads.reduce((sum, upload) => {
    const views = Number(upload.views || 0);
    const duration = Number(upload.duration_seconds || 0);
    return sum + (views * duration) / 3600;
  }, 0);

  const totalTips = tips.reduce(
    (sum, tip) => sum + Number(tip.amount || 0),
    0
  );

  const topVideo = uploads.reduce<Upload | null>((top, upload) => {
    if (!top) return upload;
    return Number(upload.views || 0) > Number(top.views || 0) ? upload : top;
  }, null);

  const analyticsData = useMemo(() => {
    return uploads.map((upload, index) => ({
      name: `Video ${index + 1}`,
      views: Number(upload.views || 0),
      likes: Number(upload.likes || 0),
      watchHours:
        (Number(upload.views || 0) * Number(upload.duration_seconds || 0)) /
        3600,
    }));
  }, [uploads]);

  const tipsChartData = useMemo(() => {
    return tips.map((tip, index) => ({
      name: `Tip ${index + 1}`,
      amount: Number(tip.amount || 0),
    }));
  }, [tips]);

  const sortedUploads = useMemo(() => {
    return [...uploads].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
  }, [uploads]);

  const totalPages = Math.max(1, Math.ceil(sortedUploads.length / videosPerPage));

  const paginatedUploads = sortedUploads.slice(
    (currentPage - 1) * videosPerPage,
    currentPage * videosPerPage
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-8">Loading creator dashboard...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-4xl font-black text-gray-900">
          Welcome, {creatorName}
        </h1>

        <p className="mt-2 text-gray-600">
          Review your submitted videos, subscribers, watch hours, earnings,
          tips, payout activity, and creator performance.
        </p>

        {creatorSince && (
          <p className="mt-2 text-sm font-semibold text-gray-500">
            Creator Since: {creatorSince}
          </p>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-3 xl:grid-cols-7">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Videos Uploaded</p>
            <p className="mt-2 text-3xl font-black">{uploads.length}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Subscribers</p>
            <p className="mt-2 text-3xl font-black">{subscriberCount}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Total Views</p>
            <p className="mt-2 text-3xl font-black">{totalViews}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Total Likes</p>
            <p className="mt-2 text-3xl font-black">{totalLikes}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Watch Hours</p>
            <p className="mt-2 text-3xl font-black">
              {totalWatchHours.toFixed(1)}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Tips Received</p>
            <p className="mt-2 text-3xl font-black">{tips.length}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Total Tip Amount</p>
            <p className="mt-2 text-3xl font-black">{totalTips}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900">
              Views & Likes Analytics
            </h2>

            <div className="mt-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#2563eb" strokeWidth={3} />
                  <Line type="monotone" dataKey="likes" stroke="#16a34a" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900">
              Watch Hours Trend
            </h2>

            <div className="mt-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="watchHours" stroke="#7c3aed" fill="#c4b5fd" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900">
            Tips Revenue Analytics
          </h2>

          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tipsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900">
              Payout Requests
            </h2>

            <button
              onClick={async () => {
                const { error } = await supabase.from("payout_requests").insert([
                  {
                    creator_name: creatorName,
                    amount: totalTips,
                    status: "pending",
                  },
                ]);

                if (error) {
                  console.error(error);
                  alert("Payout request failed.");
                  return;
                }

                alert("Payout request submitted.");
                window.location.reload();
              }}
              className="rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800"
            >
              Request Payout
            </button>
          </div>

          {payouts.length === 0 ? (
            <p className="mt-4 text-gray-500">No payout requests yet.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {payouts.map((payout) => (
                <div key={payout.id} className="rounded-2xl border bg-gray-50 p-5">
                  <p className="font-bold">Amount: {payout.amount}</p>
                  <p className="text-sm text-gray-600">
                    Status: {payout.status || "pending"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {topVideo && (
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900">
              Top Performing Video
            </h2>

            <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-center">
              {topVideo.thumbnail_url && (
                <img
                  src={topVideo.thumbnail_url}
                  alt={topVideo.title}
                  className="h-40 w-full rounded-2xl object-cover md:w-64"
                />
              )}

              <div>
                <h3 className="text-xl font-black text-gray-900">
                  {topVideo.title}
                </h3>

                <p className="mt-2 text-sm text-gray-600">
                  {topVideo.views || 0} views • {topVideo.likes || 0} likes
                </p>

                <a
                  href={`/watch/${topVideo.id}`}
                  className="mt-4 inline-block rounded-xl bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
                >
                  Watch Top Video
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900">Tips</h2>

          {tips.length === 0 ? (
            <p className="mt-4 text-gray-500">No tips received yet.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {tips.map((tip) => (
                <div key={tip.id} className="rounded-2xl border bg-gray-50 p-5">
                  <p className="font-bold">
                    {tip.amount} {tip.currency_code || ""}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {tip.message || "No message"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Submitted Videos
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Showing {paginatedUploads.length} of {uploads.length} videos
              </p>
            </div>

            {uploads.length > videosPerPage && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border px-4 py-2 text-sm font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-sm font-bold text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-lg border px-4 py-2 text-sm font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {uploads.length === 0 ? (
            <p className="mt-4 text-gray-500">No videos submitted yet.</p>
          ) : (
            <>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedUploads.map((upload) => {
                  const videoWatchHours =
                    (Number(upload.views || 0) *
                      Number(upload.duration_seconds || 0)) /
                    3600;

                  return (
                    <div
                      key={upload.id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >
                      {upload.thumbnail_url && (
                        <img
                          src={upload.thumbnail_url}
                          alt={upload.title}
                          className="h-[180px] w-full object-cover"
                        />
                      )}

                      <div className="p-4">
                        <h3 className="line-clamp-2 text-base font-black text-gray-900">
                          {upload.title}
                        </h3>

                        <div className="mt-3 space-y-1 text-sm text-gray-600">
                          <p>
                            Status:{" "}
                            <strong>{upload.status || "pending"}</strong>
                          </p>

                          <p>Views: {upload.views || 0}</p>
                          <p>Likes: {upload.likes || 0}</p>
                          <p>Watch Hours: {videoWatchHours.toFixed(1)}</p>

                          <p>
                            Submitted:{" "}
                            {upload.created_at
                              ? new Date(upload.created_at).toLocaleDateString()
                              : "Not available"}
                          </p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <a
                            href={`/watch/${upload.id}`}
                            className="rounded-lg bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
                          >
                            Watch
                          </a>

                          <a
                            href={`/channel/${encodeURIComponent(
                              upload.creator || ""
                            )}`}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100"
                          >
                            View Channel
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {uploads.length > videosPerPage && (
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border px-4 py-2 text-sm font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="text-sm font-bold text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-lg border px-4 py-2 text-sm font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}