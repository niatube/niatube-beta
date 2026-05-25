import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NiaMallPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl bg-white p-8 shadow-sm md:p-12">
          <p className="text-sm font-black uppercase tracking-wide text-yellow-600">
            NiaMALL
          </p>

          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-gray-900 md:text-5xl">
            Turn audience attention into creator commerce.
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-700">
            NiaMALL showcases approved creator stores, product videos,
            services, and brand partnerships across the NiaTube ecosystem.
          </p>

          <div className="mt-8 rounded-3xl border border-yellow-200 bg-yellow-50 p-6">
            <h2 className="text-center text-2xl font-black text-gray-900">
              Revenue Partnership Program
            </h2>

            <p className="mx-auto mt-3 max-w-3xl text-center text-sm leading-7 text-gray-700">
              Creators must apply and be approved before their store or product
              can appear in the MALL. This protects viewers, strengthens
              creator trust, and keeps NiaMALL curated and monetization-ready.
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <Link
                href="/niamall/partnership"
                className="group rounded-3xl bg-black p-6 text-white transition hover:scale-[1.01]"
              >
                <div className="flex items-start gap-5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-5xl text-black shadow-sm">
                    ↑
                  </div>

                  <div>
                    <h3 className="text-3xl font-black leading-tight">
                      Apply to Revenue
                      <br />
                      Partnership Program
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-gray-300">
                      Apply to get your store or product featured in NiaMALL.
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/niamall/mall"
                className="group rounded-3xl border-2 border-yellow-500 bg-yellow-400 p-6 text-black transition hover:scale-[1.01]"
              >
                <div className="flex items-start gap-5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-5xl text-black shadow-sm">
                    ↑
                  </div>

                  <div>
                    <h3 className="text-3xl font-black leading-tight">
                      Entrance to
                      <br />
                      the MALL
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-gray-800">
                      Explore approved creator stores, promo videos, products,
                      and services across the NiaTube ecosystem.
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border bg-gray-50 p-5">
              <h3 className="text-lg font-black text-gray-900">
                Approved Stores
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Store names, promo videos, and links appear only after
                partnership approval.
              </p>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-5">
              <h3 className="text-lg font-black text-gray-900">
                Creator Product Videos
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Creators can use short MP4 promo videos to showcase products,
                services, merchandise, courses, and external storefronts.
              </p>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-5">
              <h3 className="text-lg font-black text-gray-900">
                Commerce Trust
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                NiaMALL is curated to reduce spam, protect users, and support
                serious creator monetization.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}