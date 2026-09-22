import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    // Simulate subscription
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Thank you for subscribing!');
    setEmail('');
    setLoading(false);
  };

  return (
    <section className="py-20 bg-card relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <span className="inline-flex items-center gap-2 text-gold mb-4">
            <Sparkles className="w-5 h-5" />
            Join Our Family
          </span>
          
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Stay in the Loop
          </h2>
          
          <p className="text-muted-foreground text-lg mb-8">
            Subscribe to get exclusive access to new arrivals, special offers, 
            and fashion tips delivered straight to your inbox.
          </p>

          <form onSubmit={handleSubmit} className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-gold flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                'Subscribing...'
              ) : (
                <>
                  Subscribe
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
