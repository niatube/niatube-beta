"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";

type NotificationItem = {
  id: string;
  creator_name: string;
  type: string;
  title: string;
  message: string;
  read?: boolean;
  created_at?: string;
};

export default function Navbar({ simple = false }: { simple?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const pathname = usePathname();

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  useEffect(() => {
    setMenuOpen(false);
    setNotificationOpen(false);
  }, [pathname]);

  useEffect(() => {
    async function loadUserAndNotifications() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoggedIn(false);
        setCreatorName("");
        setNotifications([]);
        return;
      }

      setIsLoggedIn(true);

      let activeCreatorName =
        user.user_metadata?.creator_name || user.email?.split("@")[0] || "";

      const { data: profileByEmail } = await supabase
        .from("creator_profiles")
        .select("creator_name,email")
        .eq("email", user.email)
        .maybeSingle();

      if (profileByEmail?.creator_name) {
        activeCreatorName = profileByEmail.creator_name;
      }

      setCreatorName(activeCreatorName);

      if (!activeCreatorName) return;

      const { data: notificationsData } = await supabase
        .from("notifications")
        .select("*")
        .eq("creator_name", activeCreatorName)
        .order("created_at", { ascending: false })
        .limit(5);

      setNotifications((notificationsData || []) as NotificationItem[]);
    }

    loadUserAndNotifications();
  }, [pathname]);

  useEffect(() => {
    if (!creatorName) return;

    const channel = supabase
      .channel(`navbar-notifications-${creatorName}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `creator_name=eq.${creatorName}`,
        },
        (payload) => {
          const newNotification = payload.new as NotificationItem;

          setNotifications((prev) => {
            const alreadyExists = prev.some(
              (notification) => notification.id === newNotification.id
            );

            if (alreadyExists) return prev;

            return [newNotification, ...prev].slice(0, 5);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [creatorName]);

  async function markNotificationsAsRead() {
    const unreadIds = notifications
      .filter((notification) => !notification.read)
      .map((notification) => notification.id);

    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", unreadIds);

    if (error) {
      console.error("Notification update error:", error);
      return;
    }

    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  }

  async function clearReadNotifications() {
    const readIds = notifications
      .filter((notification) => notification.read)
      .map((notification) => notification.id);

    if (readIds.length === 0) return;

    const { error } = await supabase
      .from("notifications")
      .delete()
      .in("id", readIds);

    if (error) {
      console.error("Notification delete error:", error);
      return;
    }

    setNotifications((prev) =>
      prev.filter((notification) => !notification.read)
    );
  }

  function handleSearch() {
    if (!searchQuery.trim()) return;

    window.location.href = `/discover?q=${encodeURIComponent(
      searchQuery.trim()
    )}`;
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    setIsLoggedIn(false);
    setCreatorName("");
    setNotifications([]);
    setNotificationOpen(false);
    setMenuOpen(false);

    window.location.href = "/";
  }

  return (
    <header className="pt-0">
      <div className="w-full px-2">
        <div className="relative flex items-center justify-between px-1">
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
                className="h-28 object-contain"
              />
            </Link>

            {!simple && (
              <input
                type="text"
                placeholder="Search videos or creators"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="hidden w-[260px] rounded-full border px-4 py-2 text-sm lg:block xl:w-[380px]"
              />
            )}
          </div>

          {menuOpen && (
            <div className="absolute left-3 right-3 top-20 z-50 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl md:left-4 md:right-auto md:w-64">
              {!simple && (
                <input
                  type="text"
                  placeholder="Search videos or creators"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  className="mb-3 w-full rounded-full border px-4 py-2 text-sm"
                />
              )}

              <Link className="block rounded-lg px-4 py-2 text-sm font-bold hover:bg-yellow-50 hover:text-yellow-700" href="/">
                Home
              </Link>
              <Link className="block rounded-lg px-4 py-2 text-sm font-medium hover:bg-yellow-50 hover:text-yellow-700" href="/category/news">
                News
              </Link>
              <Link className="block rounded-lg px-4 py-2 text-sm font-medium hover:bg-yellow-50 hover:text-yellow-700" href="/trending">
                Trending
              </Link>
              <Link className="block rounded-lg px-4 py-2 text-sm font-medium hover:bg-yellow-50 hover:text-yellow-700" href="/live">
                🔴 Live
              </Link>
              <Link className="block rounded-lg px-4 py-2 text-sm font-medium hover:bg-yellow-50 hover:text-yellow-700" href="/category/culture">
                Culture
              </Link>
              <Link className="block rounded-lg px-4 py-2 text-sm font-medium hover:bg-yellow-50 hover:text-yellow-700" href="/category/afrobeats">
                Afrobeats
              </Link>
              <Link
               className="block rounded-lg px-4 py-2 text-sm font-medium hover:bg-yellow-50 hover:text-yellow-700"
               href="/category/sports"
               >
               Sports
             </Link>
              <Link className="block rounded-lg px-4 py-2 text-sm font-medium hover:bg-yellow-50 hover:text-yellow-700" href="/niamall">
                NiaMALL
              </Link>
              <Link className="block rounded-lg px-4 py-2 text-sm font-medium hover:bg-yellow-50 hover:text-yellow-700" href="/category/shorts">
                Shorts
              </Link>
              <Link className="block rounded-lg px-4 py-2 text-sm font-medium hover:bg-yellow-50 hover:text-yellow-700" href="/niacircle">
                NiaCircle
              </Link>
              <Link className="block rounded-lg px-4 py-2 text-sm font-medium hover:bg-yellow-50 hover:text-yellow-700" href="/category/history">
                History
              </Link>
              <Link className="block rounded-lg px-4 py-2 text-sm font-medium hover:bg-yellow-50 hover:text-yellow-700" href="/language">
                Language
              </Link>
              <Link className="block rounded-lg px-4 py-2 text-sm font-medium hover:bg-yellow-50 hover:text-yellow-700" href="/creator-dashboard">
                Creator Dashboard
              </Link>
              <Link
  className="block rounded-lg bg-yellow-400 px-4 py-2 text-sm font-black text-black hover:bg-yellow-300"
  href="/admin/access"
>
  Admin Control Center
</Link>

              <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3">
                <Link
                  href={isLoggedIn ? "/upload" : "/login"}
                  className="rounded-lg bg-black px-4 py-2 text-center text-sm font-bold text-white hover:bg-gray-800"
                >
                  Upload
                </Link>

                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg border border-red-500 px-4 py-2 text-center text-sm font-bold text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="rounded-lg border-2 border-green-600 px-4 py-2 text-center text-sm font-bold text-black hover:bg-gray-100"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          )}

          {!simple && (
            <nav className="ml-6 hidden items-center gap-4 text-[15px] font-medium md:flex">
              <Link href="/category/news">News</Link>
              <Link href="/trending">Trending</Link>
              <Link href="/category/shorts">Shorts</Link>
              <Link href="/category/culture">Culture</Link>
              <Link href="/category/afrobeats">Afrobeats</Link>
              <Link href="/category/sports">Sports</Link>
              <Link href="/niamall">NiaMALL</Link>

              <Link
                href="/login"
                className="flex items-center gap-2 rounded-md bg-red-500 px-2.5 py-1 text-sm font-semibold text-white"
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-white"></span>
                Live
              </Link>

              <Link href="/niacircle">NiaCircle</Link>
              <Link href="/category/history">History</Link>
              <Link href="/language">Language</Link>

              {isLoggedIn && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setNotificationOpen((prev) => !prev)}
                    className="relative rounded-full border border-gray-200 bg-white px-3 py-2 text-lg shadow-sm hover:bg-gray-50"
                    aria-label="Notifications"
                  >
                    🔔

                    {unreadCount > 0 && (
                      <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-black text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationOpen && (
                    <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-black text-gray-900">
                          Notifications
                        </h3>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={markNotificationsAsRead}
                            disabled={unreadCount === 0}
                            className="text-xs font-bold text-gray-600 hover:text-black disabled:opacity-40"
                          >
                            Mark read
                          </button>

                          <button
                            onClick={clearReadNotifications}
                            className="text-xs font-bold text-red-600 hover:text-red-800"
                          >
                            Clear read
                          </button>
                        </div>
                      </div>

                      {notifications.length === 0 ? (
                        <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                          No notifications yet.
                        </p>
                      ) : (
                        <div className="mt-4 space-y-3">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`rounded-xl border p-3 ${
                                notification.read
                                  ? "border-gray-200 bg-gray-50"
                                  : "border-yellow-300 bg-yellow-50"
                              }`}
                            >
                              <p className="text-xs font-black uppercase text-gray-500">
                                {notification.type}
                              </p>

                              <p className="mt-1 text-sm font-black text-gray-900">
                                {notification.title}
                              </p>

                              <p className="mt-1 text-xs text-gray-600">
                                {notification.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      <Link
                        href="/creator-dashboard"
                        className="mt-4 block rounded-xl bg-black px-4 py-2 text-center text-sm font-bold text-white hover:bg-gray-800"
                      >
                        View dashboard
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <Link
                href={isLoggedIn ? "/upload" : "/login"}
                className="rounded-lg bg-black px-3 py-1.5 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Upload
              </Link>

              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-red-500 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-lg border-2 border-green-600 px-3 py-1.5 text-sm font-semibold text-black hover:bg-gray-100"
                  >
                    Login
                  </Link>

                  <Link
                    href="/signup"
                    className="rounded-lg bg-yellow-400 px-3 py-1.5 text-sm font-semibold text-black hover:bg-yellow-300"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}