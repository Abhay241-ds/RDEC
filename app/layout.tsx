import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeToggle from "@/components/theme-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "R. D. Engineering College | Notes & PYQ",
  description: "RDEC resource portal for Notes and Previous Year Questions.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100`}>
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center">
              <a href="/" className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="R. D. Engineering College logo"
                  className="w-9 h-9 rounded-md object-cover"
                />
                <div className="leading-tight">
                  <div className="font-semibold text-slate-900">R. D. Engineering College</div>
                  <div className="text-xs text-slate-500">Notes • PYQ Portal</div>
                </div>
              </a>
            </div>

            {/* Center: main nav */}
            <nav className="hidden md:flex flex-1 justify-center items-center gap-6 text-sm">
              <a className="hover:text-blue-800" href="/browse">Browse</a>
              <a className="hover:text-blue-800" href="/upload">Upload</a>
              <a className="hover:text-blue-800" href="/login">Login</a>
            </nav>

            {/* Right: Admin link + theme toggle */}
            <div className="hidden md:flex items-center">
              <a className="text-sm hover:text-blue-800" href="/admin">Admin</a>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-slate-600 dark:text-slate-300 flex flex-col sm:flex-row gap-2 sm:gap-6 items-center justify-between">
            <div>© {new Date().getFullYear()} R. D. Engineering College</div>
            <div className="flex gap-4">
              <a className="hover:text-blue-800" href="/about">About</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
