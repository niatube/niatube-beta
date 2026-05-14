"use client";

import Navbar from "@/components/Navbar";

export default function MusicPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-4xl font-black text-gray-900">
          Music
        </h1>

        <p className="mt-2 text-gray-600">
          Discover music videos, performances, concerts, and African sounds from around the world.
        </p>

        <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-gray-500">
            Music content will appear here.
          </p>
        </div>
      </section>
    </main>
  );
}