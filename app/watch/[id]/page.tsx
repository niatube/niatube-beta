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
  { code: "NGN", label: "Nigeria Naira", symbol: "₦" },
  { code: "KES", label: "Kenyan Shilling", symbol: "KSh" },
  { code: "GHS", label: "Ghana Cedi", symbol: "₵" },
  { code: "ZAR", label: "South African Rand", symbol: "R" },
  { code: "RWF", label: "Rwandan Franc", symbol: "FRw" },
  { code: "UGX", label: "Ugandan Shilling", symbol: "USh" },
  { code: "TZS", label: "Tanzanian Shilling", symbol: "TSh" },
];

function currencySymbol(code?: string) {
  return currencies.find((item) => item.code === code)?.symbol || code || "";
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

  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscribed, setSubscribed] = useState(false);

  const [comments, setComments] = useState<VideoComment[]>([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [commentName, setCommentName] = useState("Viewer");
  const [commentText, setCommentText] = useState("");

  const [tipAmount, setTipAmount] = useState("");
  const [tipCurrency, setTipCurrency] = useState("NGN");
  const [tipMessage, setTipMessage] = useState("");
  const [tips, setTips] = useState<Tip[]>([]);
  const [tipStatus, setTipStatus] = useState("");

  const [viewerId, setViewerId] = useState("");
  const [liveViewerId, setLiveViewerId] = useState("");
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

      let stableViewerId = user?.id || localStorage.getItem("niatube_viewer_id");

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
        setIsLive(Boolean(data.is_live));

        await supabase
          .from("uploads")
          .update({ views: updatedViews })
          .eq("id", id);

        const { data: likesData } = await supabase
          .from("video_likes")
          .select("*")
          .eq("video_id", id);

        setLikeCount(likesData?.length || 0);
        setLiked(Boolean(likesData?.some((like) => like.user_id === viewerId)));

        const { data: subscriptionsData } = await supabase
          .from("creator_subscriptions")
          .select("*")
          .eq("creator_name", data.creator);

        setSubscriberCount(subscriptionsData?.length || 0);
        setSubscribed(
          Boolean(
            subscriptionsData?.some((sub) => sub.subscriber_id === viewerId)
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
      } else {
        const fallback = fallbackVideos.find((item) => item.id === id);
        setVideo((fallback as Video) || null);
      }

      setLoading(false);
    }

    if (id && viewerId) loadVideo();
  }, [id, viewerId]);

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
    if (!id || !video) return;

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
    if (!video?.creator) return;

    if (subscribed) {
      const { error } = await supabase
        .from("creator_subscriptions")
        .delete()
        .eq("creator_name", video.creator)
        .eq("subscriber_id", viewerId);

      if (error) return console.error("Unsubscribe error:", error);

      setSubscribed(false);
      setSubscriberCount((prev) => Math.max(prev - 1, 0));
    } else {
      const { error } = await supabase
        .from("creator_subscriptions")
        .insert([{ creator_name: video.creator, subscriber_id: viewerId }]);

      if (error) return console.error("Subscribe error:", error);

      setSubscribed(true);
      setSubscriberCount((prev) => prev + 1);
    }
  }

  async function sendTip() {
    if (!video?.creator) return;

    const amount = Number(tipAmount);

    if (!amount || amount <= 0) {
      setTipStatus("Please enter a valid tip amount.");
      return;
    }

    const { data, error } = await supabase
      .from("tips")
      .insert([
        {
          creator_name: video.creator,
          amount,
          currency_code: tipCurrency,
          message: tipMessage.trim(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Tip error:", error);
      setTipStatus("Tip failed. Please check Supabase policies.");
      return;
    }

    if (data) setTips((prev) => [data as Tip, ...prev].slice(0, 5));

    setTipAmount("");
    setTipMessage("");
    setTipStatus(`Tip sent in ${tipCurrency}.`);
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

    const { data, error } = await supabase
      .from("live_chat")
      .insert([{ username, message: finalMessage, type: "user" }])
      .select()
      .single();

    if (error) return console.error("Chat send error:", error);

    if (data) setMessages((prev) => [...prev, data as ChatMessage]);
    setInput("");
  }

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
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f6f6f6]">
        <section className="mx-auto grid max-w-[1300px] grid-cols-1 gap-6 px-6 py-5 lg:grid-cols-[220px_1fr_390px]">
          <aside className="space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                More from {video.creator}
              </h2>

              {creatorVideo ? (
                <>
                  <a
                    href={`/watch/${creatorVideo.id}`}
                    className="mt-3 block overflow-hidden rounded-xl bg-gray-100"
                  >
                    <img
                      src={
                        creatorVideo.thumbnail_url ||
                        creatorVideo.image ||
                        "/default-thumbnail.jpg"
                      }
                      onError={(e) => {
                        e.currentTarget.src = "/default-thumbnail.jpg";
                      }}
                      alt={creatorVideo.title}
                      className="h-32 w-full object-cover"
                    />
                  </a>

                  <p className="mt-3 line-clamp-2 text-sm font-bold text-gray-900">
                    {creatorVideo.title}
                  </p>

                  <p className="mt-1 text-xs text-gray-600">
                    Watch more videos from this creator.
                  </p>

                  <div className="mt-3 flex gap-2">
                    <a
                      href={`/watch/${creatorVideo.id}`}
                      className="rounded-lg bg-black px-4 py-2 text-xs font-bold text-white hover:bg-gray-800"
                    >
                      Watch
                    </a>

                    <a
                      href={`/channel/${encodeURIComponent(video.creator)}`}
                      className="rounded-lg bg-yellow-400 px-4 py-2 text-xs font-bold text-black hover:bg-yellow-300"
                    >
                      Creator Page
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-3 text-sm text-gray-500">
                    More creator videos coming soon.
                  </p>

                  <a
                    href={`/channel/${encodeURIComponent(video.creator)}`}
                    className="mt-3 inline-block rounded-lg bg-yellow-400 px-4 py-2 text-xs font-bold text-black hover:bg-yellow-300"
                  >
                    Visit Creator Page
                  </a>
                </>
              )}
            </div>

            {isLive ? (
  <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase text-yellow-700">
      Sponsored Live Event
    </p>
    <h3 className="mt-1 text-lg font-bold text-gray-900">
      Ad Space Available
    </h3>
    <p className="mt-1 text-sm text-gray-700">
      Promote your brand during NiaTube Live broadcasts.
    </p>
  </div>
) : (
  <div className="rounded-2xl bg-black p-5 text-white shadow-sm">
    <p className="text-xs font-bold uppercase text-yellow-400">
      Sponsored
    </p>
    <h3 className="mt-2 text-xl font-extrabold">
      Advertise on NiaTube
    </h3>
    <p className="mt-2 text-sm text-gray-300">
      Reach Pan-African creators, viewers, and diaspora audiences.
    </p>
    <a
      href="/advertise"
      className="mt-4 inline-block rounded-md bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-300"
    >
      Book Ad Space
    </a>
  </div>
)}
          </aside>

          <section>
            {video.video_url ? (
              video.video_url.includes("iframe.mediadelivery.net") ? (
                <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
                  <iframe
                    src={video.video_url.replace("/play/", "/embed/")}
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                </div>
              ) : (
                <video
                  src={video.video_url}
                  controls
                  className="aspect-video w-full rounded-2xl bg-black object-contain"
                />
              )
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-black text-white">
                NiaTube Live Preview
              </div>
            )}

            <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900">
                {video.title}
              </h1>

              <p className="mt-1 text-sm text-gray-600">
                {video.creator} • {video.views || 0} views • {subscriberCount}{" "}
                subscribers
              </p>

              {video.description && (
                <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                  <p className={showFullDescription ? "" : "line-clamp-3"}>
                    {video.description}
                  </p>

                  {video.description.length > 160 && (
                    <button
                      onClick={() =>
                        setShowFullDescription((prev) => !prev)
                      }
                      className="mt-2 text-sm font-bold text-black hover:underline"
                    >
                      {showFullDescription ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleLike}
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    liked
                      ? "bg-yellow-400 text-black"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  👍 {liked ? "Liked" : "Like"} {likeCount}
                </button>

                <button
                  onClick={handleSubscribe}
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    subscribed
                      ? "bg-black text-white"
                      : "bg-yellow-400 text-black hover:bg-yellow-300"
                  }`}
                >
                  {subscribed ? "Subscribed" : "Subscribe"} {subscriberCount}
                </button>

                {isLive ? (
                  <>
                    <span className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white">
                      🔴 LIVE
                    </span>
                    <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                      {viewerCount} watching
                    </span>
                  </>
                ) : (
                  <span className="rounded-full bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-600">
                    Offline
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Tip Creator</h2>

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px]">
                <input
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  className="rounded-lg border px-3 py-2 text-sm"
                  placeholder="Amount"
                  type="number"
                  min="1"
                />

                <select
                  value={tipCurrency}
                  onChange={(e) => setTipCurrency(e.target.value)}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} — {currency.label}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                value={tipMessage}
                onChange={(e) => setTipMessage(e.target.value)}
                className="mt-3 min-h-[70px] w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Optional message"
              />

              <button
                onClick={sendTip}
                className="mt-3 rounded-lg bg-yellow-400 px-5 py-2 text-sm font-bold text-black"
              >
                Send Tip
              </button>

              {tipStatus && (
                <p className="mt-3 text-sm font-semibold text-green-700">
                  {tipStatus}
                </p>
              )}
            </div>
          </section>

         <aside className="space-y-4">
  {isLive ? (
    <div className="flex h-[600px] flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold text-red-600">🔴 Live Chat</h2>

      <div className="mt-3 flex-1 overflow-y-auto rounded-xl border bg-gray-50 p-3">
        {visibleMessages.length === 0 ? (
          <p className="text-sm text-gray-500">No messages yet.</p>
        ) : (
          visibleMessages.map((msg) => (
            <div key={msg.id} className="mb-3 text-sm">
              <span className="font-bold text-blue-700">
                {msg.username}:{" "}
              </span>
              <span className="text-gray-700">{msg.message}</span>
            </div>
          ))
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="mt-3 space-y-2">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Name"
        />

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder={
            chatRestricted
              ? "Chat is currently restricted."
              : "Write a message..."
          }
          disabled={chatRestricted}
        />

        <button
          onClick={sendMessage}
          disabled={chatRestricted}
          className="w-full rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-black disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
        >
          Send
        </button>
      </div>
    </div>
  ) : (
    <>
      <div className="rounded-2xl bg-black p-5 text-white shadow-sm">
        <p className="text-xs font-bold uppercase text-yellow-400">
          Sponsored
        </p>
        <h2 className="mt-2 text-xl font-extrabold">
          Advertise on NiaTube
        </h2>
        <p className="mt-2 text-sm text-gray-300">
          Reach Pan-African creators, viewers, and diaspora audiences.
        </p>
        <a
          href="/advertise"
          className="mt-4 inline-block rounded-md bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-300"
        >
          Book Ad Space
        </a>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Up Next</h2>

        {recommendedVideos.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            More videos coming soon.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {recommendedVideos.map((item) => (
              <a
                key={item.id}
                href={`/watch/${item.id}`}
                className="flex gap-3 rounded-xl p-2 hover:bg-gray-50"
              >
                <img
                  src={
                    item.thumbnail_url ||
                    item.image ||
                    "/default-thumbnail.jpg"
                  }
                  onError={(e) => {
                    e.currentTarget.src = "/default-thumbnail.jpg";
                  }}
                  alt={item.title}
                  className="h-16 w-24 rounded-lg object-cover"
                />

                <div>
                  <p className="line-clamp-2 text-sm font-bold text-gray-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {item.creator}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  )}
</aside>
        </section>
      </main>
    </>
  );
}