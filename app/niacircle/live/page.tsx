import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NiaCircleLivePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <p className="mb-3 text-sm font-black uppercase text-red-600">
            NiaCircle Live
          </p>

          <h1 className="text-5xl font-black text-gray-900">
            Start Live Event
          </h1>

          <p className="mt-5 max-w-3xl text-lg text-gray-700">
            Create a new live event or open the Live Control Room to manage your broadcast.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Link
              href="/live/start"
              className="rounded-3xl border-2 border-red-400 bg-red-50 p-8 shadow-sm transition hover:scale-[1.02]"
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500 text-3xl text-white">
                🔴
              </div>

              <h2 className="text-2xl font-black text-gray-900">
                Start Event
              </h2>

              <p className="mt-3 text-gray-700">
                Set up a new live event title, topic, and broadcast details.
              </p>
            </Link>

            <Link
              href="/live/control"
              className="rounded-3xl border-2 border-black bg-gray-50 p-8 shadow-sm transition hover:scale-[1.02]"
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-3xl text-white">
                🎛️
              </div>

              <h2 className="text-2xl font-black text-gray-900">
                Live Control
              </h2>

              <p className="mt-3 text-gray-700">
                Open the control room for active live event management.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}