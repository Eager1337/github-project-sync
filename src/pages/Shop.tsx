import { useEffect, useMemo, useState } from 'react';
import { Link } from '@/lib/router-compat';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/home/ProductCard';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  images: string[] | null;
  featured: boolean | null;
  is_highlight: boolean | null;
}

const ShopItem = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const image = product.images?.[0] ?? '';

  return (
    <div className="flex flex-col gap-2">
      <ProductCard
        id={product.id}
        name={product.name}
        category={product.category}
        price={product.price}
        image={image}
        featured={product.featured ?? false}
        isHighlight={product.is_highlight ?? false}
      />
      <button
        onClick={() =>
          addToCart(product.id, 1, {
            id: product.id,
            name: product.name,
            price: product.price,
            images: image ? [image] : null,
            category: product.category,
          })
        }
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-3 py-2.5 text-xs md:text-sm font-semibold text-teal-darker transition-opacity hover:opacity-90 active:scale-[0.99]"
      >
        <ShoppingBag className="w-4 h-4" />
        Buy · Add to cart
      </button>
    </div>
  );
};

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { totalItems, totalPrice } = useCart();

  useEffect(() => {
    const load = async () => {
      const { data, error: queryError } = await supabase
        .from('products')
        .select('id, name, category, price, images, featured, is_highlight')
        .order('created_at', { ascending: false });

      if (queryError) setError(queryError.message);
      setProducts(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort(),
    [products]
  );

  const visibleProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 md:pt-40 pb-32 md:pb-40">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-12"
          >
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif font-bold text-foreground">
              Shop All Items
            </h1>
            <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
              Every piece in store, with live prices. Add what you like to your cart and check out —
              or visit us at 53 Malamah Thomas Street, Freetown.
            </p>
          </motion.div>

          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-gold text-teal-darker'
                    : 'bg-muted text-foreground/80 hover:text-gold'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-gold text-teal-darker'
                      : 'bg-muted text-foreground/80 hover:text-gold'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <p className="text-center text-sm text-destructive">
              We couldn't load the items right now: {error}
            </p>
          ) : visibleProducts.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No items to show yet. New pieces are added from the shop every day.
            </p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {visibleProducts.map(product => (
                <ShopItem key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      {totalItems > 0 && (
        <motion.div
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur"
        >
          <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <ShoppingBag className="w-4 h-4 text-gold" />
              <span>
                {totalItems} item{totalItems > 1 ? 's' : ''} · Le {totalPrice.toLocaleString()}
              </span>
            </div>
            <Link
              to="/cart"
              className="px-4 py-2 rounded-lg bg-gold text-teal-darker text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              View cart
            </Link>
          </div>
        </motion.div>
      )}

      <Footer />
    </div>
  );
};

export default Shop;
