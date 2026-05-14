import Navbar from "@/components/Navbar";

export default function VlogsPage() {
  return (
    <>
      <Navbar simple />

      <main className="min-h-screen bg-white px-6 py-6">
        <h1 className="mb-4 text-3xl font-extrabold">Vlogs</h1>
        <p>Creator vlogs will appear here.</p>
      </main>
    </>
  );
}