"use client";

import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="mb-3 text-sm font-bold uppercase text-yellow-600">
            About NiaTube
          </p>

          <h1 className="text-4xl font-black text-gray-900">
            A Pan-African platform for creators, communities, and culture.
          </h1>

          <p className="mt-5 text-lg text-gray-700">
            NiaTube is being built to empower African and diaspora creators
            through video, livestreams, community memberships, and direct
            monetization.
          </p>

          <p className="mt-4 text-gray-700">
            Our mission is to help creators own their audience, share their
            stories, build communities, and earn from their work across borders.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Creators</h2>
            <p className="mt-2 text-sm text-gray-600">
              Upload videos, go live, build audiences, and grow communities.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Viewers</h2>
            <p className="mt-2 text-sm text-gray-600">
              Discover African and diaspora stories, music, culture, news, and live events.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">NiaCircle</h2>
            <p className="mt-2 text-sm text-gray-600">
              Join creator communities and support premium memberships.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}