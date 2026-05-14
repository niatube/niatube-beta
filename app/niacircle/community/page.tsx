import Link from "next/link";
import Navbar from "@/components/Navbar";

const sections = [
  {
    title: "Upload Video",
    description: "Upload exclusive NiaCircle creator content.",
    href: "/niacircle/upload",
    icon: "⬆️",
    bg: "bg-yellow-50 border-yellow-300",
  },
  {
    title: "Start Live Event",
    description: "Go live with your audience and community.",
    href: "/niacircle/live",
    icon: "🔴",
    bg: "bg-red-50 border-red-300",
  },
  {
    title: "Explore NiaCircle Videos",
    description: "Watch creator videos and featured content.",
    href: "/niacircle/videos",
    icon: "🎬",
    bg: "bg-blue-50 border-blue-300",
  },
  {
    title: "Community Discussions",
    description: "Join creator conversations and discussions.",
    href: "/niacircle/discussions",
    icon: "💬",
    bg: "bg-green-50 border-green-300",
  },
  {
    title: "Featured Creators",
    description: "Discover highlighted NiaCircle creators.",
    href: "/niacircle/featured",
    icon: "⭐",
    bg: "bg-purple-50 border-purple-300",
  },
  {
    title: "Exclusive Events",
    description: "Access private creator and community events.",
    href: "/niacircle/events",
    icon: "🎟️",
    bg: "bg-pink-50 border-pink-300",
  },
  {
    title: "Creator Collaborations",
    description: "Find collaboration opportunities with creators.",
    href: "/niacircle/collaborations",
    icon: "🤝",
    bg: "bg-orange-50 border-orange-300",
  },
  {
    title: "NiaCircle Newsroom",
    description: "Latest NiaCircle creator and platform news.",
    href: "/niacircle/newsroom",
    icon: "📰",
    bg: "bg-cyan-50 border-cyan-300",
  },
  {
    title: "Private Announcements",
    description: "Internal updates for NiaCircle members.",
    href: "/niacircle/announcements",
    icon: "📢",
    bg: "bg-gray-100 border-gray-300",
  },
];

export default function NiaCircleCommunityPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <p className="mb-3 text-sm font-black uppercase text-yellow-600">
            NiaCircle Community
          </p>

          <h1 className="text-5xl font-black text-gray-900">
            Welcome to the NiaCircle Space
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-gray-700">
            A private creator community built for collaboration, culture,
            leadership, media innovation, and Pan-African storytelling.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sections.map((section) => (
              <Link
                key={section.title}
                href={section.href}
                className={`rounded-3xl border-2 p-8 shadow-sm transition hover:scale-[1.02] ${section.bg}`}
              >
                <div className="mb-5 text-5xl">{section.icon}</div>

                <h2 className="text-2xl font-black text-gray-900">
                  {section.title}
                </h2>

                <p className="mt-4 text-gray-700">
                  {section.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}