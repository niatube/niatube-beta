export default function FinancialControlCenterPage() {
  const sections = [
  {
    title: "Revenue Operations",
    items: [
      { name: "Tips Ledger", href: "/financial/tips", status: "Active" },
      { name: "Super Support Ledger", href: "/financial/super-support", status: "Coming Soon" },
      { name: "Subscription Ledger", href: "/financial/subscriptions", status: "Coming Soon" },
      { name: "Advertising Ledger", href: "/financial/advertising", status: "Coming Soon" },
      { name: "BrandConnect Ledger", href: "/financial/brandconnect", status: "Coming Soon" },
    ],
  },
  {
    title: "Treasury Operations",
    items: [
      { name: "Platform Treasury", href: "/financial/treasury", status: "Coming Soon" },
      { name: "Creator Wallet Ledger", href: "/financial/creator-wallet", status: "Coming Soon" },
      { name: "Payout Processing", href: "/financial/payouts", status: "Coming Soon" },
      { name: "FX & Currency", href: "/financial/fx", status: "Coming Soon" },
      { name: "Liquidity & Reserves", href: "/financial/liquidity", status: "Coming Soon" },
    ],
  },
  {
    title: "Accounting",
    items: [
      { name: "General Ledger", href: "/financial/general-ledger", status: "Coming Soon" },
      { name: "Journal", href: "/financial/journal", status: "Coming Soon" },
      { name: "Reconciliation", href: "/financial/reconciliation", status: "Coming Soon" },
      { name: "Financial Reports", href: "/financial/reports", status: "Coming Soon" },
    ],
  },
  {
    title: "Compliance",
    items: [
      { name: "Audit Trail", href: "/financial/audit", status: "Coming Soon" },
      { name: "Risk Monitoring", href: "/financial/risk", status: "Coming Soon" },
      { name: "Tax & Regulatory Reports", href: "/financial/compliance", status: "Coming Soon" },
    ],
  },
];
  return (
    <main className="mx-auto max-w-7xl p-8">
      <h1 className="text-4xl font-bold">Financial Control Center</h1>

      <p className="mt-3 text-gray-600">
        Monitor, reconcile, and manage all financial operations across the
        NiaTube platform.
      </p>

<div className="mt-10 space-y-12">
  {sections.map((section) => (
    <section key={section.title}>
      <h2 className="text-2xl font-bold text-gray-900">
        {section.title}
      </h2>

      <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {section.items.map((item) => {
          const isActive = item.status === "Active";

          const card = (
            <div
              className={`rounded-xl border bg-white p-6 shadow-sm transition ${
                isActive
                  ? "hover:-translate-y-0.5 hover:shadow-md"
                  : "opacity-70"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {item.name}
                </h3>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <p className="mt-4 text-sm text-gray-600">
                {isActive
                  ? "Open this financial operations workspace."
                  : "This module will become available as the related financial system is completed."}
              </p>
            </div>
          );

          return isActive ? (
            <a key={item.name} href={item.href} className="block">
              {card}
            </a>
          ) : (
            <div key={item.name}>{card}</div>
          );
        })}
      </div>
    </section>
  ))}
</div>
    </main>
  );
}