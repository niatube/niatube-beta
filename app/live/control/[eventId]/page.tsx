import Link from "next/link";
import Navbar from "@/components/Navbar";

type LiveEventControlPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function LiveEventControlPage({
  params,
}: LiveEventControlPageProps) {
  const { eventId } = await params;

  const safeEventId = encodeURIComponent(eventId);

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

          <p className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-600">
            Live Event ID: {eventId}
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Link
              href={`/live/control/broadcast?eventId=${safeEventId}`}
              className="block cursor-pointer rounded-2xl border bg-red-50 p-6 transition hover:scale-[1.02] hover:bg-red-100"
            >
              <h2 className="text-xl font-black">
                Broadcast Status
              </h2>

              <p className="mt-3 text-gray-700">
                Configure and monitor your livestream status.
              </p>

              <p className="mt-4 text-sm font-bold text-red-700">
                Open Broadcast Status →
              </p>
            </Link>

            <Link
              href={`/live/control/chat?eventId=${safeEventId}`}
              className="rounded-2xl border bg-yellow-50 p-6 transition hover:scale-[1.02] hover:bg-yellow-100"
            >
              <h2 className="text-xl font-black">
                Live Chat
              </h2>

              <p className="mt-3 text-gray-700">
                Manage audience chat and engagement.
              </p>
            </Link>

            <Link
              href={`/live/control/moderation?eventId=${safeEventId}`}
              className="rounded-2xl border bg-blue-50 p-6 transition hover:scale-[1.02] hover:bg-blue-100"
            >
              <h2 className="text-xl font-black">
                Moderation
              </h2>

              <p className="mt-3 text-gray-700">
                Review moderation tools and safety controls.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}