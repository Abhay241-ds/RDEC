import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-800`}>
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <a className="hover:text-blue-800" href="/browse">Browse</a>
              <a className="hover:text-blue-800" href="/upload">Upload</a>
              <a className="hover:text-blue-800" href="/login">Login</a>
            </nav>
            <a href="/upload" className="md:inline-flex hidden px-4 py-2 rounded-md bg-blue-800 text-white hover:bg-blue-700">Submit Resource</a>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-slate-600 flex flex-col sm:flex-row gap-2 sm:gap-6 items-center justify-between">
            <div>© {new Date().getFullYear()} R. D. Engineering College</div>
            <div className="flex gap-4">
              <a className="hover:text-blue-800" href="/about">About</a>
              <a className="hover:text-blue-800" href="/admin">Admin</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
