export default function Home() {
  return (
    <div className="min-h-[60vh] bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">RDEC Notes & PYQ Portal</h1>
          <p className="mt-4 text-blue-100">Find and share notes, previous year question papers, syllabus, and lab manuals for R. D. Engineering College.</p>
          <div className="mt-8 flex gap-3">
            <a href="/browse" className="px-5 py-3 rounded-md bg-white text-blue-900 font-medium hover:bg-blue-50">Browse Resources</a>
            <a href="/upload" className="px-5 py-3 rounded-md border border-white/50 hover:bg-white/10">Upload</a>
          </div>
        </div>
      </main>
    </div>
  );
}
