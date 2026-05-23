"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

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
        .order("created_at", { ascending: false });

      const { data: tipsData } = await supabase
        .from("tips")
        .select("*")
        .eq("creator_name", activeCreatorName)
        .order("created_at", { ascending: false });

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

  const totalWatchHours = uploads.reduce((sum, upload) => {
    const views = Number(upload.views || 0);
    const duration = Number(upload.duration_seconds || 0);
    return sum + (views * duration) / 3600;
  }, 0);

  const totalTips = tips.reduce((sum, tip) => sum + Number(tip.amount || 0), 0);

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
          Review your submitted videos, subscribers, watch hours, earnings, tips,
          payout activity, and creator performance.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Submitted Videos</p>
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

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900">
            Submitted Videos
          </h2>

          {uploads.length === 0 ? (
            <p className="mt-4 text-gray-500">No videos submitted yet.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {uploads.map((upload) => {
                const videoWatchHours =
                  (Number(upload.views || 0) *
                    Number(upload.duration_seconds || 0)) /
                  3600;

                return (
                  <div
                    key={upload.id}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm"
                  >
                    <h3 className="text-lg font-black text-gray-900">
                      {upload.title}
                    </h3>

                    <p className="mt-2 text-sm text-gray-600">
                      Status: <strong>{upload.status || "pending"}</strong>
                    </p>

                    <p className="text-sm text-gray-600">
                      Views: {upload.views || 0}
                    </p>

                    <p className="text-sm text-gray-600">
                      Watch Hours: {videoWatchHours.toFixed(1)}
                    </p>

                    <p className="text-sm text-gray-600">
                      Submitted:{" "}
                      {upload.created_at
                        ? new Date(upload.created_at).toLocaleString()
                        : "Not available"}
                    </p>

                    {upload.thumbnail_url && (
                      <img
                        src={upload.thumbnail_url}
                        alt={upload.title}
                        className="mt-4 h-40 w-full rounded-xl object-cover"
                      />
                    )}

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
                );
              })}
            </div>
          )}
        </div>

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
          <h2 className="text-2xl font-black text-gray-900">
            Payout Requests
          </h2>

          {payouts.length === 0 ? (
            <p className="mt-4 text-gray-500">No payout requests yet.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="rounded-2xl border bg-gray-50 p-5"
                >
                  <p className="font-bold">Amount: {payout.amount}</p>
                  <p className="text-sm text-gray-600">
                    Status: {payout.status || "pending"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}