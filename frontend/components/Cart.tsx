
"use client";

import { CartItem, Product } from "../types";
import { } from "../lib/helpers";
import Link from "next/link";
import { cartAPI } from "../lib/api";

export default function Cart({
  items,
  onCartChange,
  sessionId,
  onCheckout,
}: {
  items: (Product & { qty: number })[];
  onCartChange: (items: CartItem[]) => void;
  sessionId?: string;
  onCheckout?: () => void;
}) {
  function changeQty(id: string | number, qty: number) {
    (async () => {
      try {
        await cartAPI.update(id, qty);
        const res = await cartAPI.get();
        const payload = (res.data as any)?.data || (res.data as any);
        const itemsLocal = Array.isArray(payload?.items) ? payload.items.map((it: any) => ({ id: it.productId, qty: it.quantity, price: it.product?.price || it.price, title: it.product?.title || '' })) : [];
        onCartChange(itemsLocal as any);
        window.dispatchEvent(new CustomEvent('cart:updated'));
      } catch (e) {
        // fallback to local update
        const current = items.map((it) => ({ id: it.id, qty: it.qty, price: it.price, title: it.title }));
        const idx = current.findIndex((c) => String(c.id) === String(id));
        if (idx >= 0) {
          current[idx].qty = qty;
          const filtered = current.filter((c) => c.qty > 0);
          onCartChange(filtered);
          window.dispatchEvent(new CustomEvent("cart:updated"));
        }
      }
    })();
  }

  function removeItem(id: string | number) {
    changeQty(id, 0);
  }

  const total = items.reduce((s, it) => s + it.qty * Number(it.price || 0), 0);

  return (
    <div>
      <ul className="space-y-4">
        {items.map((it) => (
          <li key={String(it.id)} className="bg-white p-4 rounded shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={it.image ?? '/placeholder.png'} alt={it.title} className="w-20 h-20 object-cover rounded-md border" />
              <div>
                <Link href={`/products/${it.id}`} className="font-semibold text-slate-900 hover:underline">{it.title}</Link>
                <div className="text-sm text-slate-500">Price: R{Number(it.price).toFixed(2)}</div>
                <div className="text-sm text-slate-500">Subtotal: <span className="font-medium">R{(it.qty * Number(it.price || 0)).toFixed(2)}</span></div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded overflow-hidden">
                <button onClick={() => changeQty(it.id, Math.max(0, it.qty - 1))} className="px-3 py-1 bg-slate-50 hover:bg-slate-100">−</button>
                <div className="w-12 text-center">{it.qty}</div>
                <button onClick={() => changeQty(it.id, it.qty + 1)} className="px-3 py-1 bg-slate-50 hover:bg-slate-100">＋</button>
              </div>
              <button onClick={() => removeItem(it.id)} className="text-sm text-red-600">Remove</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 bg-white p-4 rounded shadow flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">Total</div>
          <div className="text-xl font-bold text-[color:var(--accent)]">R{total.toFixed(2)}</div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => onCheckout ? onCheckout() : (window.location.href = '/checkout')} className="px-4 py-2 bg-[color:var(--accent)] hover:bg-[color:var(--accent-2)] text-white rounded-lg shadow">Checkout</button>
          <Link href="/products" className="px-4 py-2 border rounded-lg text-slate-700">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}
