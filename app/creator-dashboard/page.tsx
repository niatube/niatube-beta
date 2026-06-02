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
  currency?: string;
  message?: string;
  created_at?: string;
  gross_amount?: number;
  platform_fee?: number;
  net_amount?: number;
};
type FxRate = {
  id?: string;
  base_currency: string;
  target_currency: string;
  rate: number;
  updated_at?: string;
  source?: string | null;
};
type PayoutRequest = {
  id: string;
  creator_name: string;
  amount: number;
  currency_code?: string;
  status?: string;
  requested_at?: string;
};

type NotificationItem = {
  id: string;
  creator_name: string;
  type: string;
  title: string;
  message: string;
  read?: boolean;
  created_at?: string;
};
function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  fxRates: FxRate[]
) {
  if (!amount) return 0;
  if (fromCurrency === toCurrency) return amount;

  const directRate = fxRates.find(
    (rate) =>
      rate.base_currency === fromCurrency &&
      rate.target_currency === toCurrency
  );

  if (directRate) {
    return amount * Number(directRate.rate || 0);
  }

  const inverseRate = fxRates.find(
    (rate) =>
      rate.base_currency === toCurrency &&
      rate.target_currency === fromCurrency
  );

  if (inverseRate) {
    return amount / Number(inverseRate.rate || 1);
  }

  if (fromCurrency !== "USD" && toCurrency !== "USD") {
    const toUsd = convertAmount(amount, fromCurrency, "USD", fxRates);
    return convertAmount(toUsd, "USD", toCurrency, fxRates);
  }

  return 0;
}

function formatAmount(value: number) {
  return Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}
export default function CreatorDashboardPage() {
  const router = useRouter();
   const [fxRates, setFxRates] = useState<FxRate[]>([]);
  const [creatorName, setCreatorName] = useState("Creator");
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [nativeSubscriberCount, setNativeSubscriberCount] = useState(0);
const [migratedSubscriberCount, setMigratedSubscriberCount] = useState(0);
const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creatorSince, setCreatorSince] = useState("");
  const [creatorCountry, setCreatorCountry] = useState("Not set");
const [creatorCurrency, setCreatorCurrency] = useState("Not set");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayoutCurrency, setSelectedPayoutCurrency] = useState("NGN");

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
       .select("creator_name,email,country,currency_code")
.ilike("email", user.email || "")
.maybeSingle();

      if (profileByEmail?.creator_name) {
        activeCreatorName = profileByEmail.creator_name;
      }

      setCreatorName(activeCreatorName);
      setCreatorCountry(profileByEmail?.country || "Not set");
const profileCurrency = profileByEmail?.currency_code || "Not set";

setCreatorCurrency(profileCurrency);

if (profileCurrency !== "Not set") {
  setSelectedPayoutCurrency(profileCurrency);
}

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

        const { data: creatorProfile } = await supabase
  .from("creator_profiles")
  .select("migrated_subscribers")
  .eq("creator_name", activeCreatorName)
  .maybeSingle();

const migratedSubscribers =
  Number(creatorProfile?.migrated_subscribers || 0);

      const { data: notificationsData } = await supabase
        .from("notifications")
        .select("*")
        .eq("creator_name", activeCreatorName)
        .order("created_at", { ascending: false })
        .limit(8);
      const { data: fxData } = await supabase
  .from("fx_rates")
  .select("*");

setFxRates((fxData || []) as FxRate[]);

      setUploads((uploadsData || []) as Upload[]);
      setTips((tipsData || []) as Tip[]);
      setPayouts((payoutData || []) as PayoutRequest[]);
      setNotifications((notificationsData || []) as NotificationItem[]);
      const nativeSubscribers = subscriberData?.length || 0;
const totalSubscribers = nativeSubscribers + migratedSubscribers;

setNativeSubscriberCount(nativeSubscribers);
setMigratedSubscriberCount(migratedSubscribers);
setSubscriberCount(totalSubscribers);

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function markNotificationsAsRead() {
    if (notifications.length === 0) return;

    const unreadIds = notifications
      .filter((notification) => !notification.read)
      .map((notification) => notification.id);

    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", unreadIds);

    if (error) {
      console.error("Notification update error:", error);
      return;
    }

    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  }

  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.read
  ).length;

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

  const tipTotalsByCurrency = useMemo(() => {
  const totals: Record<string, number> = {};

  tips.forEach((tip) => {
    const currency = tip.currency_code || tip.currency || "UNKNOWN";
    const gross = Number(tip.gross_amount ?? tip.amount ?? 0);
    const fee = Number(tip.platform_fee ?? gross * 0.05);
    const net = Number(tip.net_amount ?? gross - fee);

    totals[currency] = (totals[currency] || 0) + net;
  });

  return Object.entries(totals)
    .map(([currency, amount]) => ({ currency, amount }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
}, [tips]);

const convertedCreatorNetUsd = useMemo(() => {
  return tipTotalsByCurrency.reduce((sum, item) => {
    return (
      sum +
      convertAmount(
        item.amount,
        item.currency,
        "USD",
        fxRates
      )
    );
  }, 0);
}, [tipTotalsByCurrency, fxRates]);

  const selectedCurrencyTotal =
    tipTotalsByCurrency.find(
      (item) => item.currency === selectedPayoutCurrency
    )?.amount || 0;

  useEffect(() => {
    if (tipTotalsByCurrency.length === 0) return;

    const selectedCurrencyExists = tipTotalsByCurrency.some(
      (item) => item.currency === selectedPayoutCurrency
    );

    if (!selectedCurrencyExists) {
      setSelectedPayoutCurrency(tipTotalsByCurrency[0].currency);
    }
  }, [tipTotalsByCurrency, selectedPayoutCurrency]);

  const topVideo = uploads.reduce<Upload | null>((top, upload) => {
    if (!top) return upload;
    return Number(upload.views || 0) > Number(top.views || 0) ? upload : top;
  }, null);

  const subscriberMilestones = [100, 1000, 10000, 100000];

  const nextSubscriberMilestone =
    subscriberMilestones.find((milestone) => subscriberCount < milestone) ||
    subscriberMilestones[subscriberMilestones.length - 1];

  const previousSubscriberMilestone =
    [...subscriberMilestones]
      .reverse()
      .find((milestone) => subscriberCount >= milestone) || 0;

  const progressToNextMilestone = Math.min(
    100,
    Math.round((subscriberCount / nextSubscriberMilestone) * 100)
  );

  const subscribersRemaining = Math.max(
    0,
    nextSubscriberMilestone - subscriberCount
  );

  const creatorBadges = [
    {
      title: "Rising Creator",
      unlocked: subscriberCount >= 10,
      description: "Unlocked after reaching 10 subscribers.",
      icon: "🌱",
    },
    {
      title: "Verified Creator",
      unlocked: subscriberCount >= 100,
      description: "Unlocked after reaching 100 subscribers.",
      icon: "✅",
    },
    {
      title: "Trending Creator",
      unlocked: totalViews >= 1000,
      description: "Unlocked after reaching 1,000 total views.",
      icon: "🔥",
    },
  ];

  const milestoneCards = [
    {
      title: "100 Subscribers",
      unlocked: subscriberCount >= 100,
      description: "First serious audience milestone.",
    },
    {
      title: "1K Subscribers",
      unlocked: subscriberCount >= 1000,
      description: "Creator growth credibility milestone.",
    },
    {
      title: "10K Subscribers",
      unlocked: subscriberCount >= 10000,
      description: "Strong regional creator milestone.",
    },
    {
      title: "100K Subscribers",
      unlocked: subscriberCount >= 100000,
      description: "Major platform creator milestone.",
    },
  ];

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
    return tipTotalsByCurrency.map((item) => ({
      name: item.currency,
      amount: item.amount,
    }));
  }, [tipTotalsByCurrency]);

  const sortedUploads = useMemo(() => {
    return [...uploads].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
  }, [uploads]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedUploads.length / videosPerPage)
  );

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
           <div className="mt-5 grid gap-4 md:grid-cols-3">
  <div className="rounded-2xl bg-white p-5 shadow-sm">
    <p className="text-sm font-bold text-gray-500">Creator Country</p>
    <p className="mt-2 text-2xl font-black text-gray-900">
      {creatorCountry}
    </p>
  </div>

  <div className="rounded-2xl bg-white p-5 shadow-sm">
    <p className="text-sm font-bold text-gray-500">Default Currency</p>
    <p className="mt-2 text-2xl font-black text-gray-900">
      {creatorCurrency}
    </p>
  </div>

  <div className="rounded-2xl bg-white p-5 shadow-sm">
    <p className="text-sm font-bold text-gray-500">Financial Profile</p>
    <p className="mt-2 text-sm font-semibold text-gray-700">
      Country and currency are used for future tips, payouts, and creator wallet routing.
    </p>
  </div>
</div>   
        <div className="mt-4 flex flex-wrap gap-3">
          {creatorBadges.map((badge) => (
            <span
              key={badge.title}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                badge.unlocked
                  ? "bg-yellow-400 text-black"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {badge.icon}{" "}
              {badge.unlocked ? badge.title : `Locked: ${badge.title}`}
            </span>
          ))}
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Notification Center
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                {unreadNotificationCount} unread alert
                {unreadNotificationCount === 1 ? "" : "s"} for tips,
                subscribers, payouts, and milestones.
              </p>
            </div>

            <button
              onClick={markNotificationsAsRead}
              disabled={unreadNotificationCount === 0}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Mark all as read
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5">
              <p className="font-bold text-gray-800">No notifications yet.</p>

              <p className="mt-1 text-sm text-gray-600">
                New subscriber, tip, payout, and milestone alerts will appear
                here.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-2xl border p-5 ${
                    notification.read
                      ? "border-gray-200 bg-gray-50"
                      : "border-yellow-300 bg-yellow-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-gray-500">
                        {notification.type}
                      </p>

                      <h3 className="mt-1 text-lg font-black text-gray-900">
                        {notification.title}
                      </h3>
                    </div>

                    {!notification.read && (
                      <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                        New
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    {notification.message}
                  </p>

                  <p className="mt-3 text-xs font-semibold text-gray-500">
                    {notification.created_at
                      ? new Date(notification.created_at).toLocaleString()
                      : "Just now"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3 xl:grid-cols-7">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Videos Uploaded</p>
            <p className="mt-2 text-3xl font-black">{uploads.length}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
           <p className="text-sm font-bold text-gray-500">
  Total Subscribers
</p>

<p className="mt-2 text-3xl font-black">
  {subscriberCount}
</p>

<p className="mt-2 text-xs text-gray-500">
  {migratedSubscriberCount.toLocaleString()} migrated •{" "}
  {nativeSubscriberCount.toLocaleString()} native
</p>
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
           <p className="text-sm font-bold text-gray-500">Currencies Held</p>
           <p className="mt-2 text-3xl font-black">
              {tipTotalsByCurrency.length}
           </p>
         <p className="mt-2 text-xs text-gray-500">
          Net wallet currencies
        </p>
        </div>
        </div>
<div className="rounded-2xl bg-white p-5 shadow-sm">
  <p className="text-sm font-bold text-gray-500">
    Creator Net Earnings (USD)
  </p>

  <p className="mt-2 text-3xl font-black">
    USD {convertedCreatorNetUsd.toFixed(2)}
  </p>

  <p className="mt-2 text-xs text-gray-500">
    Converted using approved FX rates
  </p>
</div>

          <div className="mt-8 rounded-3xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
  <h2 className="text-2xl font-black text-gray-900">
    Wallet Summary
  </h2>

  <p className="mt-2 text-sm text-gray-700">
    This summary shows net creator wallet activity after NiaTube’s platform fee.
    FX conversion happens only when a payout or NiaCredit conversion is requested.
  </p>

  <div className="mt-5 grid gap-4 md:grid-cols-3">
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-gray-500">Currencies Held</p>
      <p className="mt-2 text-3xl font-black text-gray-900">
        {tipTotalsByCurrency.length}
      </p>
    </div>

    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-gray-500">Lifetime Tips</p>
      <p className="mt-2 text-3xl font-black text-gray-900">
        {tips.length}
      </p>
    </div>

    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-gray-500">
        Pending Payout Requests
      </p>
      <p className="mt-2 text-3xl font-black text-gray-900">
        {payouts.filter((payout) => payout.status === "pending").length}
      </p>
    </div>
  </div>
</div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900">
            Creator Wallet Balances
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Wallet balances show the creator’s net earnings after NiaTube’s platform fee. Balances remain separated by currency until an approved FX/NiaCredit conversion or local payout is requested.
          </p>

          {tipTotalsByCurrency.length === 0 ? (
            <p className="mt-4 text-gray-500">No tips received yet.</p>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {tipTotalsByCurrency.map((item) => (
                <div
                  key={item.currency}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                >
                  <p className="text-sm font-bold text-gray-500">
                    {item.currency}
                  </p>

                  <p className="mt-2 text-3xl font-black text-gray-900">
                    {item.amount}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                  Net wallet balance before FX conversion
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Creator Growth Milestone
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                {subscriberCount} subscribers • {subscribersRemaining} more to
                reach {nextSubscriberMilestone.toLocaleString()} subscribers
              </p>
            </div>

            <span className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white">
              Next: {nextSubscriberMilestone.toLocaleString()} subscribers
            </span>
          </div>

          <div className="mt-6 h-4 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-yellow-400 transition-all"
              style={{ width: `${progressToNextMilestone}%` }}
            />
          </div>

          <div className="mt-3 flex justify-between text-xs font-bold text-gray-500">
            <span>{previousSubscriberMilestone.toLocaleString()}</span>
            <span>{progressToNextMilestone}% complete</span>
            <span>{nextSubscriberMilestone.toLocaleString()}</span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {milestoneCards.map((milestone) => (
              <div
                key={milestone.title}
                className={`rounded-2xl border p-5 ${
                  milestone.unlocked
                    ? "border-yellow-300 bg-yellow-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <p className="text-2xl">{milestone.unlocked ? "🏆" : "🔒"}</p>

                <h3 className="mt-3 text-lg font-black text-gray-900">
                  {milestone.title}
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  {milestone.description}
                </p>

                <p
                  className={`mt-3 text-sm font-bold ${
                    milestone.unlocked ? "text-green-700" : "text-gray-500"
                  }`}
                >
                  {milestone.unlocked ? "Unlocked" : "Locked"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {creatorBadges.map((badge) => (
              <div
                key={badge.title}
                className={`rounded-2xl border p-5 ${
                  badge.unlocked
                    ? "border-green-300 bg-green-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <p className="text-2xl">{badge.icon}</p>

                <h3 className="mt-3 text-lg font-black text-gray-900">
                  {badge.title}
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  {badge.description}
                </p>

                <p
                  className={`mt-3 text-sm font-bold ${
                    badge.unlocked ? "text-green-700" : "text-gray-500"
                  }`}
                >
                  {badge.unlocked ? "Badge active" : "Badge locked"}
                </p>
              </div>
            ))}
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
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#2563eb"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="likes"
                    stroke="#16a34a"
                    strokeWidth={3}
                  />
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
                  <Area
                    type="monotone"
                    dataKey="watchHours"
                    stroke="#7c3aed"
                    fill="#c4b5fd"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900">
            Tips Revenue Analytics by Currency
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Payout Requests
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Request payouts by currency. Mixed-currency payouts require a
                future FX/NiaCredit conversion layer.
              </p>
            </div>

            {tipTotalsByCurrency.length > 0 && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={selectedPayoutCurrency}
                  onChange={(e) => setSelectedPayoutCurrency(e.target.value)}
                  className="rounded-xl border px-4 py-2 text-sm font-bold"
                >
                  {tipTotalsByCurrency.map((item) => (
                    <option key={item.currency} value={item.currency}>
                      {item.currency} — {item.amount}
                    </option>
                  ))}
                </select>

                <button
                  onClick={async () => {
                    if (selectedCurrencyTotal <= 0) {
                      alert("No funds available for this currency.");
                      return;
                    }

                    const { error } = await supabase
                      .from("payout_requests")
                      .insert([
                        {
                          creator_name: creatorName,
                          amount: selectedCurrencyTotal,
                          currency_code: selectedPayoutCurrency,
                          status: "pending",
                        },
                      ]);

                    if (error) {
                      console.error(error);
                      alert("Payout request failed.");
                      return;
                    }

                    await supabase.from("notifications").insert([
                      {
                        creator_name: creatorName,
                        type: "payout",
                        title: "Payout request submitted",
                        message: `Your payout request for ${selectedPayoutCurrency} ${selectedCurrencyTotal} has been submitted for review.`,
                      },
                    ]);

                    alert(
                      `Payout request submitted for ${selectedPayoutCurrency} ${selectedCurrencyTotal}.`
                    );
                    window.location.reload();
                  }}
                  className="rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800"
                >
                  Request {selectedPayoutCurrency} Payout
                </button>
              </div>
            )}
          </div>

          {payouts.length === 0 ? (
            <p className="mt-4 text-gray-500">No payout requests yet.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="rounded-2xl border bg-gray-50 p-5"
                >
                  <p className="font-bold">
                    Amount: {payout.currency_code || "UNKNOWN"}{" "}
                    {payout.amount}
                  </p>
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
                <div
                  key={tip.id}
                  className="rounded-2xl border bg-gray-50 p-5"
                >
                  <p className="font-bold">
                    {tip.currency_code || "UNKNOWN"} {tip.amount}
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
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
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
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
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