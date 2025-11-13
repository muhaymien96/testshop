"use client";

import { useEffect, useState } from "react";
import { checkoutAPI, authAPI } from "../../lib/api";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const me = await authAPI.me();
        if (!me?.data?.data) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }
        const res = await checkoutAPI.myOrders();
  const payload = (res.data as any)?.data || (res.data as any);
  setOrders(Array.isArray(payload) ? payload : []);
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="py-12">Loading orders…</div>;
  if (error) return <div className="py-12 text-red-600">{error === 'Not authenticated' ? (
    <>
      <p>You must be logged in to view your orders.</p>
      <p className="mt-2"><a href="/login" className="text-blue-600 underline">Login</a> and try again.</p>
    </>
  ) : error}</div>;

  return (
    <section className="py-8">
      <h1 className="text-2xl font-semibold mb-4">My Orders</h1>
      <p className="text-sm text-slate-600 mb-4">Orders placed while logged in will appear here. Use the test account to try end-to-end flows.</p>
      {orders.length === 0 ? (
        <div className="bg-white p-6 rounded shadow">You have no orders.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">Order {o.id}</div>
              <div className="text-sm text-slate-500">{new Date(o.createdAt ?? o.created_at).toLocaleString()}</div>
                </div>
                <div className="text-lg font-bold">R{Number(o.total).toFixed(2)}</div>
              </div>

              <ul className="mt-3 space-y-2">
                {Array.isArray(o.items) && o.items.map((it: any, idx: number) => {
                  const qty = it.quantity ?? it.qty ?? 1;
                  const pid = it.productId ?? it.product?.id ?? `unknown-${idx}`;
                  const price = Number(it.price ?? it.product?.price ?? 0);
                  return (
                    <li key={`${o.id}-${pid}-${idx}`} className="text-sm text-slate-700">
                      {qty}× product #{pid} — R{price.toFixed(2)}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
