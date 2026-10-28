"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

type CreatorProfile = {
  id: string;
  creator_name: string;
  email?: string | null;
  country?: string | null;
  verified?: boolean | null;
  created_at?: string | null;
};
type CreatorStats = {
  totalCreators: number;
  creatorsWithUploads: number;
  totalVideos: number;
  publishedVideos: number;
  processingVideos: number;
};

export default function AdminCreatorsPage() {
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [stats, setStats] = useState<CreatorStats | null>(null);
    const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [selectedCountry, setSelectedCountry] = useState("ALL");

  const [printColumns, setPrintColumns] = useState<
    "CONTACT" | "COUNTRY" | "FULL"
  >("CONTACT");
  async function loadCreators() {
    setLoading(true);

    const rawAccess = sessionStorage.getItem("niatube_admin_access");
    const access = rawAccess ? JSON.parse(rawAccess) : null;

    const response = await fetch("/api/admin/creators", {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${access?.sessionToken || ""}`,
      },
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      setMessage(result.error || "Could not load creators.");
      setLoading(false);
      return;
    }

    setCreators(result.creators || []);
    setStats(result.stats || null);
    setLoading(false);
  }

  useEffect(() => {
    loadCreators();
  }, []);

  const availableCountries = Array.from(
    new Set(
      creators
        .map((creator) => creator.country?.trim())
        .filter((country): country is string => Boolean(country))
    )
   ).sort((a, b) => a.localeCompare(b));

  const filteredCreators = creators.filter((creator) => {
    if (selectedCountry === "ALL") {
      return true;
    }

    return creator.country?.trim() === selectedCountry;
  });

  return (
    <main className="min-h-screen bg-gray-50">
            <div className="print:hidden">
        <Navbar />
      </div>

            <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="hidden print:block print:mb-6">
          <h2 className="text-2xl font-black text-gray-900">
            NiaTube Creator Directory
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Nia Media Group, Inc.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Confidential — Internal Creator Relations and Marketing Use
          </p>
                    <p className="mt-2 text-xs text-gray-500">
            Country: {selectedCountry === "ALL" ? "All Countries" : selectedCountry}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Directory Type:{" "}
            {printColumns === "CONTACT"
              ? "Creator Names and Email Addresses"
              : printColumns === "COUNTRY"
              ? "Creator Names, Email Addresses and Countries"
              : "Full Creator Directory"}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Printed: {new Date().toLocaleDateString()}
          </p>
        </div>

                <div className="print:hidden">
          <p className="text-sm font-black uppercase tracking-wide text-yellow-600">
            Admin Creators
          </p>

          <h1 className="mt-2 text-4xl font-black text-gray-900">
            Creator Management
          </h1>

          <p className="mt-3 max-w-4xl text-gray-600">
            Monitor creator growth, creator profiles, uploads, and publishing activity.
          </p>
        </div>

                  <div className="mt-6 flex flex-wrap items-end gap-4 print:hidden">
          <div>
            <label
              htmlFor="creator-country-filter"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Filter by Country
            </label>

            <select
              id="creator-country-filter"
              value={selectedCountry}
              onChange={(event) => setSelectedCountry(event.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900"
            >
              <option value="ALL">All Countries</option>
              {availableCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

                    <div>
            <label
              htmlFor="creator-print-columns"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Information to Print
            </label>

            <select
              id="creator-print-columns"
              value={printColumns}
              onChange={(event) =>
                setPrintColumns(
                  event.target.value as "CONTACT" | "COUNTRY" | "FULL"
                )
              }
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900"
            >
              <option value="CONTACT">Name and Email Only</option>
              <option value="COUNTRY">Name, Email and Country</option>
              <option value="FULL">Full Creator Directory</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            disabled={loading || creators.length === 0}
            className="rounded-xl bg-green-800 px-6 py-3 font-bold text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Print Creator List
          </button>
        </div>

        {message && (
          <p className="mt-6 rounded-xl bg-yellow-50 p-4 text-sm font-bold text-yellow-800">
            {message}
          </p>
        )}

                <div className="mt-8 grid gap-4 md:grid-cols-5 print:hidden">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Total Creators</p>
            <p className="mt-2 text-3xl font-black text-gray-900">
              {stats?.totalCreators || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Creators With Uploads</p>
            <p className="mt-2 text-3xl font-black text-blue-700">
              {stats?.creatorsWithUploads || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Total Videos</p>
            <p className="mt-2 text-3xl font-black text-gray-900">
              {stats?.totalVideos || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Published Videos</p>
            <p className="mt-2 text-3xl font-black text-green-700">
              {stats?.publishedVideos || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Processing Videos</p>
            <p className="mt-2 text-3xl font-black text-yellow-700">
              {stats?.processingVideos || 0}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            Loading creator management data...
          </div>
        ) : creators.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-8 text-gray-500 shadow-sm">
            No creator profiles found.
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm">
           <div
  className={`grid grid-cols-6 gap-4 border-b bg-gray-100 px-5 py-4 text-sm font-black text-gray-700 ${
    printColumns === "CONTACT"
      ? "print:grid-cols-2"
      : printColumns === "COUNTRY"
      ? "print:grid-cols-3"
      : "print:grid-cols-5"
  }`}
>
  <p>Creator</p>
  <p>Email</p>
    <p className={printColumns === "CONTACT" ? "print:hidden" : ""}>
    Country
  </p>
    <p className={printColumns !== "FULL" ? "print:hidden" : ""}>
    Verified
  </p>
    <p className={printColumns !== "FULL" ? "print:hidden" : ""}>
    Joined
  </p>
  <p className="print:hidden">Channel</p>
</div>
              {filteredCreators.map((creator) => (
              <div
                key={creator.id}
              className={`grid grid-cols-6 gap-4 border-b px-5 py-4 text-sm last:border-b-0 ${
  printColumns === "CONTACT"
    ? "print:grid-cols-2"
    : printColumns === "COUNTRY"
    ? "print:grid-cols-3"
    : "print:grid-cols-5"
}`}
              >
                <p className="font-bold text-gray-900">
                  {creator.creator_name}
                </p>

               <p className="break-all text-gray-700 print:text-xs">
                  {creator.email || "Not available"}
                </p>

                                <p
                  className={`text-gray-700 ${
                    printColumns === "CONTACT" ? "print:hidden" : ""
                  }`}
                >
                  {creator.country || "Not set"}
                </p>

                                <p
                  className={`text-gray-700 ${
                    printColumns !== "FULL" ? "print:hidden" : ""
                  }`}
                >
                  {creator.verified ? "Verified" : "Not verified"}
                </p>

                                <p
                  className={`text-gray-700 ${
                    printColumns !== "FULL" ? "print:hidden" : ""
                  }`}
                >
                  {creator.created_at
                    ? new Date(creator.created_at).toLocaleDateString()
                    : "Not available"}
                </p>

                                <a
                  href={`/channel/${creator.creator_name}`}
                  className="font-bold text-blue-700 underline print:hidden"
                >
                  Open Channel
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}