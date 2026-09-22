import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Star, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/home/ProductCard';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  images: string[] | null;
  featured: boolean;
  is_highlight: boolean;
}

const Trending = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setFeaturedProducts(data.filter(p => p.featured));
        setAllProducts(data);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 md:pt-40 pb-12 md:pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-destructive/20 rounded-full text-destructive mb-3 md:mb-4">
              <Flame className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm font-medium">Hot Right Now</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-3 md:mb-4">
              <span className="text-gold-gradient">Trending</span> Products
            </h1>
            <p className="text-muted-foreground text-xs md:text-base max-w-2xl mx-auto">
              Discover what's popular among our customers
            </p>
          </motion.div>

          {/* Featured Section */}
          {featuredProducts.length > 0 && (
            <div className="mb-10 md:mb-16">
              <h2 className="text-lg md:text-2xl font-serif font-bold text-foreground mb-4 md:mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 md:w-6 md:h-6 text-gold" />
                Featured Products
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                {featuredProducts.slice(0, 6).map(product => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    category={product.category}
                    price={product.price}
                    image={product.images?.[0] || ''}
                    featured={product.featured}
                    isHighlight={product.is_highlight}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Trending */}
          <div>
            <h2 className="text-lg md:text-2xl font-serif font-bold text-foreground mb-4 md:mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-gold" />
              Popular Items
            </h2>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="card-luxury animate-pulse p-3 md:p-6">
                    <div className="aspect-[3/4] bg-muted rounded-lg mb-3" />
                    <div className="h-3 bg-muted rounded w-1/3 mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {allProducts.slice(0, 12).map(product => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    category={product.category}
                    price={product.price}
                    image={product.images?.[0] || ''}
                    featured={product.featured}
                    isHighlight={product.is_highlight}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Trending;
