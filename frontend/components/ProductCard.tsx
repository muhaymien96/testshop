"use client";

import { Product } from "../types";
import { cartAPI } from "../lib/api";
import { useState } from "react";

export default function ProductCard({ product }: { product: Product }) {
  const price = Number(product.price ?? 0);
  const [open, setOpen] = useState(false);

  async function addToCart() {
    try {
      await cartAPI.add(product.id, 1);
      // refresh server cart and let other components update via event
      try {
        await cartAPI.get();
      } catch {}
    } catch (e) {
      // server unavailable - silently fail or optionally show UI notification
      console.warn('Failed to add to server cart', e);
    }
    window.dispatchEvent(new CustomEvent("cart:updated"));
  }

  return (
    <article className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-100 hover:border-slate-200 test-data" data-product-id={product.id}>
      {/* Image Container */}
      <div className="relative h-48 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        <img 
          src={product.image ?? "/placeholder.png"} 
          alt={product.title} 
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>
        <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {product.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">
            R{price.toFixed(2)}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setOpen(true)} className="px-3 py-2 border rounded text-sm">Quick view</button>
            <button 
              onClick={addToCart} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
            data-testid={`add-${product.id}`}
          >
            <span className="flex items-center gap-1">
              <span>+</span>
              <span className="hidden sm:inline">Add</span>
            </span>
          </button>
          </div>
        </div>
      </div>

      {/* Quick view modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg max-w-2xl w-full mx-4 overflow-hidden">
            <div className="p-4 flex justify-between items-start">
              <h3 className="text-lg font-semibold">{product.title}</h3>
              <button onClick={() => setOpen(false)} className="text-slate-500">Close</button>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <img src={product.image ?? '/placeholder.png'} alt={product.title} className="w-full h-64 object-contain" />
              <div>
                <p className="text-slate-700 mb-4">{product.description}</p>
                <div className="text-2xl font-bold text-blue-600 mb-4">R{price.toFixed(2)}</div>
                <div className="flex gap-2">
                  <button onClick={() => { addToCart(); setOpen(false); }} className="px-4 py-2 bg-blue-600 text-white rounded">Add to cart</button>
                  <button onClick={() => setOpen(false)} className="px-4 py-2 border rounded">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
