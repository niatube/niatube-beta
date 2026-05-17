"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

type ChatMessage = {
  id: string;
  username: string;
  message: string;
  created_at: string;
  type?: string | null;
};

type LiveSettings = {
  chat_paused: boolean;
  chat_locked: boolean;
  slow_mode: boolean;
  subscriber_only: boolean;
};

export default function LiveChatControlPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [settings, setSettings] = useState<LiveSettings>({
    chat_paused: false,
    chat_locked: false,
    slow_mode: false,
    subscriber_only: false,
  });

  const [username, setUsername] = useState("Creator");
  const [input, setInput] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const chatDisabled = settings.chat_paused || settings.chat_locked;

  useEffect(() => {
    loadMessages();
    loadLiveSettings();

    const chatChannel = supabase
      .channel("live-chat-control")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_chat" },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    const settingsChannel = supabase
      .channel("live-settings-control")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_stream_settings" },
        () => {
          loadLiveSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, []);

  async function loadMessages() {
    const { data, error } = await supabase
      .from("live_chat")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) {
      console.error("Live chat load error:", error);
      setStatusMessage("Could not load live chat.");
      return;
    }

    setMessages((data || []) as ChatMessage[]);
  }

  async function loadLiveSettings() {
    const { data, error } = await supabase
      .from("live_stream_settings")
      .select("chat_paused, chat_locked, slow_mode, subscriber_only")
      .limit(1)
      .single();

    if (error) {
      console.error("Live settings load error:", error);
      setStatusMessage("Could not load live settings.");
      return;
    }

    setSettings(data as LiveSettings);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();

    if (chatDisabled) {
      setStatusMessage("Chat is currently paused or locked.");
      return;
    }

    if (!input.trim()) return;

    const { error } = await supabase.from("live_chat").insert([
      {
        username: username.trim() || "Creator",
        message: input.trim(),
        type: "creator",
      },
    ]);

    if (error) {
      console.error("Live chat send error:", error);
      setStatusMessage("Could not send message.");
      return;
    }

    setInput("");
    setStatusMessage("Message sent.");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <p className="mb-3 text-sm font-black uppercase text-yellow-600">
            Live Chat Control
          </p>

          <h1 className="text-5xl font-black text-gray-900">
            Manage Audience Chat
          </h1>

          <p className="mt-5 max-w-3xl text-lg text-gray-700">
            View live audience messages, send creator messages, and monitor chat
            safety settings.
          </p>

          {statusMessage && (
            <p className="mt-4 text-sm font-bold text-blue-700">
              {statusMessage}
            </p>
          )}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-gray-500">
              Chat Status
            </p>

            <p
              className={`mt-2 text-2xl font-black ${
                chatDisabled ? "text-red-600" : "text-green-700"
              }`}
            >
              {chatDisabled ? "Disabled" : "Active"}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-gray-500">
              Pause Chat
            </p>

            <p className="mt-2 text-2xl font-black text-gray-900">
              {settings.chat_paused ? "On" : "Off"}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-gray-500">
              Emergency Lock
            </p>

            <p className="mt-2 text-2xl font-black text-gray-900">
              {settings.chat_locked ? "Locked" : "Open"}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-gray-500">
              Slow Mode
            </p>

            <p className="mt-2 text-2xl font-black text-gray-900">
              {settings.slow_mode ? "On" : "Off"}
            </p>
          </div>
        </div>

        {settings.subscriber_only && (
          <div className="mt-6 rounded-2xl bg-blue-50 p-5 font-bold text-blue-800">
            Subscriber-only chat is currently active.
          </div>
        )}

        {chatDisabled && (
          <div className="mt-6 rounded-2xl bg-red-50 p-5 font-bold text-red-700">
            {settings.chat_locked
              ? "Chat is locked by moderation."
              : "Chat is paused from Broadcast Controls."}
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900">
              Live Messages
            </h2>

            <div className="mt-6 h-[420px] overflow-y-auto rounded-2xl border bg-gray-50 p-5">
              {messages.length === 0 ? (
                <p className="text-gray-500">No live messages yet.</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="rounded-xl bg-white p-4 shadow-sm"
                    >
                      <p className="font-black text-gray-900">
                        @{msg.username}
                      </p>

                      <p className="mt-2 text-gray-700">{msg.message}</p>

                      <p className="mt-2 text-xs text-gray-400">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900">
              Send Creator Message
            </h2>

            <form onSubmit={sendMessage} className="mt-6 space-y-4">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 font-bold"
                placeholder="Username"
              />

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={chatDisabled}
                className="h-32 w-full rounded-xl border px-4 py-3 disabled:bg-gray-100 disabled:text-gray-400"
                placeholder={
                  chatDisabled
                    ? "Chat is currently disabled."
                    : "Type a creator message..."
                }
              />

              <button
                type="submit"
                disabled={chatDisabled}
                className="w-full rounded-xl bg-yellow-500 px-5 py-3 font-black text-white hover:bg-yellow-600 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {chatDisabled ? "Chat Disabled" : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}