"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar({ simple = false }: { simple?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="pt-0">
      <div className="w-full px-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-2xl font-bold text-gray-800 transition hover:text-yellow-600"
              aria-label="Open menu"
            >
              ☰
            </button>

            <Link href="/">
              <img
                src="/niatube-logo.png"
                alt="NiaTube"
                className="h-29 object-contain"
              />
            </Link>

            {!simple && (
              <input
                type="text"
                placeholder="Search videos or creators"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    router.push(
                      `/discover?q=${encodeURIComponent(searchQuery.trim())}`
                    );
                    setSearchQuery("");
                  }
                }}
                className="hidden w-[260px] rounded-full border px-4 py-2 text-sm lg:block xl:w-[380px]"
              />
            )}
          </div>

          {menuOpen && (
            <div className="absolute left-4 top-20 z-50 w-56 rounded-xl border border-gray-100 bg-white p-3 shadow-xl">
              <Link className="block rounded-lg px-4 py-2 text-sm font-medium hover:bg-yellow-50 hover:text-yellow-700" href="/">
                Home
              </Link>
              <Link className="block rounded-lg px-4 py-2 text-sm font-medium hover:bg-yellow-50 hover:text-yellow-700" href="/about">
                About
              </Link>
              <Link className="block rounded-lg px-4 py-2 text-sm font-medium hover:bg-yellow-50 hover:text-yellow-700" href="/history">
                History
              </Link>
              <Link className="block rounded-lg px-4 py-2 text-sm font-medium hover:bg-yellow-50 hover:text-yellow-700" href="/shorts">
                Shorts
              </Link>
              <Link className="block rounded-lg px-4 py-2 text-sm font-medium hover:bg-yellow-50 hover:text-yellow-700" href="/niacircle">
                NiaCircle
              </Link>
              <Link className="block rounded-lg px-4 py-2 text-sm font-medium hover:bg-yellow-50 hover:text-yellow-700" href="/vlogs">
                Vlogs
              </Link>
            </div>
          )}

          {!simple && (
            <nav className="ml-6 hidden items-center gap-5 text-[16px] font-medium md:flex">
              <Link href="/news">News</Link>
              <Link href="/trending">Trending</Link>
              <Link href="/shorts">Shorts</Link>
              <Link href="/category/culture">Culture</Link>
              <Link href="/category/music">Music</Link>

              <Link
                href="/login"
                className="flex items-center gap-2 rounded-md bg-red-500 px-2.5 py-1 text-sm font-semibold text-white"
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-white"></span>
                Live
              </Link>

              <Link href="/niacircle">NiaCircle</Link>
              <Link href="/history">History</Link>
              <Link href="/language">Language</Link>

              <Link
                href="/login"
                className="ml-4 rounded-lg bg-black px-3 py-1.5 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Upload
              </Link>

              <Link
                href="/login"
                className="rounded-lg border-2 border-green-600 px-3 py-1.5 text-sm font-semibold text-black hover:bg-gray-100"
              >
                Login
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}