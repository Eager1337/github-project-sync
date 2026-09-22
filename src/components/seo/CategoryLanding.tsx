import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/home/ProductCard';
import Seo from '@/components/seo/Seo';
import { openWhatsApp } from '@/lib/whatsapp';

export interface LandingConfig {
  slug: string;
  eyebrow: string;
  h1: string;
  intro: string;
  metaTitle: string;
  metaDescription: string;
  /** Words matched against product name/category to pick the products shown. */
  keywords: string[];
  benefits: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
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

const CategoryLanding = ({ config }: { config: LandingConfig }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('published', true)
      .order('featured', { ascending: false })
      .then(({ data }) => {
        const all = (data ?? []) as Product[];
        const match = all.filter((p) =>
          config.keywords.some((k) =>
            `${p.name} ${p.category}`.toLowerCase().includes(k.toLowerCase()),
          ),
        );
        setProducts((match.length ? match : all).slice(0, 12));
        setLoading(false);
      });
  }, [config.keywords]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={config.metaTitle}
        description={config.metaDescription}
        path={`/${config.slug}`}
        jsonLd={jsonLd}
      />
      <Header />
      <main className="pt-28 md:pt-40 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {/* Hero */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/15 text-gold text-xs uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              {config.eyebrow}
            </span>
            <h1 className="mt-4 text-3xl md:text-5xl font-serif font-bold leading-tight">{config.h1}</h1>
            <p className="mt-4 text-muted-foreground text-base md:text-lg">{config.intro}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#shop" className="btn-gold inline-flex items-center gap-2">
                Shop the collection <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => openWhatsApp(`Hi Haamkay! I'm interested in ${config.h1}.`)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-gold/40 text-gold hover:bg-gold/10 transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Ask on WhatsApp
              </button>
            </div>
          </motion.section>

          {/* Trust bar */}
          <section className="mt-10 grid sm:grid-cols-3 gap-4">
            {[
              { icon: ShieldCheck, title: 'Verified quality', body: 'Every item checked before it leaves our store.' },
              { icon: Truck, title: 'Fast Freetown delivery', body: 'Same-day dispatch across the city.' },
              { icon: MessageCircle, title: 'Order on WhatsApp', body: 'Chat, confirm, pay on delivery.' },
            ].map((b) => (
              <div key={b.title} className="bg-card border border-border rounded-xl p-4">
                <b.icon className="w-5 h-5 text-gold mb-2" />
                <p className="font-semibold">{b.title}</p>
                <p className="text-sm text-muted-foreground">{b.body}</p>
              </div>
            ))}
          </section>

          {/* Products */}
          <section id="shop" className="mt-14">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6">
              Popular picks in {config.eyebrow}
            </h2>
            {loading ? (
              <p className="text-muted-foreground">Loading products…</p>
            ) : products.length === 0 ? (
              <p className="text-muted-foreground">
                New stock is landing soon —{' '}
                <Link to="/categories" className="text-gold underline">
                  browse everything
                </Link>
                .
              </p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    category={p.category}
                    price={p.price}
                    image={p.images?.[0] || '/placeholder.svg'}
                    featured={p.featured}
                    isHighlight={p.is_highlight}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Why buy */}
          <section className="mt-16 grid md:grid-cols-3 gap-5">
            {config.benefits.map((b) => (
              <div key={b.title} className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-serif font-bold text-lg mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.body}</p>
              </div>
            ))}
          </section>

          {/* FAQ */}
          <section className="mt-16 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6">Questions before you buy</h2>
            <div className="space-y-3">
              {config.faqs.map((f) => (
                <details key={f.q} className="bg-card border border-border rounded-xl p-4">
                  <summary className="cursor-pointer font-medium">{f.q}</summary>
                  <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="mt-16 rounded-2xl border border-gold/30 bg-gold/5 p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold">Ready to order?</h2>
            <p className="mt-2 text-muted-foreground">
              Add to cart and send your order straight to our team — we confirm on WhatsApp within minutes.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link to="/cart" className="btn-gold inline-flex items-center gap-2">
                Go to cart <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/categories"
                className="px-5 py-3 rounded-lg border border-border hover:border-gold/50 transition-colors"
              >
                Browse all categories
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryLanding;
