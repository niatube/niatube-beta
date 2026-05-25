"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

type NiaMallStore = {
  id: string;
  creator_name: string;
  store_name: string;
  store_url: string;
  promo_video_url?: string;
  category?: string;
  description?: string;
  status?: string;
};

export default function NiaMallPublicPage() {
  const [stores, setStores] = useState<NiaMallStore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStores() {
      setLoading(true);

      const { data, error } = await supabase
        .from("niamall_applications")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("NiaMALL load error:", error);
        setLoading(false);
        return;
      }

      setStores((data || []) as NiaMallStore[]);
      setLoading(false);
    }

    loadStores();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-yellow-600">
            Entrance to the MALL
          </p>

          <h1 className="mt-2 text-4xl font-black text-gray-900">
            Shop approved creator stores.
          </h1>

          <p className="mt-3 max-w-3xl text-gray-600">
            Watch creator promo videos, discover products and services, then
            visit approved external stores directly.
          </p>
        </div>

        {loading ? (
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            Loading approved stores...
          </div>
        ) : stores.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900">
              No approved stores yet.
            </h2>

            <p className="mt-2 text-gray-600">
              Approved Revenue Partnership stores will appear here after admin
              review.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {stores.map((store) => (
              <div
                key={store.id}
                className="overflow-hidden rounded-3xl bg-white shadow-sm"
              >
                {store.promo_video_url ? (
                  <video
                    src={store.promo_video_url}
                    controls
                    className="aspect-video w-full bg-black object-cover"
                  />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-black text-white">
                    No promo video available
                  </div>
                )}

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700">
                      {store.category || "Creator Store"}
                    </span>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                      Approved
                    </span>
                  </div>

                  <h2 className="mt-4 text-2xl font-black text-gray-900">
                    {store.store_name}
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-gray-500">
                    By {store.creator_name}
                  </p>

                  {store.description && (
                    <p className="mt-3 line-clamp-4 text-sm leading-6 text-gray-700">
                      {store.description}
                    </p>
                  )}

                  <a
                    href={store.store_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 block rounded-xl bg-black px-5 py-3 text-center text-sm font-black text-white hover:bg-gray-800"
                  >
                    Visit Store
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}