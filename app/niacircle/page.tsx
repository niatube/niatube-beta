"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NiaCirclePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <p className="mb-3 text-sm font-bold uppercase text-yellow-600">
            Creator Community
          </p>

          <h1 className="text-5xl font-black text-gray-900">
            Welcome to NiaCircle
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-gray-700">
            NiaCircle is NiaTube’s creator community ecosystem — designed to
            connect African and diaspora creators through collaboration,
            exclusive engagement, and digital empowerment.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/niacircle/apply"
              className="inline-block rounded-xl bg-yellow-400 px-8 py-4 text-base font-bold text-black hover:bg-yellow-300"
            >
              Apply to NiaCircle
            </Link>

            <Link
              href="/niacircle/member"
              className="inline-flex flex-col items-center justify-center rounded-xl bg-black px-8 py-4 text-base font-bold text-white hover:bg-gray-800"
            >
              <span>Already Approved?</span>
              <span>Enter Here</span>
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-6 text-center">
          <h2 className="text-2xl font-black text-gray-900">
            A structured creator ecosystem
          </h2>

          <p className="mx-auto mt-3 max-w-4xl text-gray-700">
            NiaCircle is designed for confirmed creators who want to build
            deeper community, strengthen collaboration, and participate in a
            trusted Pan-African digital network.
          </p>
        </div>
      </section>
    </main>
  );
}