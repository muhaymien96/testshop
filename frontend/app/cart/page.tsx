"use client";

import { useEffect, useState } from "react";
import Cart from "../../components/Cart";
import { fetchCart, addToCartServer } from "../../lib/helpers";
import Link from "next/link";
import { Product, CartItem } from "../../types";
import { useRouter } from "next/navigation";
import { productsAPI, authAPI } from "../../lib/api";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [detailedItems, setDetailedItems] = useState<(Product & { qty: number })[]>([]);

  useEffect(() => {
    async function loadServerCart() {
      try {
        await productsAPI.getAll({}); // warm products cache
      } catch {}
      try {
        const cartRes = await (await import('../../lib/api')).cartAPI.get();
        const payload = (cartRes.data as any)?.data || (cartRes.data as any);
        const items = Array.isArray(payload?.items) ? payload.items.map((it: any) => ({ id: it.productId, qty: it.quantity, price: it.product?.price || it.price, title: it.product?.title || '' })) : [];
        setCart(items as any);
        return;
      } catch (e) {
        // fallback to empty
      }
      setCart([]);
    }
    loadServerCart();
  }, []);

  useEffect(() => {
    async function fetchDetails() {
      const items: (Product & { qty: number })[] = [];
      for (const item of cart) {
        try {
          const res = await productsAPI.getById(item.id);
          // backend returns { success, data } so unwrap safely
          const payload = res.data as any;
          const prod: Product = Array.isArray(payload)
            ? payload[0]
            : payload?.data
            ? payload.data
            : payload;
          items.push({ ...prod, qty: item.qty });
        } catch (e) {
          // resilient for test scenarios where product might 404
          items.push({ id: item.id, title: "Unknown product", price: item.price ?? 0, qty: item.qty } as any);
        }
      }
      setDetailedItems(items);
    }
    if (cart.length) fetchDetails();
    else setDetailedItems([]);
  }, [cart]);

  function handleChange(newCart: CartItem[]) {
    setCart(newCart);
    // sync to server
    (async () => {
      try {
        for (const it of newCart) {
          await (await import('../../lib/api')).cartAPI.update(it.id, it.qty);
        }
      } catch {}
    })();
  }

  const router = useRouter();

  function handleProceedToCheckout() {
    (async () => {
      try {
        const me = await authAPI.me();
        if (!me?.data?.data) throw new Error('not-auth');
        router.push('/checkout');
      } catch {
        router.push('/login?next=/checkout');
      }
    })();
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Your Cart</h1>
      {detailedItems.length ? (
        <Cart items={detailedItems} onCartChange={handleChange} onCheckout={handleProceedToCheckout} />
      ) : (
        <div className="bg-white p-6 rounded shadow">
          <p className="mb-4">Your cart is empty.</p>
          <Link href="/" className="text-blue-600 underline">Back to products</Link>
        </div>
      )}

      <div className="mt-6">
        <Link href="/checkout" className="inline-block px-4 py-2 bg-green-600 text-white rounded">
          Proceed to Checkout
        </Link>
      </div>
    </section>
  );
}
