import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function CreatorAccessPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 py-16">
        <div className="w-full rounded-3xl bg-white p-10 shadow-sm">
          <div className="text-center">
            <p className="text-sm font-bold uppercase text-yellow-600">
              Creator Access
            </p>

            <h1 className="mt-2 text-5xl font-black text-gray-900">
              Welcome Back
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-700">
              Access your creator tools, upload videos, manage live events,
              and participate in the NiaTube creator ecosystem.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {/* Existing Creator */}
            <div className="rounded-2xl border bg-gray-50 p-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Existing Creator
              </h2>

              <p className="mt-3 text-gray-600">
                Sign in to access your creator dashboard and tools.
              </p>

              <Link
                href="/signin"
                className="mt-6 inline-block rounded-xl bg-black px-6 py-3 font-bold text-white hover:bg-gray-800"
              >
                Sign In
              </Link>
            </div>

            {/* New Creator */}
            <div className="rounded-2xl border bg-gray-50 p-8">
              <h2 className="text-2xl font-bold text-gray-900">
                New Creator
              </h2>

              <p className="mt-3 text-gray-600">
                Create a NiaTube account to begin uploading videos and
                accessing creator tools.
              </p>

              <Link
                href="/creator/apply"
                className="mt-6 inline-block rounded-xl bg-yellow-500 px-6 py-3 font-bold text-black hover:bg-yellow-400"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}