import { authAPI, cartAPI } from "./api";
import fallback from "./fallbackCart";

// Helpers that use server-side cookies and APIs instead of localStorage.
// When the backend is unreachable we fall back to a small in-memory cart (not persisted across reloads).
export async function fetchCurrentUser() {
  try {
    const res = await authAPI.me();
    return res.data?.data ?? null;
  } catch (err) {
    // network/backend error — treat as not authenticated
    return null;
  }
}

export async function fetchCart() {
  try {
    const res = await cartAPI.get();
    return res.data?.data ?? { items: [] };
  } catch (err) {
    // return in-memory cart when backend is not reachable
    return fallback.getCartInMemory();
  }
}

export async function addToCartServer(productId: number, quantity = 1) {
  try {
    return await cartAPI.add(productId, quantity);
  } catch (err) {
    const data = fallback.addInMemory(productId, quantity);
    // return a similar shape to axios response used elsewhere: { data: { data: ... } }
    return Promise.resolve({ data: { data } });
  }
}

export async function updateCartServer(productId: number, quantity: number) {
  try {
    return await cartAPI.update(productId, quantity);
  } catch (err) {
    const data = fallback.updateInMemory(productId, quantity);
    return Promise.resolve({ data: { data } });
  }
}

export async function clearCartServer() {
  try {
    return await cartAPI.clear();
  } catch (err) {
    const data = fallback.clearInMemory();
    return Promise.resolve({ data: { data } });
  }
}
