"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function LiveStartPage() {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("Culture");
  const [message, setMessage] = useState("");

  function handleStart(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Please enter a live event title.");
      return;
    }

    setMessage("Live event setup created. You can now open Live Control.");
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

          <form onSubmit={handleStart} className="mt-8 space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Live event title"
              className="w-full rounded-xl border px-4 py-3 text-sm"
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
            </select>

            <button
              type="submit"
              className="w-full rounded-xl bg-red-500 px-6 py-3 text-sm font-black text-white hover:bg-red-600"
            >
              Start Event Setup
            </button>
          </form>

          {message && (
            <div className="mt-6 rounded-xl bg-green-50 p-4">
              <p className="font-semibold text-green-800">{message}</p>

              <a
                href="/live/control"
                className="mt-4 inline-block rounded-xl bg-black px-5 py-3 text-sm font-black text-white"
              >
                Open Live Control
              </a>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}