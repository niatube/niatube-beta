"use client";

export default function LeaderboardPage() {
  const creators = [
    { name: "PanAfrica Live", subs: "12.4K", rank: 1 },
    { name: "Ubuntu Stories", subs: "9.8K", rank: 2 },
    { name: "Diaspora Lens", subs: "7.1K", rank: 3 },
  ];

  return (
    <main className="min-h-screen bg-[#f6f6f6] p-6">
      <h1 className="text-4xl font-extrabold mb-6">
        Creator Leaderboard
      </h1>

      <div className="max-w-xl space-y-4">
        {creators.map((creator) => (
          <div
            key={creator.rank}
            className="flex items-center justify-between bg-white p-4 rounded-xl shadow"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl font-extrabold">
                #{creator.rank}
              </span>

              <div>
                <div className="text-lg font-bold">
                  {creator.name}
                </div>
                <div className="text-sm text-gray-600">
                  {creator.subs} subscribers
                </div>
              </div>
            </div>

            <span className="bg-yellow-400 px-3 py-1 rounded-full font-bold">
              Top
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}