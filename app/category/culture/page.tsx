"use client";

import Navbar from "@/components/Navbar";

export default function CulturePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-4xl font-black text-gray-900">
          Culture
        </h1>

        <p className="mt-2 text-gray-600">
          Explore African culture, traditions, storytelling, fashion, heritage, and diaspora experiences.
        </p>

        <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-gray-500">
            Cultural content will appear here.
          </p>
        </div>
      </section>
    </main>
  );
}