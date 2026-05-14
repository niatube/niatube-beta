"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NiaCircleSigninPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black text-gray-900">
            Join NiaCircle
          </h1>

          <p className="mt-3 text-gray-700">
            Sign in or create an account to access creator memberships,
            exclusive content, and private live communities.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-lg bg-black px-5 py-3 text-sm font-bold text-white hover:bg-gray-800"
            >
              Sign In / Sign Up
            </Link>

            <Link
              href="/NiaCircle"
              className="rounded-lg border-2 border-green-600 px-5 py-3 text-sm font-bold text-black hover:bg-green-50"
            >
              Back to NiaCircle
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}