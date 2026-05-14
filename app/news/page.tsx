"use client";

import Navbar from "@/components/Navbar";

export default function NewsPage() {
  
  <Navbar />
  
  return (
    <main className="min-h-screen bg-gray-50">
  <Navbar />
    
      <h1 className="text-4xl font-extrabold mb-6">
        African News on NiaTube
      </h1>

      <div className="space-y-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-xl font-bold">
            Pan-African Politics Weekly
          </h3>
          <p className="text-gray-600">
            Latest updates across African leadership and policy.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-xl font-bold">
            Economic Growth in East Africa
          </h3>
          <p className="text-gray-600">
            New trends shaping the region’s economy.
          </p>
        </div>
      </div>
    </main>
  );
}