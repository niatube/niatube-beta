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
            NiaMALL will showcase approved creator stores, products, services,
            and brand partnerships across the NiaTube ecosystem.
          </p>

          <div className="mt-8 rounded-3xl border border-yellow-200 bg-yellow-50 p-6">
            <h2 className="text-2xl font-black text-gray-900">
              Revenue Partnership Program
            </h2>

            <p className="mt-3 text-sm leading-7 text-gray-700">
              Creators must apply and be approved before their store or product
              can appear on NiaMALL. This protects viewers, strengthens creator
              trust, and keeps NiaMALL curated and monetization-ready.
            </p>

            <Link
              href="/niamall/partnership"
              className="mt-5 inline-block rounded-xl bg-black px-6 py-3 text-sm font-black text-white hover:bg-gray-800"
            >
              Apply to Revenue Partnership Program
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border bg-gray-50 p-5">
              <h3 className="text-lg font-black text-gray-900">
                Approved Stores
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Store names and links will appear only after partnership
                approval.
              </p>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-5">
              <h3 className="text-lg font-black text-gray-900">
                Creator Products
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Creators can promote merchandise, books, courses, services, and
                external storefronts.
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

          <div className="mt-10 rounded-3xl bg-black p-6 text-white">
            <p className="text-sm font-black uppercase text-yellow-400">
              Coming Soon
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Featured creator storefronts will appear here.
            </h2>

            <p className="mt-3 text-sm leading-7 text-gray-300">
              Once approved, creators will be listed with their store name,
              category, short description, and external store website link.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}