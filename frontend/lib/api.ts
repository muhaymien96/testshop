import axios, { AxiosInstance, AxiosResponse } from "axios";
import { Product, Order } from "../types";

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL as string) || "http://localhost:3001/api";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ========================
   INTERCEPTORS
======================== */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Network Error:", {
        message: error.message,
        code: error.code,
        baseURL: API_BASE_URL,
      });
    }
    return Promise.reject(error);
  }
);

/* ========================
   PRODUCTS
======================== */
export const productsAPI = {
  getAll: (params?: Record<string, any>): Promise<AxiosResponse<Product[]>> =>
    api.get("/products", { params }),

  getById: (id: string | number): Promise<AxiosResponse<Product>> =>
    api.get(`/products/${id}`),

  getCategories: (): Promise<AxiosResponse<string[]>> =>
    api.get("/products/meta/categories"),
};

/* ========================
   CART
======================== */
export const cartAPI = {
  add: (
    sessionId: string,
    productId: string | number,
    quantity: number
  ): Promise<AxiosResponse> =>
    api.post("/cart/add", { sessionId, productId, quantity }),

  get: (sessionId: string): Promise<AxiosResponse> =>
    api.get(`/cart/${sessionId}`),

  clear: (sessionId: string): Promise<AxiosResponse> =>
    api.delete(`/cart/${sessionId}`),
};

/* =========================
   CHECKOUT
======================== */
export const checkoutAPI = {
  process: (orderData: Order): Promise<AxiosResponse<Order>> =>
    api.post("/checkout", orderData),

  getOrder: (orderId: string | number): Promise<AxiosResponse<Order>> =>
    api.get(`/checkout/orders/${orderId}`),
};

/* ========================
   ADMIN
======================== */
export const adminAPI = {
  getMetrics: (): Promise<AxiosResponse<Record<string, any>>> =>
    api.get("/admin/metrics"),

  getDocs: (): Promise<AxiosResponse<Record<string, any>>> =>
    api.get("/admin/docs"),
};

/* ========================
   HEALTH
======================== */
export const healthCheck = (): Promise<AxiosResponse<string>> =>
  api.get("/health");

export default api;
