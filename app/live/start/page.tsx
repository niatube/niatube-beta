"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

export default function LiveStartPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [topic, setTopic] = useState("Culture");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Please enter a live event title.");
      return;
    }

    if (!creator.trim()) {
      setMessage("Please enter the creator name.");
      return;
    }

    const { data, error } = await supabase
      .from("uploads")
      .insert([
        {
          title: title.trim(),
          creator: creator.trim(),
          description: description.trim(),
          category: topic,
          status: "published",
          is_live: true,
          live_status: "live",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Create live event error:", error);
      setMessage("Could not create live event.");
      return;
    }

    if (data?.id) {
      router.push(`/live/control?eventId=${data.id}`);
    } else {
      router.push("/live/control");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 py-14">
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <p className="mb-3 text-sm font-black uppercase text-red-600">
            Start Event
          </p>

          <h1 className="text-4xl font-black text-gray-900">
            Create a Live Event
          </h1>

          <p className="mt-4 text-gray-600">
            Create the livestream event before entering Live Control.
          </p>

          <form onSubmit={handleStart} className="mt-8 space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Live event title"
              className="w-full rounded-xl border px-4 py-3 text-sm"
            />

            <input
              value={creator}
              onChange={(e) => setCreator(e.target.value)}
              placeholder="Creator name"
              className="w-full rounded-xl border px-4 py-3 text-sm"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief livestream description"
              className="h-28 w-full rounded-xl border px-4 py-3 text-sm"
            />

            <select
  value={topic}
  onChange={(e) => setTopic(e.target.value)}
  className="w-full rounded-xl border px-4 py-3 text-sm"
>
  <option>Culture</option>
  <option>News</option>
  <option>Music</option>
  <option>Podcast</option>
  <option>Education</option>
  <option>Business</option>
  <option>Community</option>
  <option>Sports</option>
  <option>History</option>
</select>
<select
  className="w-full rounded-xl border px-4 py-3 text-sm"
>
  <option>English</option>
  <option>French</option>
  <option>Swahili</option>
  <option>Yoruba</option>
  <option>Amharic</option>
  <option>Portuguese</option>
  <option>Arabic</option>
</select>

            <button
              type="submit"
              className="w-full rounded-xl bg-red-500 px-6 py-3 text-sm font-black text-white hover:bg-red-600"
            >
              Create Event & Open Live Control
            </button>
          </form>

          {message && (
            <div className="mt-6 rounded-xl bg-yellow-50 p-4">
              <p className="font-semibold text-yellow-800">{message}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}