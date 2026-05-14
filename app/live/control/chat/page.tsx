import Navbar from "@/components/Navbar";

export default function BroadcastStatusPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <h1 className="text-5xl font-black text-gray-900">
            Broadcast Status
          </h1>

          <p className="mt-5 text-lg text-gray-700">
            Livestream status controls and monitoring tools will appear here.
          </p>
        </div>
      </section>
    </main>
  );
}