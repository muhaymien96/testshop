// Small in-memory cart fallback used when the backend is unreachable.
// This is NOT persisted across page reloads — it's an in-memory Map for temporary offline usage.

type CartItem = { id: number; quantity: number };

const cartMap = new Map<number, number>();

export function getCartInMemory(): { items: CartItem[] } {
  const items = Array.from(cartMap.entries()).map(([id, quantity]) => ({ id, quantity }));
  return { items };
}

export function addInMemory(productId: number, quantity = 1) {
  const prev = cartMap.get(productId) ?? 0;
  cartMap.set(productId, prev + quantity);
  return getCartInMemory();
}

export function updateInMemory(productId: number, quantity: number) {
  if (quantity <= 0) {
    cartMap.delete(productId);
  } else {
    cartMap.set(productId, quantity);
  }
  return getCartInMemory();
}

export function clearInMemory() {
  cartMap.clear();
  return { items: [] };
}

export default {
  getCartInMemory,
  addInMemory,
  updateInMemory,
  clearInMemory,
};
