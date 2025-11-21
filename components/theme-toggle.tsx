"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "theme";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial: Theme = stored === "dark" || stored === "light" ? stored : "light";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
    applyTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="ml-4 w-10 h-10 flex items-center justify-center rounded-full border border-[#4F7C81] bg-[#93B1B5]/30 text-[#0F2A2D] transition-all duration-300 hover:bg-[#4F7C81] hover:text-white dark:bg-[#4F7C81] dark:text-white"
    >
      <span aria-hidden="true" className="text-lg">
        {theme === "dark" ? "☀" : "🌙"}
      </span>
    </button>
  );
}
