const KEY = 'haamkay_wishlist';

export type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  category?: string | null;
};

const read = (): WishlistItem[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

const write = (items: WishlistItem[]) => {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('haamkay-wishlist'));
};

export const getWishlist = read;

export const inWishlist = (id: string) => read().some((i) => i.id === id);

export function toggleWishlist(item: WishlistItem): boolean {
  const items = read();
  const exists = items.some((i) => i.id === item.id);
  write(exists ? items.filter((i) => i.id !== item.id) : [...items, item]);
  return !exists;
}

export function removeFromWishlist(id: string) {
  write(read().filter((i) => i.id !== id));
}
