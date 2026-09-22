import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const KEY = 'haamkay_welcomed';

const WelcomeMessage = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(KEY)) return;
    const t = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    localStorage.setItem(KEY, '1');
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl border border-gold/30 bg-card p-7 text-center overflow-hidden"
          >
            <button onClick={close} className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
            <motion.div
              animate={{ rotate: [0, 12, -8, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
              className="w-14 h-14 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center"
            >
              <Sparkles className="w-7 h-7 text-gold" />
            </motion.div>
            <h2 className="text-2xl font-serif font-bold mb-2">
              Welcome to <span className="text-gold-gradient">Haamkay</span>
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              We're so glad you're here. Browse our latest drops, add what you love to the cart, and order in
              seconds — no account needed. Feel at home!
            </p>
            <div className="flex flex-col gap-2">
              <Link to="/categories" onClick={close} className="btn-gold py-3">
                Start shopping
              </Link>
              <button onClick={close} className="text-sm text-muted-foreground hover:text-gold transition-colors">
                Just looking around
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeMessage;
