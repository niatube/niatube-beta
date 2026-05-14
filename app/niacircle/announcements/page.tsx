 
import Navbar from "@/components/Navbar";

export default function NiaCircleUploadPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <p className="mb-3 text-sm font-black uppercase text-yellow-600">
            Private Announcements
          </p>

          <h1 className="text-5xl font-black text-gray-900">
            Private NiaCircle Announcements — Coming Soon
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-gray-700">
            Upload exclusive creator content for the NiaCircle community.
          </p>

          <div className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
            <p className="text-lg font-semibold text-gray-600">
              NiaCircle Upload Center — Coming Soon
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}