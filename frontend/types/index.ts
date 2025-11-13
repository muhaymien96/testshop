export interface Product {
  id: string | number;
  title: string;
  description?: string;
  price: number | string;
  image?: string;
  category?: string;
  [key: string]: any;
}

export interface CartItem {
  id: string | number;
  qty: number;
  price?: number | string;
  title?: string;
}

export interface Order {
  id?: string | number;
  sessionId?: string;
  items: CartItem[];
  total: number;
  paymentMethod?: string;
  billing?: Record<string, any>;
}
