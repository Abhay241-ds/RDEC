export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <a
        href="/"
        className="text-blue-800 dark:bg-blue-900 dark:text-white dark:px-3 dark:py-1 dark:rounded-md dark:inline-block"
      >
        ← Home
      </a>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">About</h1>
      <p className="mt-4 text-[30px] text-blue-800 dark:text-white leading-snug">
        The RDEC Notes & PYQ Portal is an internal platform for sharing academic resources across all departments and semesters. Our goal is to make important study material available in one place – including class notes, previous year question papers, syllabus and lab manuals. Students, faculty and admin can upload resources, and each upload is reviewed by the admin team before approval. This helps keep the content clean, organized and useful for everyone preparing for exams or revising concepts.
      </p>
    </div>
  );
}
