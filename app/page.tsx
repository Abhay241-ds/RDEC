export default function Home() {
  const year = new Date().getFullYear();

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/college.jpg"
            alt="R. D. Engineering College campus"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-blue-800/80 to-blue-900/90" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-white">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Find and share Notes & PYQs</h1>
          <p className="mt-4 max-w-2xl text-blue-100">
            A central hub for R. D. Engineering College students to access quality study material,
            previous year papers, and more.
          </p>
          <div className="mt-8 flex gap-3">
            <a
              href="/browse"
              className="px-5 py-3 rounded-md bg-white text-blue-900 font-medium hover:bg-blue-50"
            >
              Browse Resources
            </a>
            <a
              href="/upload"
              className="px-5 py-3 rounded-md border border-white/50 hover:bg-white/10"
            >
              Upload
            </a>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-blue-600/40 blur-3xl" />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-xl font-semibold text-slate-900">Quick Access</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a href="/browse?type=notes" className="group p-5 rounded-xl border bg-white dark:bg-[#93B1B5] hover:shadow-md">
            <div className="h-10 w-10 grid place-items-center rounded-md bg-blue-100 text-blue-800 font-bold">N</div>
            <div className="mt-4 font-medium">Notes</div>
            <p className="text-sm text-slate-600">Subject-wise curated notes.</p>
          </a>
          <a href="/browse?type=pyq" className="group p-5 rounded-xl border bg-white dark:bg-[#93B1B5] hover:shadow-md">
            <div className="h-10 w-10 grid place-items-center rounded-md bg-blue-100 text-blue-800 font-bold">P</div>
            <div className="mt-4 font-medium">PYQs</div>
            <p className="text-sm text-slate-600">Previous year question papers.</p>
          </a>
          <a href="/browse?type=syllabus" className="group p-5 rounded-xl border bg-white dark:bg-[#93B1B5] hover:shadow-md">
            <div className="h-10 w-10 grid place-items-center rounded-md bg-blue-100 text-blue-800 font-bold">S</div>
            <div className="mt-4 font-medium">Syllabus</div>
            <p className="text-sm text-slate-600">Stay aligned with the curriculum.</p>
          </a>
        </div>
      </section>

      <section className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Departments &amp; Semesters</h3>
            <p className="mt-2 text-slate-600">
              Filter by department, semester, and subject to find exactly what you need.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-sm">CSE</span>
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-sm">CSE(DS)</span>
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-sm">CSE(AIML)</span>
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-sm">IOT</span>
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-sm">IT</span>
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-sm">EC</span>
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-sm">ME</span>
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-sm">CE</span>
            </div>
          </div>
          <div className="p-6 rounded-xl border bg-gradient-to-br from-blue-50 to-white">
            <form action="/browse" className="grid gap-3">
              <div>
                <label className="text-sm text-slate-600">Search</label>
                <input
                  name="q"
                  className="mt-1 w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="e.g., Data Structures notes"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <select name="dept" className="px-3 py-2 rounded-md border">
                  <option value="">Department</option>
                  <option>CSE</option>
                  <option>CSE(DS)</option>
                  <option>CSE(AIML)</option>
                  <option>IOT</option>
                  <option>IT</option>
                  <option>EC</option>
                  <option>ME</option>
                  <option>CE</option>
                </select>
                <select name="sem" className="px-3 py-2 rounded-md border">
                  <option value="">Semester</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5</option>
                  <option>6</option>
                  <option>7</option>
                  <option>8</option>
                </select>
                <select name="type" className="px-3 py-2 rounded-md border">
                  <option value="">Type</option>
                  <option value="notes">Notes</option>
                  <option value="pyq">PYQ</option>
                  <option value="syllabus">Syllabus</option>
                </select>
              </div>
              <button className="mt-2 px-4 py-2 rounded-md bg-blue-800 text-white hover:bg-blue-700">
                Search
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
