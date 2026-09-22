import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  images: string[];
  featured: boolean;
  is_highlight: boolean;
}

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(8);

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-2 md:mb-4">
              Curated For You
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg">
              Handpicked favorites from our luxury collection
            </p>
          </div>
          <Link
            to="/categories"
            className="flex items-center gap-2 text-gold hover:gap-4 transition-all font-medium text-sm md:text-base"
          >
            View All
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card-luxury animate-pulse p-3 md:p-6">
                <div className="aspect-[3/4] bg-muted rounded-lg md:rounded-xl mb-3 md:mb-4" />
                <div className="h-3 md:h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-4 md:h-6 bg-muted rounded w-2/3 mb-2" />
                <div className="h-4 md:h-6 bg-muted rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {products.map((product) => (
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
        ) : (
          <div className="text-center py-12 md:py-16">
            <p className="text-muted-foreground text-sm md:text-lg">
              No featured products yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
