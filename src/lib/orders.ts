import { supabase } from '@/integrations/supabase/client';

const TOKEN_KEY = 'haamkay_guest_token';
const DETAILS_KEY = 'haamkay_customer_details';

export interface OrderItem {
  id?: string;
  product_id?: string | null;
  name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
  status?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  address: string | null;
  note: string | null;
  total: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

export interface CustomerDetails {
  customer_name: string;
  phone: string;
  address?: string;
  note?: string;
}

export function guestToken(): string {
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

export function loadCustomerDetails(): Partial<CustomerDetails> {
  try {
    return JSON.parse(localStorage.getItem(DETAILS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveCustomerDetails(details: CustomerDetails) {
  try {
    localStorage.setItem(DETAILS_KEY, JSON.stringify(details));
  } catch {
    /* ignore */
  }
}

/** Creates a real order in the shop's system. Throws with a readable message on failure. */
export async function placeOrder(details: CustomerDetails, items: OrderItem[]): Promise<Order> {
  const { data, error } = await supabase.functions.invoke('orders', {
    body: { action: 'create', guest_token: guestToken(), ...details, items },
  });
  if (error) throw new Error(error.message || 'Could not send your order. Please try again.');
  if (data?.error) throw new Error(data.error);
  return data.order as Order;
}

export async function listMyOrders(): Promise<Order[]> {
  const { data, error } = await supabase.functions.invoke('orders', {
    body: { action: 'list', guest_token: guestToken() },
  });
  if (error || data?.error) return [];
  return (data?.orders ?? []) as Order[];
}
