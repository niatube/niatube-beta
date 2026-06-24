"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";
import { fallbackVideos } from "@/lib/fallbackVideos";

type Video = {
  id: string;
  title: string;
  creator: string;
  description?: string;
  views?: number;
  thumbnail_url?: string;
  video_url?: string;
  image?: string;
  is_live?: boolean;
  category?: string | null;
  live_status?: string | null;
};

type ChatMessage = {
  id: string;
  username: string;
  message: string;
  type?: string;
  created_at?: string;
};

type VideoComment = {
  id: string;
  video_id: string;
  username: string;
  comment: string;
  created_at?: string;
};

type Tip = {
  id: string;
  creator_name: string;
  amount: number;
  currency_code?: string;
  message?: string;
  created_at?: string;
};
const currencies = [
  { code: "DZD", label: "Algerian Dinar", symbol: "دج" },
  { code: "AOA", label: "Angolan Kwanza", symbol: "Kz" },
  { code: "XOF", label: "West African CFA Franc", symbol: "CFA" },
  { code: "BWP", label: "Botswana Pula", symbol: "P" },
  { code: "BIF", label: "Burundian Franc", symbol: "FBu" },
  { code: "XAF", label: "Central African CFA Franc", symbol: "FCFA" },
  { code: "CVE", label: "Cape Verde Escudo", symbol: "$" },
  { code: "KMF", label: "Comorian Franc", symbol: "CF" },
  { code: "CDF", label: "Congolese Franc", symbol: "FC" },
  { code: "DJF", label: "Djiboutian Franc", symbol: "Fdj" },
  { code: "EGP", label: "Egyptian Pound", symbol: "£" },
  { code: "ERN", label: "Eritrean Nakfa", symbol: "Nfk" },
  { code: "SZL", label: "Eswatini Lilangeni", symbol: "E" },
  { code: "ETB", label: "Ethiopian Birr", symbol: "Br" },
  { code: "GMD", label: "Gambian Dalasi", symbol: "D" },
  { code: "GHS", label: "Ghana Cedi", symbol: "₵" },
  { code: "GNF", label: "Guinean Franc", symbol: "FG" },
  { code: "KES", label: "Kenyan Shilling", symbol: "KSh" },
  { code: "LSL", label: "Lesotho Loti", symbol: "L" },
  { code: "LRD", label: "Liberian Dollar", symbol: "L$" },
  { code: "LYD", label: "Libyan Dinar", symbol: "LD" },
  { code: "MGA", label: "Malagasy Ariary", symbol: "Ar" },
  { code: "MWK", label: "Malawian Kwacha", symbol: "MK" },
  { code: "MRU", label: "Mauritanian Ouguiya", symbol: "UM" },
  { code: "MUR", label: "Mauritian Rupee", symbol: "₨" },
  { code: "MAD", label: "Moroccan Dirham", symbol: "DH" },
  { code: "MZN", label: "Mozambican Metical", symbol: "MT" },
  { code: "NAD", label: "Namibian Dollar", symbol: "N$" },
  { code: "NGN", label: "Nigerian Naira", symbol: "₦" },
  { code: "RWF", label: "Rwandan Franc", symbol: "FRw" },
  { code: "STN", label: "São Tomé and Príncipe Dobra", symbol: "Db" },
  { code: "SCR", label: "Seychellois Rupee", symbol: "₨" },
  { code: "SLE", label: "Sierra Leone Leone", symbol: "Le" },
  { code: "SOS", label: "Somali Shilling", symbol: "Sh" },
  { code: "ZAR", label: "South African Rand", symbol: "R" },
  { code: "SSP", label: "South Sudanese Pound", symbol: "£" },
  { code: "SDG", label: "Sudanese Pound", symbol: "£" },
  { code: "TZS", label: "Tanzanian Shilling", symbol: "TSh" },
  { code: "TND", label: "Tunisian Dinar", symbol: "DT" },
  { code: "UGX", label: "Ugandan Shilling", symbol: "USh" },
  { code: "ZMW", label: "Zambian Kwacha", symbol: "ZK" },
  { code: "ZWL", label: "Zimbabwe Gold", symbol: "ZiG" },

  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "USD", label: "United States Dollar", symbol: "$" },
];

const subscriberMilestones = [10, 100, 1000, 10000, 100000];

function milestoneTitle(milestone: number) {
  return `Milestone unlocked: ${milestone.toLocaleString()} subscribers`;
}

export default function WatchPage() {
  const params = useParams();
  const id = params?.id as string;

  const [video, setVideo] = useState<Video | null>(null);
  const [creatorVideo, setCreatorVideo] = useState<Video | null>(null);
  const [recommendedVideos, setRecommendedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);



  const [username, setUsername] = useState("Viewer");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
const [mutedUsers, setMutedUsers] = useState<string[]>([]);
const isCreatorOrModerator = username === video?.creator;


const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [subscriberGrowth30Days, setSubscriberGrowth30Days] = useState(0);

  const [subscriberCount, setSubscriberCount] = useState(0);
 
  const [subscribed, setSubscribed] = useState(false);
  const [member, setMember] = useState(false);
const [membershipLoading, setMembershipLoading] = useState(false);

  const [comments, setComments] = useState<VideoComment[]>([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [commentName, setCommentName] = useState("Viewer");
  const [commentText, setCommentText] = useState("");

  const [tipAmount, setTipAmount] = useState("");
  const [tipCurrency, setTipCurrency] = useState("");
  const [tipMessage, setTipMessage] = useState("");
  const [tips, setTips] = useState<Tip[]>([]);
  const [tipStatus, setTipStatus] = useState("");

  const [viewerId, setViewerId] = useState("");
  const [liveViewerId, setLiveViewerId] = useState("");

  
  const [watchAd, setWatchAd] = useState<any | null>(null);
  const [watchAdImpressionRecorded, setWatchAdImpressionRecorded] =
  useState(false);

  const [liveAd, setLiveAd] = useState<any | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const visibleMessages = messages.filter(
    (msg) => msg.type !== "system" && msg.username !== "NiaTube System"
  );

  const chatRestricted = !isLive;

  useEffect(() => {
    async function loadViewer() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let stableViewerId =
        user?.id || localStorage.getItem("niatube_viewer_id");

      if (!stableViewerId) {
        stableViewerId = crypto.randomUUID();
        localStorage.setItem("niatube_viewer_id", stableViewerId);
      }

      setViewerId(stableViewerId);
      setLiveViewerId(`live-${crypto.randomUUID()}`);
    }

    loadViewer();
  }, []);

  useEffect(() => {
    async function loadVideo() {
      setLoading(true);
      setCreatorVideo(null);

      const { data } = await supabase
        .from("uploads")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
  const currentViews = data.views || 0;
  const updatedViews = currentViews + 1;

  setVideo({ ...data, views: updatedViews });

  const { data: creatorProfile } = await supabase
    .from("creator_profiles")
    .select("currency_code")
    .eq("creator_name", data.creator)
    .maybeSingle();

  if (creatorProfile?.currency_code) {
    setTipCurrency(creatorProfile.currency_code);
  }

  setIsLive(Boolean(data.is_live));

  await supabase
    .from("uploads")
    .update({ views: updatedViews })
    .eq("id", id);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        const isUuid =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            id
          );

        if (user?.id && isUuid) {
          const { error: watchHistoryError } = await supabase
            .from("watch_history")
            .insert([
              {
                viewer_id: user.id,
                video_id: id,
                progress_seconds: 0,
                completed: false,
              },
            ]);

          if (watchHistoryError) {
            console.error("Watch history insert error:", watchHistoryError);
          }
        } else {
          console.log("Watch history skipped:", {
            loggedIn: Boolean(user?.id),
            isUuid,
            videoId: id,
          });
        }

        const { data: likesData } = await supabase
          .from("video_likes")
          .select("*")
          .eq("video_id", id);

        setLikeCount(likesData?.length || 0);
        setLiked(
          Boolean(likesData?.some((like) => like.user_id === viewerId))
        );

        const { data: subscriptionsData } = await supabase
          .from("creator_subscriptions")
          .select("*")
          .eq("creator_name", data.creator);

        setSubscriberCount(subscriptionsData?.length || 0);
        setSubscribed(
          Boolean(
            subscriptionsData?.some(
              (sub) => sub.subscriber_id === viewerId
            )
          )
        );

        const { data: commentsData } = await supabase
          .from("video_comments")
          .select("*")
          .eq("video_id", id)
          .order("created_at", { ascending: false });

        if (commentsData) setComments(commentsData as VideoComment[]);

        const { data: tipsData } = await supabase
          .from("tips")
          .select("*")
          .eq("creator_name", data.creator)
          .order("created_at", { ascending: false })
          .limit(5);

        if (tipsData) setTips(tipsData as Tip[]);

        const { data: creatorVideos } = await supabase
          .from("uploads")
          .select("*")
          .eq("creator", data.creator)
          .neq("id", id)
          .eq("status", "published")
          .limit(1);

        if (creatorVideos && creatorVideos.length > 0) {
          setCreatorVideo(creatorVideos[0] as Video);
        }

        const { data: recommendedData } = await supabase
          .from("uploads")
          .select("*")
          .neq("id", id)
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(4);

        if (recommendedData) {
          setRecommendedVideos(recommendedData as Video[]);
        }

        const adResponse = await fetch(`/api/ads/watch?ts=${Date.now()}`, {
  cache: "no-store",
});

const adData = await adResponse.json();
setWatchAd(adData.ad || null);
if (Boolean(data.is_live)) {
  const liveResponse = await fetch(
    `/api/ads/live?ts=${Date.now()}`,
    {
      cache: "no-store",
    }
  );

  const liveData = await liveResponse.json();

  setLiveAd(liveData.ad || null);
} else {
  setLiveAd(null);
}
      } else {
        const fallback = fallbackVideos.find((item) => item.id === id);
        setVideo((fallback as Video) || null);
      }

      setLoading(false);
    }

    if (id && viewerId) loadVideo();
  }, [id, viewerId]);
  useEffect(() => {
  async function recordWatchAdImpression() {
    if (!watchAd?.campaign_name || watchAdImpressionRecorded) {
      return;
    }

    try {
      await supabase.from("ad_events").insert({
        ad_id: watchAd.campaign_name,
        event_type: "impression",
        video_id: id,
        placement: "Watch Page",
      });

      setWatchAdImpressionRecorded(true);
    } catch (error) {
      console.error("Failed to record watch ad impression", error);
    }
  }

  recordWatchAdImpression();
}, [watchAd, watchAdImpressionRecorded, id]);

  useEffect(() => {
    async function loadChat() {
      const { data } = await supabase
        .from("live_chat")
        .select("*")
        .order("created_at", { ascending: true });

      if (data) setMessages(data as ChatMessage[]);
    }

    loadChat();

    const channel = supabase
      .channel("live-chat-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_chat" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

      

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!id || !isLive || !liveViewerId) {
      setViewerCount(0);
      return;
    }

    let isMounted = true;

    async function loadViewerCount() {
      const { count, error } = await supabase
        .from("live_viewers")
        .select("*", { count: "exact", head: true })
        .eq("video_id", id);

      if (!error && isMounted) {
        setViewerCount(count || 0);
      }
    }

    async function joinLiveStream() {
      await supabase.from("live_viewers").insert([
        {
          video_id: id,
          viewer_id: liveViewerId,
        },
      ]);

      await loadViewerCount();
    }

    async function leaveLiveStream() {
      await supabase
        .from("live_viewers")
        .delete()
        .eq("video_id", id)
        .eq("viewer_id", liveViewerId);
    }

    joinLiveStream();

    const viewerChannel = supabase
      .channel(`live-viewers-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_viewers" },
        () => {
          loadViewerCount();
        }
      )
      .subscribe();

    const handleBeforeUnload = () => {
      supabase
        .from("live_viewers")
        .delete()
        .eq("video_id", id)
        .eq("viewer_id", liveViewerId);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      isMounted = false;
      window.removeEventListener("beforeunload", handleBeforeUnload);
      leaveLiveStream();
      supabase.removeChannel(viewerChannel);
    };
  }, [id, isLive, liveViewerId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages]);

  async function handleLike() {
    if (!id || !video || !viewerId) return;

    if (liked) {
      const { error } = await supabase
        .from("video_likes")
        .delete()
        .eq("video_id", id)
        .eq("user_id", viewerId);

      if (error) return console.error("Unlike error:", error);

      setLiked(false);
      setLikeCount((prev) => Math.max(prev - 1, 0));
    } else {
      const { error } = await supabase
        .from("video_likes")
        .insert([{ video_id: id, user_id: viewerId }]);

      if (error) return console.error("Like error:", error);

      setLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  }

  async function handleSubscribe() {
    if (!video?.creator || !viewerId) return;

    if (subscribed) {
      const { error } = await supabase
        .from("creator_subscriptions")
        .delete()
        .eq("creator_name", video.creator)
        .eq("subscriber_id", viewerId);

      if (error) {
        console.error("Unsubscribe error:", error);
        return;
      }

      setSubscribed(false);
      setSubscriberCount((prev) => Math.max(prev - 1, 0));
      return;
    }

    const previousSubscriberCount = subscriberCount;
    const newSubscriberCount = subscriberCount + 1;

    const { error } = await supabase.from("creator_subscriptions").insert([
      {
        creator_name: video.creator,
        subscriber_id: viewerId,
      },
    ]);

    if (error) {
      console.error("Subscribe error:", error);
      return;
    }

    await supabase.from("notifications").insert([
      {
        creator_name: video.creator,
        type: "subscriber",
        title: "New subscriber",
        message: "Someone subscribed to your channel.",
      },
    ]);

    const unlockedMilestones = subscriberMilestones.filter(
      (milestone) =>
        previousSubscriberCount < milestone && newSubscriberCount >= milestone
    );

    for (const milestone of unlockedMilestones) {
      const title = milestoneTitle(milestone);

      const { data: existingMilestoneNotification } = await supabase
        .from("notifications")
        .select("id")
        .eq("creator_name", video.creator)
        .eq("type", "milestone")
        .eq("title", title)
        .maybeSingle();

      if (!existingMilestoneNotification) {
        await supabase.from("notifications").insert([
          {
            creator_name: video.creator,
            type: "milestone",
            title,
            message: `Congratulations! You reached ${milestone.toLocaleString()} subscribers on NiaTube.`,
          },
        ]);
      }
    }

    setSubscribed(true);
    setSubscriberCount(newSubscriberCount);
  }
  async function handleJoinMembership() {
  if (!video?.creator || !viewerId) return;

  setMembershipLoading(true);

  const { error } = await supabase
    .from("creator_memberships")
    .insert([
      {
        creator_name: video.creator,
        member_id: viewerId,
        tier_name: "Supporter",
        monthly_price: 5,
        status: "active",
      },
    ]);

  setMembershipLoading(false);

  if (error) {
    console.error("Membership error:", error);
    return;
  }

  setMember(true);

  await supabase.from("notifications").insert([
    {
      creator_name: video.creator,
      type: "membership",
      title: "New Membership",
      message: "A viewer joined your membership program.",
    },
  ]);
}

 async function sendTip() {
  if (!video?.creator) return;

  const amount = Number(tipAmount);

  if (!amount || amount <= 0) {
    setTipStatus("Please enter a valid tip amount.");
    return;
  }

  const reportingCurrency = "USD";
  let fxRateUsed = 1;
  let convertedAmount = amount;

  if (tipCurrency !== reportingCurrency) {
    const { data: fxRateData, error: fxRateError } = await supabase
      .from("fx_rates")
      .select("rate")
      .eq("base_currency", reportingCurrency)
      .eq("target_currency", tipCurrency)
      .single();

    if (fxRateError || !fxRateData?.rate) {
      console.error("FX rate error:", fxRateError);
      setTipStatus("Tip failed. FX rate is not available for this currency.");
      return;
    }

    fxRateUsed = 1 / Number(fxRateData.rate);
    convertedAmount = amount * fxRateUsed;
  }

  const { data, error } = await supabase
    .from("tips")
    .insert([
      {
        creator_name: video.creator,
        amount,
        gross_amount: amount,
        platform_fee: amount * 0.05,
        net_amount: amount * 0.95,
        fee_rate: 0.05,
        currency_code: tipCurrency,
        currency: tipCurrency,
        message: tipMessage.trim(),
        fx_rate_used: fxRateUsed,
        reporting_currency: reportingCurrency,
        converted_amount: convertedAmount,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Tip error:", error);
    setTipStatus("Tip failed. Please check Supabase policies.");
    return;
  }

  if (data) {
    setTips((prev) => [data as Tip, ...prev].slice(0, 5));

    await supabase.from("notifications").insert([
      {
        creator_name: video.creator,
        type: "tip",
        title: "New tip received",
        message: `You received a tip of ${tipCurrency} ${amount}.`,
      },
    ]);

    setTipAmount("");
    setTipMessage("");
    setTipStatus("Tip sent successfully.");
  }
}

  async function sendComment() {
    const finalComment = commentText.trim();
    const finalName = commentName.trim() || "Viewer";

    if (!id || !finalComment) return;

    const { data, error } = await supabase
      .from("video_comments")
      .insert([{ video_id: id, username: finalName, comment: finalComment }])
      .select()
      .single();

    if (error) return console.error("Comment error:", error);

    if (data) setComments((prev) => [data as VideoComment, ...prev]);
    setCommentText("");
  }

 async function sendMessage() {
  if (chatRestricted) return;

  const finalMessage = input.trim();
  if (!finalMessage) return;

  if (mutedUsers.includes(username)) {
    return;
  }

  const { data, error } = await supabase
    .from("live_chat")
    .insert([{ username, message: finalMessage, type: "user" }])
    .select()
    .single();

  if (error) return console.error("Chat send error:", error);

  if (data) setMessages((prev) => [...prev, data as ChatMessage]);
  setInput("");
}

async function deleteLiveChatMessage(messageId: string) {
  const { error } = await supabase
    .from("live_chat")
    .delete()
    .eq("id", messageId);

  if (error) {
    console.error("Delete live chat message error:", error);
    return;
  }

  setMessages((prev) => prev.filter((message) => message.id !== messageId));
}

function muteLiveChatUser(userToMute: string) {
  if (!userToMute) return;

  setMutedUsers((prev) =>
    prev.includes(userToMute) ? prev : [...prev, userToMute]
  );
}

const recordWatchAdClick = async () => {
  if (!watchAd?.landing_url) {
    return;
  }

  const targetUrl = watchAd.landing_url.trim();

  window.open(targetUrl, "_blank", "noopener,noreferrer");

  if (!watchAd?.campaign_name) {
    return;
  }

  try {
    await supabase.from("ad_events").insert({
      ad_id: watchAd.campaign_name,
      event_type: "click",
      video_id: id,
      placement: "Watch Page",
    });
  } catch (error) {
    console.error("Failed to record watch ad click", error);
  }
};

if (loading) {
  return (
    <>
        <Navbar />
        <main className="p-8">Loading video...</main>
      </>
    );
  }

  if (!video) {
    return (
      <>
        <Navbar />
        <main className="p-8">Video not found.</main>
      </>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-[1300px] px-4 py-6">
        
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
          <section>
            <div className="overflow-hidden rounded-2xl bg-black shadow-sm">
            {video.video_url?.includes("iframe.mediadelivery.net") ? (
  <iframe
    src={video.video_url}
    className="aspect-video w-full bg-black"
    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
    allowFullScreen
  />
) : video.video_url ? (
  <video
    controls
    autoPlay={isLive}
    className="aspect-video w-full bg-black"
    poster={
      video.thumbnail_url ||
      video.image ||
      "/default-thumbnail.jpg"
    }
  >
    <source src={video.video_url} type="video/mp4" />
  </video>
) : (
  <img
    src={
      video.thumbnail_url ||
      video.image ||
      "/default-thumbnail.jpg"
    }
    alt={video.title}
    className="aspect-video w-full object-cover"
  />
)}

            </div>

            <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black text-gray-900">
                    {video.title}
                  </h1>

                  <p className="mt-2 text-sm font-semibold text-gray-600">
                    By {video.creator}
                  </p>

                 {isLive ? (
  <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
    <div className="mb-3 inline-flex rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase text-white">
      🔴 Live Now
    </div>

    <div className="grid gap-3 text-sm text-gray-700 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl bg-white p-3 shadow-sm">
        <p className="text-xs font-bold uppercase text-gray-500">
          Live Status
        </p>
        <p className="mt-1 text-lg font-black text-gray-900">
         Active Broadcast
        </p>
      </div>

      <div className="rounded-xl bg-white p-3 shadow-sm">
        <p className="text-xs font-bold uppercase text-gray-500">
          Total Live Views
        </p>
        <p className="mt-1 text-lg font-black text-gray-900">
          {video.views || 0}
        </p>
      </div>

      <div className="rounded-xl bg-white p-3 shadow-sm">
        <p className="text-xs font-bold uppercase text-gray-500">
          Likes
        </p>
        <p className="mt-1 text-lg font-black text-gray-900">
          {likeCount}
        </p>
      </div>

      <div className="rounded-xl bg-white p-3 shadow-sm">
        <p className="text-xs font-bold uppercase text-gray-500">
          Subscribers
        </p>
        <p className="mt-1 text-lg font-black text-gray-900">
          {subscriberCount}
        </p>
      </div>
    </div>
  </div>
) : (
  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
    <span>👁️ {video.views || 0} views</span>
    <span>👍 {likeCount} likes</span>
    <span>👥 {subscriberCount} subscribers</span>
  </div>
)}
                </div>

               <div className="rounded-2xl border border-red-100 bg-red-50 p-4 shadow-sm">
  <p className="text-xs font-black uppercase text-red-700">
    Creator Live Panel
  </p>

  <h2 className="mt-2 text-xl font-black text-gray-900">
    {video.creator}
  </h2>

  <p className="mt-1 text-sm font-semibold text-gray-600">
    {subscriberCount} subscribers
  </p>

  <div className="mt-4 flex flex-wrap gap-3">
    <button
      onClick={handleLike}
      className={`rounded-xl px-5 py-2 text-sm font-black transition ${
        liked
          ? "bg-yellow-400 text-black"
          : "bg-black text-white hover:bg-gray-800"
      }`}
    >
      {liked ? "Liked" : "Like"}
    </button>

    <button
      onClick={handleSubscribe}
      className={`rounded-xl px-5 py-2 text-sm font-black transition ${
        subscribed
          ? "bg-green-600 text-white"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      {subscribed ? "Subscribed" : "Subscribe"}
    </button>

    <a
      href={`/membership/${encodeURIComponent(video.creator)}`}
      className="rounded-xl bg-purple-600 px-5 py-2 text-sm font-black text-white transition hover:bg-purple-700"
    >
      Join Membership
    </a>

    <a
      href={`/channel/${encodeURIComponent(video.creator)}`}
      className="rounded-xl bg-white px-5 py-2 text-sm font-black text-gray-900 ring-1 ring-gray-200 transition hover:bg-gray-50"
    >
      View Channel
    </a>
  </div>
</div>
              </div>

              <div className="mt-6 rounded-2xl bg-gray-50 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-gray-900">
                    Description
                  </h2>

                  <button
                    onClick={() =>
                      setShowFullDescription(!showFullDescription)
                    }
                    className="text-sm font-bold text-blue-600"
                  >
                    {showFullDescription ? "Show less" : "Show more"}
                  </button>
                </div>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-700">
                  {showFullDescription
                    ? video.description || "No description available."
                    : (video.description || "No description available.").slice(
                        0,
                        220
                      )}
                </p>
              </div>

<div className="mt-6 rounded-2xl border bg-white p-5">
  <h2 className="text-xl font-black text-gray-900">
    Support Creator
  </h2>

  <div className="mt-4 grid gap-4 md:grid-cols-2">
    <input
      type="number"
      placeholder="Tip amount"
      value={tipAmount}
      onChange={(e) => setTipAmount(e.target.value)}
      className="rounded-xl border px-4 py-3"
    />

    <select
      value={tipCurrency}
      onChange={(e) => setTipCurrency(e.target.value)}
      className="rounded-xl border px-4 py-3"
    >
      {currencies.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {currency.label}
        </option>
      ))}
    </select>
  </div>

  <textarea
    placeholder="Message to creator (optional)"
    value={tipMessage}
    onChange={(e) => setTipMessage(e.target.value)}
    className="mt-4 min-h-[100px] w-full rounded-xl border px-4 py-3"
  />

  <button
    onClick={sendTip}
    className="mt-4 rounded-xl bg-black px-6 py-3 text-sm font-black text-white hover:bg-gray-800"
  >
    Send Tip
  </button>

  {tipStatus && (
    <p className="mt-3 text-sm font-semibold text-green-700">
      {tipStatus}
    </p>
  )}

  <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
    <h3 className="text-lg font-black text-gray-900">
      Recent Tips to this Creator
    </h3>

    <p className="mt-1 text-sm text-gray-600">
      Viewers are already supporting this creator through tips.
    </p>

    {tips.length === 0 ? (
      <p className="mt-4 text-sm font-semibold text-gray-500">
        No tips have been displayed yet. Be the first to support this creator.
      </p>
    ) : (
      <div className="mt-4 space-y-3">
        {tips.map((tip) => (
          <div key={tip.id} className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm font-black text-gray-900">
              {tip.currency_code || "UNKNOWN"} {tip.amount}
            </p>

            {tip.message && (
              <p className="mt-1 text-sm text-gray-600">
                {tip.message}
              </p>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
</div>
              <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="text-xl font-black text-gray-900">
                  Comments
                </h2>

                <div className="mt-4 grid gap-4">
                  <input
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    placeholder="Your name"
                    className="rounded-xl border px-4 py-3"
                  />

                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="min-h-[110px] rounded-xl border px-4 py-3"
                  />

                  <button
                    onClick={sendComment}
                    className="w-fit rounded-xl bg-black px-5 py-3 text-sm font-black text-white hover:bg-gray-800"
                  >
                    Post Comment
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No comments yet.
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-xl bg-gray-50 p-4"
                      >
                        <p className="text-sm font-black text-gray-900">
                          {comment.username}
                        </p>

                        <p className="mt-1 text-sm leading-6 text-gray-700">
                          {comment.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            {!isLive && (
  <div className="rounded-2xl border-2 border-black bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 p-5 text-gray-900 shadow-sm">
    {watchAd?.ad_image_url && (
      <img
        src={watchAd.ad_image_url}
        alt={watchAd?.headline || watchAd?.advertiser_name || "Sponsored ad"}
        className="mb-4 h-40 w-full rounded-xl object-cover"
      />
    )}

    <p className="inline-block rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold uppercase text-black">
      Sponsored
    </p>

    <h2 className="mt-3 text-xl font-black text-gray-900">
      {watchAd?.headline ||
        watchAd?.advertiser_name ||
        "Advertise on NiaTube"}
    </h2>

    <p className="mt-2 text-sm leading-6 text-gray-800">
      {watchAd?.subheadline ||
        watchAd?.campaign_name ||
        "Reach engaged viewers while they watch NiaTube videos."}
    </p>

    {watchAd?.landing_url ? (
  <button
    type="button"
    onClick={recordWatchAdClick}
    className="mt-4 inline-flex rounded-xl bg-yellow-400 px-4 py-2 text-sm font-black text-black hover:bg-yellow-300"
  >
    {watchAd?.cta_text || "Learn More"}
  </button>
) : !watchAd ? (
      <a
        href="/advertise"
        className="mt-4 inline-flex rounded-xl bg-black px-4 py-2 text-sm font-black text-white hover:bg-gray-800"
      >
        Book Watch Ad Space
      </a>
    ) : null}
  </div>
)}
            {!isLive && (
  <div className="rounded-2xl bg-white p-5 shadow-sm">
    <h2 className="text-xl font-black text-gray-900">
    {video.live_status === "live" || video.live_status === "ended"
  ? "Related Live Events"
  : "Recommended Videos"}
    </h2>

    <div className="mt-5 space-y-4">
      {recommendedVideos.map((recommended) => (
        <a
          key={recommended.id}
          href={`/watch/${recommended.id}`}
          className="flex gap-3 rounded-xl transition hover:bg-gray-50"
        >
          <img
            src={
              recommended.thumbnail_url ||
              recommended.image ||
              "/default-thumbnail.jpg"
            }
            alt={recommended.title}
            className="h-24 w-36 rounded-xl object-cover"
          />

          <div>
            <h3 className="line-clamp-2 text-sm font-black text-gray-900">
              {recommended.title}
            </h3>

            <p className="mt-1 text-xs font-semibold text-gray-600">
              {recommended.creator}
            </p>
          </div>
        </a>
      ))}
    </div>
  </div>
)}

            {creatorVideo && (
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="text-xl font-black text-gray-900">
                  More from {video.creator}
                </h2>

                <a
                  href={`/watch/${creatorVideo.id}`}
                  className="mt-4 block overflow-hidden rounded-2xl border"
                >
                  <img
                    src={
                      creatorVideo.thumbnail_url ||
                      creatorVideo.image ||
                      "/default-thumbnail.jpg"
                    }
                    alt={creatorVideo.title}
                    className="h-48 w-full object-cover"
                  />

                  <div className="p-4">
                    <h3 className="text-base font-black text-gray-900">
                      {creatorVideo.title}
                    </h3>
                  </div>
                </a>
              </div>
            )}

          {isLive && (
  <div className="rounded-2xl bg-white p-5 shadow-sm">
    <h2 className="text-xl font-black text-gray-900">
      Live Chat
    </h2>

    <div className="mt-4 h-[320px] overflow-y-auto rounded-2xl border bg-gray-50 p-4">
      {visibleMessages.length === 0 ? (
        <p className="text-sm text-gray-500">No messages yet.</p>
      ) : (
       visibleMessages.map((msg) => (
  <div
    key={msg.id}
    className="mb-3 flex items-start justify-between gap-3 rounded-xl bg-white px-3 py-2 shadow-sm"
  >
    <div>
      <span className="text-sm font-black text-blue-700">
        {msg.username}:{" "}
      </span>

      <span className="text-sm text-gray-700">
        {msg.message}
      </span>
    </div>

   {isCreatorOrModerator && (
  <div className="flex gap-2">
    <button
      type="button"
      onClick={() => deleteLiveChatMessage(msg.id)}
      className="rounded-lg bg-red-100 px-2 py-1 text-xs font-black text-red-700 hover:bg-red-200"
    >
      Delete
    </button>

    <button
      type="button"
      onClick={() => muteLiveChatUser(msg.username)}
      className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-black text-gray-700 hover:bg-gray-200"
    >
      Mute
    </button>
  </div>
)}


  </div>
))
      )}

      <div ref={chatEndRef} />
    </div>

    <div className="mt-4 grid gap-3">
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Display name"
        className="rounded-xl border px-4 py-3"
      />

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          chatRestricted
            ? "Chat is currently restricted."
            : "Write a message..."
        }
        disabled={chatRestricted}
        className="min-h-[90px] rounded-xl border px-4 py-3"
      />

      <button
        onClick={sendMessage}
        disabled={chatRestricted}
        className={`rounded-xl px-5 py-3 text-sm font-black text-white ${
          chatRestricted ? "bg-gray-400" : "bg-black hover:bg-gray-800"
        }`}
      >
        Send Message
      </button>
    </div>
  </div>
)}
{isLive && (
  <div className="rounded-2xl border-2 border-black bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 p-5 text-gray-900 shadow-sm">
{liveAd?.ad_image_url && (
      <img
        src={liveAd.ad_image_url}
        alt={liveAd?.headline || liveAd?.advertiser_name || "Live Sponsor"}
        className="mb-4 h-40 w-full rounded-xl object-cover"
      />
    )}

    <p className="inline-block rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold uppercase text-black">
      Live Sponsor
    </p>

    <h2 className="mt-3 text-xl font-black text-gray-900">
      {liveAd?.headline ||
        liveAd?.advertiser_name ||
        "Advertise During Live Events"}
    </h2>

    <p className="mt-2 text-sm leading-6 text-gray-800">
      {liveAd?.subheadline ||
        liveAd?.campaign_name ||
        "Put your brand in front of NiaTube viewers during live broadcasts."}
    </p>

    {liveAd?.landing_url ? (
      <a
        href={liveAd.landing_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex rounded-xl bg-yellow-400 px-4 py-2 text-sm font-black text-black hover:bg-yellow-300"
      >
        {liveAd?.cta_text || "Learn More"}
      </a>
    ) : !liveAd ? (
      <a
        href="/advertise"
        className="mt-4 inline-flex rounded-xl bg-black px-4 py-2 text-sm font-black text-white hover:bg-gray-800"
      >
        Book Live Ad Space
      </a>
    ) : null}
  </div>
)}
          </aside>
        </div>
      </div>
    </main>
  );
}