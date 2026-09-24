import { createOrder, listOrders } from './orders.functions';

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
  try {
    return (await createOrder({ data: { guest_token: guestToken(), ...details, items } })) as unknown as Order;
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : 'Could not send your order. Please try again.');
  }
}

export async function listMyOrders(): Promise<Order[]> {
  try {
    return (await listOrders({ data: { guest_token: guestToken() } })) as unknown as Order[];
  } catch {
    return [];
  }
}
