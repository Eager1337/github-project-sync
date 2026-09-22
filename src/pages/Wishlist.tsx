import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Seo from '@/components/seo/Seo';
import { getWishlist, removeFromWishlist, type WishlistItem } from '@/lib/wishlist';
import { useCart } from '@/contexts/CartContext';

const money = (n: number) => `Le ${Math.round(n).toLocaleString()}`;

const Wishlist = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const sync = () => setItems(getWishlist());
    sync();
    window.addEventListener('haamkay-wishlist', sync);
    return () => window.removeEventListener('haamkay-wishlist', sync);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="My Wishlist | Haamkay Enterprises"
        description="Everything you saved for later at Haamkay Enterprises — keep your favourite pieces in one place and order when you are ready."
        path="/wishlist"
      />
      <Header />
      <main className="pt-28 md:pt-40 pb-32 md:pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to shop
          </Link>
          <h1 className="text-2xl md:text-4xl font-serif font-bold mb-8">
            My <span className="text-gold-gradient">Wishlist</span>
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Heart className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-serif font-bold mb-2">Nothing saved yet</h2>
              <p className="text-muted-foreground mb-6">Tap the heart on any product to keep it here.</p>
              <Link to="/categories" className="btn-gold inline-flex">Browse products</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <Link to={`/product/${item.id}`}>
                    <img
                      src={item.image || '/placeholder.svg'}
                      alt={item.name}
                      className="w-full aspect-square object-cover"
                      loading="lazy"
                    />
                  </Link>
                  <div className="p-4 space-y-2">
                    {item.category && <span className="text-xs text-gold uppercase">{item.category}</span>}
                    <h2 className="font-serif font-semibold line-clamp-1">{item.name}</h2>
                    <p className="text-gold font-bold">{money(item.price)}</p>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => addToCart(item.id, 1)}
                        className="btn-gold flex-1 !py-2 flex items-center justify-center gap-2 text-sm"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Add to cart
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
