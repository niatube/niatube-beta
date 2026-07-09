export default function TermsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="rounded-3xl border border-gray-200 bg-white p-10 shadow-sm">
        <p className="text-sm font-black uppercase tracking-widest text-yellow-700">
          NiaTube Legal
        </p>

        <h1 className="mt-3 text-4xl font-black text-gray-900">
          Terms of Service
        </h1>

        <div className="mt-6 grid gap-4 rounded-2xl bg-gray-50 p-6 text-sm md:grid-cols-2">
          <div>
            <p className="font-black text-gray-900">Version</p>
            <p className="text-gray-700">1.0</p>
          </div>

          <div>
            <p className="font-black text-gray-900">Status</p>
            <p className="text-green-700 font-bold">Active</p>
          </div>

          <div>
            <p className="font-black text-gray-900">Effective Date</p>
            <p className="text-gray-700">July 2026</p>
          </div>

          <div>
            <p className="font-black text-gray-900">Last Updated</p>
            <p className="text-gray-700">July 2026</p>
          </div>

          <div className="md:col-span-2">
            <p className="font-black text-gray-900">Applies To</p>

            <p className="text-gray-700">
              All NiaTube users, including viewers, creators,
              members, advertisers, partners, and visitors who use
              or access the Platform.
            </p>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-black text-gray-900">
            Welcome to NiaTube
          </h2>

          <p className="mt-5 leading-8 text-gray-700">
            Welcome to NiaTube, a Pan-African digital media and creator
            economy platform dedicated to empowering creators,
            preserving African stories, strengthening communities,
            and connecting Africa with the global diaspora through
            technology, innovation, and trusted financial infrastructure.
          </p>

          <p className="mt-5 leading-8 text-gray-700">
            These Terms of Service ("Terms") govern your access to and
            use of NiaTube's websites, applications, creator tools,
            monetization programs, memberships, payment services,
            artificial intelligence features, and all related products
            and services (collectively, the "Platform").
          </p>

          <p className="mt-5 leading-8 text-gray-700">
            By creating an account, accessing, or using the Platform,
            you acknowledge that you have read, understood, and agree
            to be bound by these Terms of Service, our Privacy Policy,
            Community Guidelines, and any additional agreements that
            apply to specific NiaTube products or services.
          </p>

          <p className="mt-5 leading-8 text-gray-700">
            Certain services, including creator monetization,
            memberships, wallet services, payouts, and other financial
            features, may also be governed by additional agreements,
            including the Creator Monetization &amp; Payout Terms and
            the Payment &amp; Settlement Policy. Where a product-specific
            agreement applies, it supplements these Terms and governs
            that service to the extent of any inconsistency.
          </p>

          <p className="mt-5 leading-8 text-gray-700">
            If you do not agree with these Terms, you should not create
            an account or use the Platform.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-black text-gray-900">
            1. Acceptance of These Terms
          </h2>

          <p className="mt-5 leading-8 text-gray-700">
            By accessing or using NiaTube, you confirm that you have the
            legal capacity to enter into a binding agreement and that the
            information you provide to NiaTube is accurate and current.
          </p>

          <p className="mt-5 leading-8 text-gray-700">
            You agree to comply with these Terms, applicable laws,
            published NiaTube policies, and any additional agreements
            governing specific products or services offered by the
            Platform.
          </p>

          <p className="mt-5 leading-8 text-gray-700">
            NiaTube may update these Terms from time to time to reflect
            changes in the law, technology, business operations, or
            Platform features. Where appropriate, users may be required
            to review and accept updated Terms before continuing to use
            certain services.
          </p>
        </section>
                <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-700">
          <p className="font-black text-gray-900">
            Questions about these Terms?
          </p>

          <p className="mt-2 leading-7">
            Please contact NiaTube through the official support channels
            published on the Platform.
          </p>
        </div>
      </div>
    </main>
  );
}