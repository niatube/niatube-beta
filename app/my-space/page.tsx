import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function MySpacePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <p className="mb-3 text-sm font-black uppercase text-yellow-600">
            Creator Space
          </p>

          <h1 className="text-4xl font-black text-gray-900">
            What would you like to do?
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Choose your next step as a NiaTube creator.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Link
              href="/upload"
              className="rounded-3xl border-2 border-yellow-400 bg-yellow-50 p-8 text-left shadow-sm transition hover:scale-[1.02] hover:bg-yellow-100"
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400 text-3xl">
                ⬆️
              </div>

              <h2 className="text-2xl font-black text-gray-900">
                Upload Video
              </h2>

              <p className="mt-3 text-gray-700">
                Upload a new video for review and publishing on NiaTube.
              </p>
            </Link>

            <Link
              href="/live/start"
              className="rounded-3xl border-2 border-red-400 bg-red-50 p-8 text-left shadow-sm transition hover:scale-[1.02] hover:bg-red-100"
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500 text-3xl text-white">
                🔴
              </div>

              <h2 className="text-2xl font-black text-gray-900">
                Start Live Event
              </h2>

              <p className="mt-3 text-gray-700">
                Open Live Control and begin a creator broadcast.
              </p>
            </Link>

            <Link
              href="/creator-dashboard"
              className="rounded-3xl border-2 border-green-500 bg-green-50 p-8 text-left shadow-sm transition hover:scale-[1.02] hover:bg-green-100"
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500 text-3xl text-white">
                🏠
              </div>

              <h2 className="text-2xl font-black text-gray-900">
                Go to Dashboard
              </h2>

              <p className="mt-3 text-gray-700">
                View your uploads, tips, earnings, and creator activity.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}