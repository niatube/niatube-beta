"use client";

export default function AdvertisePage() {
  return (
    <main className="min-h-screen bg-[#f6f6f6] p-6">
      <h1 className="text-4xl font-extrabold mb-6">
        Advertise on NiaTube
      </h1>

      <div className="max-w-2xl bg-white p-6 rounded-xl shadow">
        <p className="text-lg">
          Reach Pan-African audiences across news, culture, and entertainment.
        </p>

        <p className="mt-4 text-gray-600">
          Fill out the form below to book premium ad space.
        </p>

        <form className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Company Name"
            className="w-full border rounded-md px-4 py-2"
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-md px-4 py-2"
          />

          <textarea
            placeholder="Tell us about your campaign"
            className="w-full border rounded-md px-4 py-2"
          />

          <button
            type="submit"
            className="bg-yellow-400 px-6 py-2 rounded-md font-semibold"
          >
            Submit Request
          </button>
        </form>
      </div>
    </main>
  );
}