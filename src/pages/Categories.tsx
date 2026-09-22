import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/home/ProductCard';

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  images: string[] | null;
  featured: boolean;
  is_highlight: boolean;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('products').select('*').order('created_at', { ascending: false })
      ]);
      if (cats) setCategories(cats);
      if (prods) setProducts(prods);
      setLoading(false);
    };
    fetchData();
  }, []);

  const byCategory = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const filteredProducts = query
    ? byCategory.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
    : byCategory;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 md:pt-40 pb-12 md:pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 md:mb-12"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-2 md:mb-4">
              Shop by <span className="text-gold-gradient">Category</span>
            </h1>
            <p className="text-muted-foreground text-xs md:text-base max-w-2xl mx-auto">
              Explore our curated collection of premium products
            </p>
          </motion.div>

          {query && (
            <div className="mb-4 flex items-center justify-center gap-3 text-sm">
              <span className="text-muted-foreground">
                Results for “{query}” ({filteredProducts.length})
              </span>
              <button
                onClick={() => setSearchParams({})}
                className="px-3 py-1 rounded-full bg-muted text-foreground hover:bg-gold/20 transition-colors"
              >
                Clear
              </button>
            </div>
          )}


          {/* Category Filter - Horizontal scroll on mobile */}
          <div className="mb-6 md:mb-12 -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0 md:flex-wrap md:justify-center scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 md:px-6 md:py-3 rounded-full font-medium text-sm md:text-base transition-all whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-gold text-teal-darker'
                    : 'bg-muted text-foreground hover:bg-gold/20'
                }`}
              >
                All ({products.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 md:px-6 md:py-3 rounded-full font-medium text-sm md:text-base transition-all whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === cat.name
                      ? 'bg-gold text-teal-darker'
                      : 'bg-muted text-foreground hover:bg-gold/20'
                  }`}
                >
                  {cat.name} ({products.filter(p => p.category === cat.name).length})
                </button>
              ))}
            </div>
          </div>

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
          ) : filteredProducts.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <p className="text-sm md:text-base">No products found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {filteredProducts.map(product => (
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
      </main>
      <Footer />
    </div>
  );
};

export default Categories;
