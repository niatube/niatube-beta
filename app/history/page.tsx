import Navbar from "@/components/Navbar";


export default function HistoryPage() {
  return (
    <>
       <Navbar />

      <main className="min-h-screen bg-white px-6 py-6">
        
        <h1 className="mb-4 text-3xl font-extrabold">History</h1>
        <p>Your watch history will appear here.</p>
      </main>
    </>
  );
}