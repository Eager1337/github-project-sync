import { motion } from 'framer-motion';
import { ChevronLeft, Heart, ShoppingBag, Sparkles, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const guestPerks = [
  { icon: ShoppingBag, title: 'Guest cart', detail: 'Your cart stays on this device without creating an account.' },
  { icon: Heart, title: 'Curated browsing', detail: 'Explore dresses, shoes, bags, jewelry, wedding picks, and kids fashion freely.' },
  { icon: Sparkles, title: 'Instant shopping', detail: 'No sign-up wall — browse products and contact support when you are ready.' },
];

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 md:pt-40 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-luxury p-8 md:p-10 text-center overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-teal/20 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center shadow-gold">
                <UserRound className="w-12 h-12 text-gold" />
              </div>
              <p className="text-sm tracking-[0.35em] uppercase text-gold mb-3">Guest Experience</p>
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
                Shop Haamkay without an account
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                The storefront is now guest-first for privacy and speed. We do not ask visitors to sign up before browsing products or managing a local cart.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/categories" className="btn-gold inline-flex items-center gap-2">
                  Browse Categories
                </Link>
                <Link
                  to="/cart"
                  className="px-6 py-3 rounded-full border border-gold/30 text-gold hover:bg-gold/10 transition-colors"
                >
                  View Cart
                </Link>
              </div>
            </div>
          </motion.section>

          <div className="grid md:grid-cols-3 gap-4 mt-8">
            {guestPerks.map((perk, index) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="bg-card rounded-2xl p-6 border border-border hover:border-gold/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center mb-4">
                  <perk.icon className="w-6 h-6 text-gold" />
                </div>
                <h2 className="font-serif font-bold text-lg text-foreground mb-2">{perk.title}</h2>
                <p className="text-sm text-muted-foreground">{perk.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
