"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchCurrentUser, fetchCart, clearCartServer } from "../lib/helpers";
import { useRouter } from "next/navigation";
import { authAPI, cartAPI } from "../lib/api";

export default function Header() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    function update() {
      (async () => {
        try {
          const payload = await fetchCart();
          const items = payload?.items || [];
          const total = items.reduce((s: number, i: any) => s + (i.quantity || 0), 0);
          setCount(total);
        } catch {
          setCount(0);
        }
      })();
    }

    update();
    window.addEventListener("cart:updated", update as EventListener);
    return () => window.removeEventListener("cart:updated", update as EventListener);
  }, []);

  useEffect(() => {
    async function load() {
      const u = await fetchCurrentUser();
      setUser(u);
      try {
        const payload = await fetchCart();
        const count = Array.isArray(payload?.items) ? payload.items.reduce((s: number, it: any) => s + (it.quantity || 0), 0) : 0;
        setCount(count);
      } catch (e) {
        // ignore
      }
    }
    load();
    function onAuth() { load(); }
    window.addEventListener('auth:changed', onAuth);
    return () => { window.removeEventListener('auth:changed', onAuth); };
  }, []);

  return (
  <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-sm border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-[color:var(--accent)] rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-[color:var(--accent)]">
              Test Shop
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors duration-200"
            >
              Products
            </Link>

            <Link
              href="/cart"
              className="relative inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors duration-200"
            >
              {/* shopping bag icon (smaller, fits better) */}
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 11h14l-1 9H6l-1-9z" />
              </svg>
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-white bg-red-600 rounded-full shadow">
                  {count}
                </span>
              )}
            </Link>

            {/* Admin button will appear next to Logout (rendered below) */}

            {/* Orders link visible always; page will ask user to login if needed */}
            <Link href="/order-history" className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors duration-200">Orders</Link>

            {!user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-[color:var(--accent)] hover:bg-[color:var(--accent-2)] transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l7 4v6c0 5-3.58 9.74-7 11-3.42-1.26-7-6-7-11V6l7-4z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.5 12.5l1.5 1.5 3.5-3.5" />
                  </svg>
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-[color:var(--accent)] hover:bg-[color:var(--accent-2)] transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l7 4v6c0 5-3.58 9.74-7 11-3.42-1.26-7-6-7-11V6l7-4z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.5 12.5l1.5 1.5 3.5-3.5" />
                  </svg>
                  <span className="hidden sm:inline">Admin</span>
                </Link>
                <button
                  onClick={async () => {
                    try {
                      await authAPI.logout();
                    } catch (e) {
                      // ignore errors during logout cleanup
                    }
                    try { await clearCartServer(); } catch {}
                    window.dispatchEvent(new CustomEvent('cart:updated'));
                    window.dispatchEvent(new CustomEvent('auth:changed'));
                    setUser(null);
                    router.push('/');
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
