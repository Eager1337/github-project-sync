import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  images: string[];
}

const HighlightSection = () => {
  const [highlight, setHighlight] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHighlight();
  }, []);

  const fetchHighlight = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_highlight', true)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setHighlight(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <section className="py-20 bg-teal-deep">
        <div className="container mx-auto px-6">
          <div className="h-96 bg-muted/20 rounded-3xl animate-pulse" />
        </div>
      </section>
    );
  }

  if (!highlight) {
    return null;
  }

  return (
    <section className="py-20 bg-teal-deep relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold/20 border border-gold/40 rounded-full text-gold text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Today's Highlight
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
            Special Pick of the Day
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden glow-gold">
              <img
                src={highlight.images?.[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'}
                alt={highlight.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gold rounded-full blur-3xl opacity-30" />
          </div>

          {/* Content */}
          <div className="space-y-6">
            <span className="text-gold uppercase tracking-widest text-sm">
              {highlight.category}
            </span>
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
              {highlight.name}
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {highlight.description || 'Discover the elegance and craftsmanship of this exceptional piece from our collection.'}
            </p>
            <p className="text-5xl font-bold text-gold">
              Le {highlight.price.toLocaleString()}
            </p>
            <div className="flex gap-4 pt-4">
              <Link to={`/product/${highlight.id}`} className="btn-gold flex items-center gap-2">
                View Details
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="btn-outline-gold">
                Add to Cart
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HighlightSection;
