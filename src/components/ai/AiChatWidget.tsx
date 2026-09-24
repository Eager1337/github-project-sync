import { useState, useEffect } from 'react';
import { Sparkles, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AiShoppingAssistant from './AiShoppingAssistant';

const AiChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('haamkay_ai_widget_seen');
    if (!seen) {
      const timer = setTimeout(() => {
        setHasInteracted(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (open) {
      localStorage.setItem('haamkay_ai_widget_seen', '1');
      setHasInteracted(false);
    }
  }, [open]);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-[90] flex flex-col items-end gap-3">
        <AnimatePresence>
          {hasInteracted && !open && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="max-w-[260px] rounded-2xl bg-card border border-border shadow-card p-3 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-foreground leading-snug">Need help finding something? Ask our AI shopper ✨</p>
                <button onClick={() => setHasInteracted(false)} className="p-1 text-muted-foreground">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <button onClick={() => setOpen(true)} className="mt-2 text-xs font-semibold text-gold hover:underline">
                Try AI finder →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Close AI shopper' : 'Open AI shopper'}
          className="w-14 h-14 rounded-full bg-gold text-teal-darker shadow-gold flex items-center justify-center hover:scale-105 transition-transform"
        >
          {open ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[91] bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="fixed z-[92] bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[380px] h-[85vh] md:h-[560px] md:rounded-2xl overflow-hidden shadow-2xl bg-background border-t md:border border-border"
            >
              <AiShoppingAssistant compact onClose={() => setOpen(false)} className="h-full rounded-none md:rounded-2xl border-0" autoFocus />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop hint */}
      <div className="hidden md:block fixed bottom-6 left-6 z-[80]">
        <a href="/ai-shopper" className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-gold hover:border-gold/40 shadow-card transition-colors">
          <MessageCircle className="w-4 h-4 text-gold" /> Try AI product finder
        </a>
      </div>
    </>
  );
};

export default AiChatWidget;
