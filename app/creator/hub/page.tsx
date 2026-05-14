"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function CreatorHubPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-black text-gray-900">
          Creator Hub
        </h1>

        <p className="mt-2 text-gray-600">
          What would you like to do today?
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Link
            href="/upload"
            className="rounded-2xl bg-white p-6 shadow hover:shadow-md"
          >
            <h2 className="text-xl font-bold">Upload Video</h2>
            <p className="mt-2 text-sm text-gray-600">
              Upload a new video for review and publishing.
            </p>
          </Link>

          <Link
            href="/creator-dashboard"
            className="rounded-2xl bg-white p-6 shadow hover:shadow-md"
          >
            <h2 className="text-xl font-bold">Go - My Space</h2>
            <p className="mt-2 text-sm text-gray-600">
              View tips, earnings, and creator activity.
            </p>
          </Link>

          <Link
            href="/live-studio"
            className="rounded-2xl bg-white p-6 shadow hover:shadow-md"
          >
            <h2 className="text-xl font-bold">Create Live Event</h2>
            <p className="mt-2 text-sm text-gray-600">
              Set up a livestream event and go live.
            </p>
          </Link>
          <Link
 
  href="/niacircle/apply"
  className="rounded-2xl border-2 border-yellow-400 bg-yellow-50 p-6 shadow hover:shadow-md"
>
  <h2 className="text-xl font-extrabold text-gray-900">
    Join NiaCircle
  </h2>

  <p className="mt-2 text-sm text-gray-700">
    Apply to become part of the NiaCircle creator community ecosystem.
  </p>
</Link>

<Link
  href="/niacircle"
  className="inline-flex flex-col items-center justify-center rounded-lg bg-black px-5 py-3 text-sm font-bold text-white hover:bg-gray-800"
>
  <span>Already Approved?</span>
  <span>Enter Here</span>
</Link>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold">Other Creator Tools</h2>
            <p className="mt-2 text-sm text-gray-600">
              More creator tools will be added here.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}