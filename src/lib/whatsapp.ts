export const WHATSAPP_NUMBER = '23276682626';

const isMobile = () =>
  typeof navigator !== 'undefined' && /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);

/**
 * Builds a WhatsApp link that avoids api.whatsapp.com (blocked on some networks).
 * Mobile uses the wa.me short link, desktop goes straight to WhatsApp Web.
 */
export function whatsappUrl(message?: string, number: string = WHATSAPP_NUMBER) {
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return isMobile()
    ? `https://wa.me/${number}${text}`
    : `https://web.whatsapp.com/send?phone=${number}${message ? `&text=${encodeURIComponent(message)}` : ''}`;
}

/** Opens WhatsApp in a new tab, falling back to the alternate host if blocked. */
export function openWhatsApp(message?: string, number: string = WHATSAPP_NUMBER) {
  const url = whatsappUrl(message, number);
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) window.location.href = url;
}

const money = (n: number) => `Le ${Math.round(n).toLocaleString()}`;

const absolute = (url?: string | null) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window === 'undefined') return url;
  return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

export interface WaProduct {
  id?: string;
  name?: string | null;
  category?: string | null;
  price?: number | null;
  images?: string[] | null;
}

/** Draft for a single product enquiry — includes the photo and a link to the page. */
export function buildProductMessage(product: WaProduct, quantity = 1) {
  const photos = (product.images ?? []).map(absolute).filter(Boolean).slice(0, 5) as string[];
  const link = product.id && typeof window !== 'undefined'
    ? `${window.location.origin}/product/${product.id}`
    : null;

  return [
    '🛍️ *Order from Haamkay Enterprises*',
    '',
    `*${product.name ?? 'Product'}*`,
    product.category ? `Category: ${product.category}` : null,
    `Quantity: ${quantity}`,
    `Price: ${money((product.price ?? 0) * quantity)}`,
    photos.length ? `\n📸 Photos:\n${photos.map((u) => `• ${u}`).join('\n')}` : null,
    link ? `🔗 Product page: ${link}` : null,
    '',
    'Please confirm availability and delivery. Thank you!',
  ]
    .filter(Boolean)
    .join('\n');
}

export interface WaCartItem {
  product_id?: string;
  quantity: number;
  product?: WaProduct | null;
}

/** Draft for a full cart checkout — every line carries its own photo link. */
export function buildCartMessage(items: WaCartItem[], total: number) {
  const lines = items.map((item, i) => {
    const p = item.product ?? {};
    const photos = (p.images ?? []).map(absolute).filter(Boolean).slice(0, 3) as string[];
    const link = (p.id ?? item.product_id) && typeof window !== 'undefined'
      ? `${window.location.origin}/product/${p.id ?? item.product_id}`
      : null;
    return [
      `${i + 1}. *${p.name ?? 'Product'}* × ${item.quantity} — ${money((p.price ?? 0) * item.quantity)}`,
      ...photos.map((u) => `   📸 ${u}`),
      link ? `   🔗 ${link}` : null,
    ]
      .filter(Boolean)
      .join('\n');
  });

  return [
    '🛒 *Order from Haamkay Enterprises*',
    '',
    ...lines,
    '',
    `*Total: ${money(total)}*`,
    '',
    'Please confirm my order and delivery details. Thank you!',
  ].join('\n');
}

export interface WaOrder {
  order_number: string;
  customer_name: string;
  phone: string;
  address?: string | null;
  note?: string | null;
  total: number;
  order_items: Array<{
    product_id?: string | null;
    name: string;
    price: number;
    quantity: number;
    image_url?: string | null;
  }>;
}

/** Draft for a confirmed order — photos, links and delivery details included. */
export function buildOrderMessage(order: WaOrder) {
  const lines = order.order_items.map((item, i) => {
    const photo = absolute(item.image_url);
    const link = item.product_id && typeof window !== 'undefined'
      ? `${window.location.origin}/product/${item.product_id}`
      : null;
    return [
      `${i + 1}. *${item.name}* × ${item.quantity} — ${money(item.price * item.quantity)}`,
      photo ? `   📸 ${photo}` : null,
      link ? `   🔗 ${link}` : null,
    ].filter(Boolean).join('\n');
  });

  return [
    '🛍️ *New order — Haamkay Enterprises*',
    `Order: *${order.order_number}*`,
    '',
    ...lines,
    '',
    `*Total: ${money(order.total)}*`,
    '',
    `👤 ${order.customer_name}`,
    `📞 ${order.phone}`,
    order.address ? `📍 ${order.address}` : null,
    order.note ? `📝 ${order.note}` : null,
    '',
    'Please confirm my order and delivery. Thank you!',
  ].filter(Boolean).join('\n');
}

