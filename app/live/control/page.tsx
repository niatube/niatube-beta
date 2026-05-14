import Navbar from "@/components/Navbar";

export default function LiveControlPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <p className="mb-3 text-sm font-black uppercase text-red-600">
            Live Control Room
          </p>

          <h1 className="text-5xl font-black text-gray-900">
            Manage Your Live Broadcast
          </h1>

          <p className="mt-5 max-w-3xl text-lg text-gray-700">
            This is where creators will control livestream status, chat,
            event details, and moderation.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <a
              href="/live/control/status"
              className="rounded-2xl border bg-red-50 p-6 transition hover:scale-[1.02] hover:bg-red-100"
            >
              <h2 className="text-xl font-black">Broadcast Status</h2>

              <p className="mt-3 text-gray-700">
                Configure and monitor your livestream status.
              </p>
            </a>

            <a
              href="/live/control/chat"
              className="rounded-2xl border bg-yellow-50 p-6 transition hover:scale-[1.02] hover:bg-yellow-100"
            >
              <h2 className="text-xl font-black">Live Chat</h2>

              <p className="mt-3 text-gray-700">
                Manage audience chat and engagement.
              </p>
            </a>

            <a
              href="/live/control/moderation"
              className="rounded-2xl border bg-blue-50 p-6 transition hover:scale-[1.02] hover:bg-blue-100"
            >
              <h2 className="text-xl font-black">Moderation</h2>

              <p className="mt-3 text-gray-700">
                Review moderation tools and safety controls.
              </p>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}