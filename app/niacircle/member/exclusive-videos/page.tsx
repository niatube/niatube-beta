import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function ExclusiveVideosPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase text-yellow-600">
            NiaCircle
          </p>

          <h1 className="mt-2 text-4xl font-black text-gray-900">
            Exclusive Videos
          </h1>

          <p className="mt-4 max-w-3xl text-gray-600">
            Manage member-only videos, lessons, creator updates, and premium
            commentary for your NiaCircle audience.
          </p>

          <div className="mt-8">
            <Link
              href="/niacircle/member/upload"
              className="inline-block rounded-xl bg-black px-6 py-3 font-bold text-white hover:bg-gray-800"
            >
              Upload Exclusive Video
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900">
            No exclusive videos yet
          </h2>

          <p className="mt-2 text-gray-600">
            Once you upload NiaCircle exclusive videos, they will appear here.
          </p>
        </div>
      </section>
    </main>
  );
}