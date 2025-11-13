import "@/app/globals.css";
import Header from "../components/Header";
import type { ReactNode } from "react";

export const metadata = {
  title: "Test Shop — QA Practice",
  description: "A demo e-commerce app built for test automation practice",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Tailwind CDN */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 antialiased">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 mt-auto py-8 bg-white/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-600">
            <p>© 2025 Test Shop. Built for QA automation practice.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
