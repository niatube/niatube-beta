"use client";

import Navbar from "@/components/Navbar";

export default function TrendingPage() {
  return (
    <main className="min-h-screen bg-gray-50">
  <Navbar />
    
      <h1 className="mb-6 text-4xl font-extrabold">
        Trending on NiaTube
      </h1>

      <div className="space-y-4">
        <div className="rounded-xl bg-white p-4 shadow">
          <h3 className="text-xl font-bold">
            Top Creator Uploads
          </h3>
          <p className="text-gray-600">
            Trending uploads from creators across Africa and the diaspora.
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow">
          <h3 className="text-xl font-bold">
            Most Watched This Week
          </h3>
          <p className="text-gray-600">
            Popular stories gaining momentum on NiaTube.
          </p>
        </div>
      </div>
    </main>
  );
}