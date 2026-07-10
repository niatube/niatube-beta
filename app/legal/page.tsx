import Link from "next/link";

const documents = [
  {
    title: "Terms of Service",
    icon: "📜",
    href: "/terms",
    description:
      "Defines the legal relationship between you and NiaTube.",
  },
  {
    title: "Privacy Policy",
    icon: "🔒",
    href: "/privacy",
    description:
      "Explains how NiaTube collects, uses, and protects personal information.",
  },
  {
    title: "Community Guidelines",
    icon: "🤝",
    href: "/community-guidelines",
    description:
      "Standards that help keep the NiaTube community respectful, safe, and authentic.",
  },
  {
    title: "Cookie Policy",
    icon: "🍪",
    href: "/cookies",
    description:
      "Describes how cookies and similar technologies are used across the Platform.",
  },
  {
    title: "Copyright Policy & DMCA Procedure",
    icon: "©",
    href: "/copyright",
    description:
      "Explains copyright reporting, takedown requests, and intellectual property procedures.",
  },
];

export default function LegalCenterPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="rounded-3xl border border-gray-200 bg-white p-10 shadow-sm">
        <p className="text-sm font-black uppercase tracking-widest text-yellow-700">
          NiaTube Governance
        </p>

        <h1 className="mt-3 text-5xl font-black text-gray-900">
          Legal Center
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-700">
          Welcome to the NiaTube Legal Center. Here you will find the
          policies, standards, and governance documents that help guide
          our Platform and support a safe, transparent, and trusted
          creator ecosystem.
        </p>

        <div className="mt-12 space-y-6">
          {documents.map((doc) => (
            <div
              key={doc.href}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-6 transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {doc.icon} {doc.title}
                  </h2>

                  <p className="mt-3 max-w-3xl leading-7 text-gray-700">
                    {doc.description}
                  </p>
                </div>

                <Link
                  href={doc.href}
                  className="rounded-xl bg-yellow-500 px-5 py-3 font-black text-white transition hover:bg-yellow-600"
                >
                  Read
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-blue-200 bg-blue-50 p-8">
          <h2 className="text-2xl font-black text-gray-900">
            Growing With NiaTube
          </h2>

          <p className="mt-4 leading-8 text-gray-700">
            As NiaTube evolves, additional governance documents,
            creator policies, accessibility resources, financial
            governance standards, and trust &amp; safety policies will
            be added to this Legal Center.
          </p>
        </div>
      </div>
    </main>
  );
}