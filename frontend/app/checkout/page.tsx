"use client";

import { useEffect, useState } from "react";
import { fetchCart, clearCartServer, fetchCurrentUser } from "../../lib/helpers";
import { checkoutAPI, authAPI } from "../../lib/api";
import { CartItem } from "../../types";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // ensure auth — server will reply 401 if not logged in
        const me = await authAPI.me();
        if (!me?.data?.data) {
          router.push('/login?next=/checkout');
          return;
        }
  if (!mounted) return;
  const meData = me.data.data;
  setUser(meData);
  // set form fields from user
  setName(meData?.name ?? '');
  setEmail(meData?.email ?? '');

  const cartPayload = await fetchCart();
  const items = Array.isArray(cartPayload?.items) ? cartPayload.items.map((it: any) => ({ id: it.productId, qty: it.quantity, price: it.product?.price || it.price } as CartItem)) : [];
  if (!mounted) return;
  setCartItems(items as CartItem[]);
      } catch (e) {
        // if unauthenticated fetch failed, redirect to login
        try {
          router.push('/login?next=/checkout');
        } catch {}
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const total = cartItems.reduce((s, it) => s + it.qty * Number(it.price || 0), 0);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    // Build payload using CartItem shape (id/qty) which backend accepts
    const orderPayload = {
      items: cartItems.map((c) => ({ id: c.id, qty: c.qty, price: c.price })),
      total,
      billing: {
        name: name || user?.name || 'Test User',
        email: email || user?.email || 'qa@example.com'
      },
      paymentMethod: "card_simulated"
    };

    try {
      const res = await checkoutAPI.process(orderPayload as any);
      // backend returns { success, data }
      const payloadRes = res.data as any;
      const order = payloadRes?.data ?? payloadRes;
      // clear server cart on success
      try { await clearCartServer(); } catch {}
      // notify other windows/components that cart changed so header badge updates
      try { window.dispatchEvent(new CustomEvent("cart:updated")); } catch {}
      // redirect to confirmation page with order id as query param
      router.push(`/order-confirmation?orderId=${order?.id ?? "simulated"}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message ?? "Checkout failed");
      setProcessing(false);
    }
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Checkout</h1>

      <div className="bg-white p-6 rounded shadow">
        <p className="mb-4">Order total: <strong>R{total.toFixed(2)}</strong></p>

        {error && <div className="mb-4 text-red-700">{error}</div>}

        <form onSubmit={handleCheckout}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Name</label>
            <input className="mt-1 w-full border rounded p-2" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">Email</label>
            <input className="mt-1 w-full border rounded p-2" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={processing || cartItems.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-60"
            >
              {processing ? "Processing…" : "Simulate Payment & Place Order"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
