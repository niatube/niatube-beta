"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

type LiveSettings = {
  id: string;
  slow_mode: boolean;
  subscriber_only: boolean;
  chat_locked: boolean;
  spam_protection: boolean;
  ai_detection: boolean;
};

const initialFlaggedMessages = [
  {
    id: 1,
    user: "PanAfricaFan",
    message: "Spam message detected with suspicious links.",
    time: "2 min ago",
  },
  {
    id: 2,
    user: "Viewer2026",
    message: "Offensive language flagged for review.",
    time: "5 min ago",
  },
  {
    id: 3,
    user: "LiveGuest",
    message: "Repeated message flooding detected.",
    time: "7 min ago",
  },
];

export default function ModerationPage() {
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [slowMode, setSlowMode] = useState(false);
  const [subscriberChat, setSubscriberChat] = useState(false);
  const [spamProtection, setSpamProtection] = useState(true);
  const [chatLocked, setChatLocked] = useState(false);
  const [aiDetection, setAiDetection] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [flaggedMessages, setFlaggedMessages] = useState(initialFlaggedMessages);

  useEffect(() => {
    loadLiveSettings();
  }, []);

  async function loadLiveSettings() {
    const { data, error } = await supabase
      .from("live_stream_settings")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      console.error("Moderation settings load error:", error);
      setStatusMessage("Could not load moderation settings.");
      return;
    }

    const settings = data as LiveSettings;

    setSettingsId(settings.id);
    setSlowMode(settings.slow_mode);
    setSubscriberChat(settings.subscriber_only);
    setChatLocked(settings.chat_locked);
    setSpamProtection(settings.spam_protection);
    setAiDetection(settings.ai_detection);
  }

  async function updateLiveSettings(updates: Partial<LiveSettings>) {
    if (!settingsId) {
      setStatusMessage("Settings are still loading. Try again.");
      return false;
    }

    const { error } = await supabase
      .from("live_stream_settings")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", settingsId);

    if (error) {
      console.error("Moderation settings update error:", error);
      setStatusMessage("Could not update moderation settings.");
      return false;
    }

    setStatusMessage("Moderation settings updated.");
    return true;
  }

  async function toggleSlowMode() {
    const next = !slowMode;
    const saved = await updateLiveSettings({ slow_mode: next });

    if (saved) setSlowMode(next);
  }

  async function toggleSubscriberChat() {
    const next = !subscriberChat;
    const saved = await updateLiveSettings({ subscriber_only: next });

    if (saved) setSubscriberChat(next);
  }

  async function toggleSpamProtection() {
    const next = !spamProtection;
    const saved = await updateLiveSettings({ spam_protection: next });

    if (saved) setSpamProtection(next);
  }

  async function toggleChatLock() {
    const next = !chatLocked;
    const saved = await updateLiveSettings({ chat_locked: next });

    if (saved) setChatLocked(next);
  }

  async function toggleAiDetection() {
    const next = !aiDetection;
    const saved = await updateLiveSettings({ ai_detection: next });

    if (saved) setAiDetection(next);
  }

  function deleteMessage(id: number) {
    setFlaggedMessages((prev) => prev.filter((msg) => msg.id !== id));
  }

  function timeoutUser(id: number) {
    setFlaggedMessages((prev) => prev.filter((msg) => msg.id !== id));
    alert("User has been timed out for this beta session.");
  }

  function banUser(id: number) {
    setFlaggedMessages((prev) => prev.filter((msg) => msg.id !== id));
    alert("User has been banned for this beta session.");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <p className="mb-3 text-sm font-black uppercase text-blue-600">
            Moderation Center
          </p>

          <h1 className="text-5xl font-black text-gray-900">
            Livestream Moderation & Safety
          </h1>

          <p className="mt-5 max-w-3xl text-lg text-gray-700">
            Review live chat activity, manage moderation tools, and protect your
            livestream audience.
          </p>

          {statusMessage && (
            <p className="mt-4 text-sm font-bold text-blue-700">
              {statusMessage}
            </p>
          )}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900">Slow Mode</h2>

            <p className="mt-3 text-gray-600">
              Reduce spam by limiting chat frequency.
            </p>

            <button
              onClick={toggleSlowMode}
              className={`mt-5 rounded-xl px-5 py-3 font-bold text-white ${
                slowMode
                  ? "bg-blue-800 hover:bg-blue-900"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {slowMode ? "Slow Mode On" : "Enable"}
            </button>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900">
              Subscriber Chat
            </h2>

            <p className="mt-3 text-gray-600">
              Allow only subscribers to participate.
            </p>

            <button
              onClick={toggleSubscriberChat}
              className={`mt-5 rounded-xl px-5 py-3 font-bold text-white ${
                subscriberChat
                  ? "bg-green-800 hover:bg-green-900"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {subscriberChat ? "Subscriber Chat On" : "Activate"}
            </button>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900">
              Spam Protection
            </h2>

            <p className="mt-3 text-gray-600">
              Automatically detect suspicious activity.
            </p>

            <button
              onClick={toggleSpamProtection}
              className={`mt-5 rounded-xl px-5 py-3 font-bold text-white ${
                spamProtection
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "bg-gray-500 hover:bg-gray-600"
              }`}
            >
              {spamProtection ? "Enabled" : "Disabled"}
            </button>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900">
              Emergency Lock
            </h2>

            <p className="mt-3 text-gray-600">
              Temporarily freeze livestream chat.
            </p>

            <button
              onClick={toggleChatLock}
              className={`mt-5 rounded-xl px-5 py-3 font-bold text-white ${
                chatLocked
                  ? "bg-gray-900 hover:bg-black"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {chatLocked ? "Chat Locked" : "Lock Chat"}
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-black uppercase text-gray-500">
            Current Safety Settings
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <p className="rounded-xl bg-gray-50 p-4 font-bold text-gray-800">
              Slow Mode: {slowMode ? "On" : "Off"}
            </p>

            <p className="rounded-xl bg-gray-50 p-4 font-bold text-gray-800">
              Subscriber Chat: {subscriberChat ? "On" : "Off"}
            </p>

            <p className="rounded-xl bg-gray-50 p-4 font-bold text-gray-800">
              Spam Protection: {spamProtection ? "On" : "Off"}
            </p>

            <p className="rounded-xl bg-gray-50 p-4 font-bold text-gray-800">
              Chat Lock: {chatLocked ? "Locked" : "Open"}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-black uppercase text-red-600">
            Flagged Messages
          </p>

          <h2 className="mt-2 text-3xl font-black text-gray-900">
            Review Live Chat Alerts
          </h2>

          <div className="mt-8 space-y-5">
            {flaggedMessages.length === 0 ? (
              <p className="rounded-2xl bg-green-50 p-5 font-bold text-green-700">
                No flagged messages remain.
              </p>
            ) : (
              flaggedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-lg font-black text-gray-900">
                        @{msg.user}
                      </p>

                      <p className="mt-2 text-gray-700">{msg.message}</p>

                      <p className="mt-3 text-sm text-gray-500">{msg.time}</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                      >
                        Delete
                      </button>

                      <button
                        onClick={() => timeoutUser(msg.id)}
                        className="rounded-xl bg-yellow-500 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-600"
                      >
                        Timeout
                      </button>

                      <button
                        onClick={() => banUser(msg.id)}
                        className="rounded-xl bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
                      >
                        Ban User
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-black uppercase text-purple-600">
            AI Moderation
          </p>

          <h2 className="mt-2 text-3xl font-black text-gray-900">
            Automated Safety Monitoring
          </h2>

          <p className="mt-4 max-w-3xl text-gray-700">
            NiaTube AI moderation can detect spam, hate speech, scams, and
            suspicious livestream behavior in real time.
          </p>

          <button
            onClick={toggleAiDetection}
            className={`mt-6 rounded-xl px-5 py-3 font-bold text-white ${
              aiDetection
                ? "bg-purple-800 hover:bg-purple-900"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {aiDetection ? "AI Detection Enabled" : "Enable AI Detection"}
          </button>
        </div>
      </section>
    </main>
  );
}