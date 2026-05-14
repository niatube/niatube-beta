"use client";

import Navbar from "@/components/Navbar";

export default function NiaCircleUploadPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase text-yellow-600">
            NiaCircle Exclusive Upload
          </p>

          <h1 className="mt-2 text-4xl font-black text-gray-900">
            Upload to NiaCircle
          </h1>

          <p className="mt-4 max-w-3xl text-gray-600">
            Publish exclusive member-only content for the NiaCircle creator
            ecosystem.
          </p>

          <div className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
            <h2 className="text-xl font-bold text-gray-900">
              Exclusive Creator Content
            </h2>

            <p className="mt-3 text-gray-700">
              This upload area is reserved for approved NiaCircle creators.
              Exclusive uploads may include premium commentary, educational
              content, private creator updates, and member-only experiences.
            </p>
          </div>

          <form className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-bold text-gray-700">
                Video Title
              </label>

              <input
                className="mt-2 w-full rounded-xl border px-4 py-3"
                placeholder="Enter video title"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">
                Description
              </label>

              <textarea
                className="mt-2 min-h-[140px] w-full rounded-xl border px-4 py-3"
                placeholder="Describe your exclusive content"
              />
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
  <h3 className="text-sm font-bold text-gray-900">
    Recommended Format
  </h3>

  <p className="mt-2 text-sm text-gray-700">
    .mp4 · H.264 · AAC · 720p/1080p · 24–30fps
  </p>
</div>

            <div>
              <label className="text-sm font-bold text-gray-700">
                Upload Video
              </label>

              <input
                type="file"
                className="mt-2 w-full rounded-xl border bg-white px-4 py-3"
              />
            </div>

            <div>
  <label className="text-sm font-bold text-gray-700">
    Upload Thumbnail
  </label>

  <input
    type="file"
    accept="image/*"
    className="mt-2 w-full rounded-xl border bg-white px-4 py-3"
  />
  

  <p className="mt-2 text-sm text-gray-500">
    Recommended: JPG or PNG • 1280×720
  </p>
</div>

            <button
              type="submit"
              className="w-full rounded-xl bg-black px-6 py-4 font-black text-white hover:bg-gray-800"
            >
              Upload Exclusive Video
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}