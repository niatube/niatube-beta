"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

export default function LiveSetupPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Sports");
  const [goLiveNow, setGoLiveNow] = useState(true);
  const [scheduledAt, setScheduledAt] = useState("");
  const [message, setMessage] = useState("");

  async function createLiveEvent(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !creator.trim()) {
      setMessage("Title and creator name are required.");
      return;
    }

    const { data, error } = await supabase
      .from("uploads")
      .insert([
        {
          title: title.trim(),
          creator: creator.trim(),
          description: description.trim(),
          category: "Live",
          is_live: goLiveNow,
          live_status: goLiveNow ? "live" : "scheduled",
          status: "published",
          scheduled_at: goLiveNow ? null : scheduledAt || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Create live event error:", error);
      setMessage("Could not create live event.");
      return;
    }

    setMessage("Live event created.");

    if (data?.id) {
  router.push(`/live/control/${data.id}`);
} else {
  router.push("/live/control");
}
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-14">
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <p className="mb-3 text-sm font-black uppercase text-red-600">
            Create Live Event
          </p>

          <h1 className="text-5xl font-black text-gray-900">
            Set Up Your Livestream
          </h1>

          <p className="mt-5 text-lg text-gray-700">
            Create a live event before entering the Live Control Room.
          </p>

          {message && (
            <p className="mt-5 rounded-xl bg-yellow-50 p-4 font-bold text-yellow-800">
              {message}
            </p>
          )}

          <form onSubmit={createLiveEvent} className="mt-8 space-y-6">
            <div>
              <label className="text-sm font-bold text-gray-700">
                Live Event Title
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The Lost Soccer World Cup Game"
                className="mt-2 w-full rounded-xl border px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">
                Creator Name
              </label>

              <input
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                placeholder="James"
                className="mt-2 w-full rounded-xl border px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this livestream..."
                className="mt-2 h-32 w-full rounded-xl border px-4 py-3"
              />
            </div>

            

            <div className="rounded-2xl bg-gray-50 p-5">
              <label className="flex items-center gap-3 font-bold text-gray-800">
                <input
                  type="checkbox"
                  checked={goLiveNow}
                  onChange={(e) => setGoLiveNow(e.target.checked)}
                />
                Go Live Now
              </label>

              {!goLiveNow && (
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="mt-4 w-full rounded-xl border px-4 py-3"
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-red-600 px-6 py-4 text-lg font-black text-white hover:bg-red-700"
            >
              Create Live Event
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}