import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Faq {
  id: string;
  question: string;
  answer: string;
}

const FaqSection = () => {
  const [items, setItems] = useState<Faq[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('faqs')
      .select('id, question, answer')
      .eq('published', true)
      .order('sort_order')
      .then(({ data }) => data && setItems(data as Faq[]));
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-gold">
            <HelpCircle className="w-5 h-5" />
            Questions
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mt-3">Frequently Asked</h2>
        </div>

        <div className="space-y-3">
          {items.map((f, i) => {
            const open = openId === f.id;
            return (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-background overflow-hidden"
              >
                <button
                  onClick={() => setOpenId(open ? null : f.id)}
                  className="w-full flex items-center justify-between gap-4 p-4 text-left"
                  aria-expanded={open}
                >
                  <span className="text-foreground font-medium">{f.question}</span>
                  <motion.span animate={{ rotate: open ? 180 : 0 }}>
                    <ChevronDown className="w-5 h-5 text-gold" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
