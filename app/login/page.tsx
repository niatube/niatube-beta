import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function LoginChoicePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <p className="mb-3 text-sm font-black uppercase text-yellow-600">
            NiaTube Creator Access
          </p>

          <h1 className="text-4xl font-black text-gray-900">
            Welcome back to NiaTube
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Choose how you want to continue. Creators who already signed up can
            log in. New creators should sign up first.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Link
              href="/login/creator"
             className="rounded-3xl border border-yellow-200 bg-gradient-to-br from-yellow-50 via-orange-50 to-white p-8 text-black shadow-md transition hover:scale-[1.01]"
            >
              <h2 className="text-3xl font-black">Log In</h2>
              <p className="mt-4 text-gray-700">
                Already signed up? Log in and choose whether to upload a video
                or go to My Space.
              </p>
            </Link>

            <Link
              href="/signup"
              className="rounded-3xl border-2 border-yellow-400 bg-yellow-50 p-8 text-black shadow-sm transition hover:scale-[1.01]"
            >
              <h2 className="text-3xl font-black">Sign Up</h2>
              <p className="mt-4 text-gray-700">
                New creator? Create your NiaTube creator account before logging
                in.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}