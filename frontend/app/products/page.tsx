"use client";

import { useEffect, useState } from "react";
import ProductCard from "../../components/ProductCard";
import { productsAPI } from "../../lib/api";
import { Product } from "../../types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const catRes = await productsAPI.getCategories();
        const catPayload = (catRes.data as any)?.data || (catRes.data as any);
        if (Array.isArray(catPayload)) setCategories(catPayload as string[]);
      } catch (e) {
        // ignore
      }

      try {
        const params: any = {};
        if (query) params.search = query;
        if (category) params.category = category;
        if (sortBy) params.sortBy = sortBy;
        const r = await productsAPI.getAll(params);
        if (!mounted) return;
        const payload = (r.data as any)?.data || (r.data as any);
        const items: Product[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];
        setProducts(items);
      } catch (e) {
        console.error(e);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [query, category, sortBy]);

  return (
    <section className="py-8 sm:py-12">
      <div className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">Products</h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">Use this app to practice UI, API and E2E automation. Add products to cart and checkout.</p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className="w-full sm:w-64 p-2 border rounded" />
          <select value={category || ""} onChange={(e) => setCategory(e.target.value || null)} className="p-2 border rounded">
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <select value={sortBy || ""} onChange={(e) => setSortBy(e.target.value || null)} className="p-2 border rounded">
            <option value="">Sort</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full" />
          </div>
          <span className="ml-3 text-slate-600 font-medium">Loading products…</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-red-800">Error loading products</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={String(p.id)} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
