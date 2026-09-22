import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Sparkles, Tag, Package, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { playAlertChime, vibrateAlert } from '@/lib/sound';

interface LiveNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  image_url: string | null;
  link: string | null;
  created_at: string;
}

const iconFor = (type: string) => {
  if (type === 'price_change') return Tag;
  if (type === 'new_drop') return Sparkles;
  if (type === 'new_product') return Package;
  return Bell;
};

const labelFor = (type: string) => {
  if (type === 'price_change') return 'Price drop';
  if (type === 'new_drop') return 'New drop';
  if (type === 'new_product') return 'New arrival';
  return 'Haamkay';
};

/**
 * Live, animated in-app alert popover with a chime + haptic buzz.
 * Mounted once at the app root so every page gets alerts.
 */
export const NotificationToaster = () => {
  const [queue, setQueue] = useState<LiveNotification[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = (id: string) => {
    setQueue((prev) => prev.filter((n) => n.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  };

  const push = (note: LiveNotification) => {
    setQueue((prev) => [note, ...prev.filter((n) => n.id !== note.id)].slice(0, 3));
    playAlertChime();
    vibrateAlert();
    timers.current[note.id] = setTimeout(() => dismiss(note.id), 8000);
  };

  useEffect(() => {
    const channel = supabase
      .channel('live-alert-toasts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => push(payload.new as LiveNotification)
      )
      .subscribe();

    return () => {
      Object.values(timers.current).forEach(clearTimeout);
      timers.current = {};
      supabase.removeChannel(channel);
    };
  }, []);

  // Repeating scheduled alerts — fire on every visitor's device at their own interval.
  useEffect(() => {
    let intervals: ReturnType<typeof setInterval>[] = [];
    let cancelled = false;

    const start = async () => {
      const { data } = await supabase
        .from('notification_schedules')
        .select('id, title, body, image_url, link, interval_seconds, active')
        .eq('active', true);
      if (cancelled || !data) return;

      intervals = data.map((s) =>
        setInterval(() => {
          push({
            id: `${s.id}-${Date.now()}`,
            type: 'general',
            title: s.title,
            body: s.body,
            image_url: s.image_url,
            link: s.link,
            created_at: new Date().toISOString(),
          });
        }, Math.max(5, s.interval_seconds) * 1000)
      );
    };

    start();
    return () => {
      cancelled = true;
      intervals.forEach(clearInterval);
    };
  }, []);

  return (
    <div className="fixed top-4 inset-x-0 z-[100] flex flex-col items-center gap-3 px-3 pointer-events-none">
      <AnimatePresence initial={false}>
        {queue.map((n, index) => {
          const Icon = iconFor(n.type);
          const card = (
            <div className="relative flex gap-3 p-3 pr-9 overflow-hidden rounded-2xl border border-gold/40 bg-card/95 backdrop-blur-xl shadow-[0_18px_50px_-12px_rgba(0,0,0,0.6)]">
              {/* animated sheen */}
              <motion.span
                aria-hidden
                initial={{ x: '-120%' }}
                animate={{ x: '160%' }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }}
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-gold/15 to-transparent"
              />
              <div className="relative flex-shrink-0">
                {n.image_url ? (
                  <motion.img
                    src={n.image_url}
                    alt=""
                    initial={{ scale: 0.7, rotate: -6 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                ) : (
                  <motion.div
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 240, damping: 12 }}
                    className="w-14 h-14 rounded-xl bg-gold/15 flex items-center justify-center"
                  >
                    <Icon className="w-6 h-6 text-gold" />
                  </motion.div>
                )}
                <motion.span
                  aria-hidden
                  initial={{ opacity: 0.6, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.6 }}
                  transition={{ duration: 1.2, repeat: 2 }}
                  className="absolute inset-0 rounded-xl border border-gold"
                />
              </div>

              <div className="min-w-0 relative">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold">{labelFor(n.type)}</p>
                <p className="text-sm font-semibold text-foreground line-clamp-1">{n.title}</p>
                {n.body && <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>}
              </div>

              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); dismiss(n.id); }}
                aria-label="Dismiss alert"
                className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>

              <motion.span
                aria-hidden
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 8, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-gold/70"
              />
            </div>
          );

          return (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, y: -60, scale: 0.85, rotateX: -35 }}
              animate={{ opacity: 1, y: 0, scale: 1 - index * 0.03, rotateX: 0 }}
              exit={{ opacity: 0, y: -40, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              style={{ perspective: 800 }}
              className="pointer-events-auto w-full max-w-sm"
            >
              {n.link ? (
                <Link to={n.link} onClick={() => dismiss(n.id)} className="block">
                  {card}
                </Link>
              ) : (
                card
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToaster;
