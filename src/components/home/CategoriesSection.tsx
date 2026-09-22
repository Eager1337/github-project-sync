import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
}

const categoryImages: Record<string, string> = {
  'Dresses': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',
  'Wedding': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
  'Shoes': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600',
  'Accessories': 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600',
  'Bags': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600',
};

const CategoriesSection = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (!error && data) {
      setCategories(data);
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Shop by Category
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore our curated collections designed to elevate your style
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/categories?filter=${category.name.toLowerCase()}`}
                className="group block relative aspect-[3/4] rounded-2xl overflow-hidden"
              >
                <img
                  src={category.image_url || categoryImages[category.name] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-darker via-teal-darker/40 to-transparent" />
                
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-xl text-foreground mb-1">
                        {category.name}
                      </h3>
                      <p className="text-xs text-foreground/60">
                        {category.description}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-5 h-5 text-gold" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
