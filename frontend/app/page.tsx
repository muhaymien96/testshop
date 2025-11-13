"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="py-16 text-center">
      <div className="mx-auto max-w-3xl p-10 rounded-2xl shadow-xl hero-card border border-slate-100">
        <h1 className="text-5xl font-extrabold mb-4 text-slate-900">Welcome to <span style={{color: 'var(--accent)'}}>Test Shop</span></h1>
        <p className="text-lg text-slate-600 mb-6">A lightweight demo e‑commerce app for UI/API/E2E automation practice. Fast to run, easy to test.</p>

        <div className="flex items-center justify-center gap-4 mb-6">
          <Link href="/products" className="px-6 py-3 bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--accent-2)] text-white rounded-lg shadow-md">Browse Products</Link>
          <Link href="/admin" className="px-6 py-3 border border-slate-200 rounded-lg text-slate-700">Admin / Docs</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mt-6">
          <div className="p-4 rounded-lg bg-white/60 backdrop-blur-sm">
            <div className="font-semibold text-slate-800">Real APIs</div>
            <div className="text-sm text-slate-600">Server-backed cart, HttpOnly auth cookies and persistent orders.</div>
          </div>
          <div className="p-4 rounded-lg bg-white/60 backdrop-blur-sm">
            <div className="font-semibold text-slate-800">Test Friendly</div>
            <div className="text-sm text-slate-600">Designed for quick UI/E2E tests — small dataset and predictable flows.</div>
          </div>
          <div className="p-4 rounded-lg bg-white/60 backdrop-blur-sm">
            <div className="font-semibold text-slate-800">Lightweight</div>
            <div className="text-sm text-slate-600">No heavy infra required — runs locally with a Postgres DB and Node.js.</div>
          </div>
        </div>
      </div>

      <section className="mt-10 max-w-4xl mx-auto text-slate-700">
        <h2 className="text-2xl font-semibold mb-3">Quick start</h2>
        <p className="text-sm">Sign in using the seeded test user or browse products as a guest. When you checkout, orders are persisted to the database and appear in <Link href="/order-history" className="text-blue-600 underline">Order History</Link>.</p>
      </section>
    </main>
  );
}
