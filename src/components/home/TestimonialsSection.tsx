import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Testimonial {
  id: string;
  author: string;
  quote: string;
  rating: number;
  avatar_url: string | null;
}

const TestimonialsSection = () => {
  const [items, setItems] = useState<Testimonial[]>([]);

  useEffect(() => {
    supabase
      .from('testimonials')
      .select('id, author, quote, rating, avatar_url')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => data && setItems(data as Testimonial[]));
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-gold text-sm uppercase tracking-[0.3em]">Loved by customers</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mt-3">What People Say</h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <motion.article
              key={t.id}
              initial={{ opacity: 0, y: 30, rotateX: -12 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 140, damping: 18 }}
              whileHover={{ y: -6 }}
              className="relative p-6 rounded-2xl border border-border bg-card shadow-lg"
            >
              <Quote className="w-8 h-8 text-gold/40 mb-3" />
              <p className="text-foreground/90 text-sm leading-relaxed">{t.quote}</p>
              <div className="flex items-center gap-3 mt-5">
                {t.avatar_url ? (
                  <img src={t.avatar_url} alt={t.author} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
                    {t.author.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.author}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s < t.rating ? 'text-gold fill-gold' : 'text-muted-foreground'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
