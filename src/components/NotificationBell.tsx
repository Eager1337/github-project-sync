import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellRing, Sparkles, Tag, Package, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/useNotifications';
import { enablePushNotifications, pushEnabled, pushSupported } from '@/lib/push';
import { soundEnabled, setSoundEnabled, playAlertChime } from '@/lib/sound';
import { Volume2, VolumeX } from 'lucide-react';

const typeIcon = (type: string) => {
  if (type === 'price_change') return Tag;
  if (type === 'new_drop') return Sparkles;
  if (type === 'new_product') return Package;
  return Bell;
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
};

export const NotificationBell = () => {
  const { items, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(pushEnabled());
  const [working, setWorking] = useState(false);
  const [sound, setSound] = useState(soundEnabled());

  const toggleSound = () => {
    const next = !sound;
    setSoundEnabled(next);
    setSound(next);
    if (next) playAlertChime();
  };

  const toggle = () => {
    setOpen((prev) => {
      if (!prev) markAllRead();
      return !prev;
    });
  };

  const handleSubscribe = async () => {
    setWorking(true);
    const result = await enablePushNotifications();
    setWorking(false);
    if (result.ok) {
      setSubscribed(true);
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggle}
        aria-label="Notifications"
        className="relative p-2 text-foreground/80 hover:text-gold transition-colors"
      >
        {unreadCount > 0 ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-gold text-teal-darker text-[10px] rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-3 z-50 sm:w-96 max-h-[70vh] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-serif font-bold text-foreground">Alerts</h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={toggleSound}
                    aria-label={sound ? 'Mute alert sound' : 'Unmute alert sound'}
                    title={sound ? 'Sound on' : 'Sound off'}
                    className={`p-2 rounded-lg transition-colors ${sound ? 'text-gold hover:bg-gold/10' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    {sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground sm:hidden">
                  <X className="w-5 h-5" />
                </button>
                </div>
              </div>

              {pushSupported() && !subscribed && (
                <button
                  onClick={handleSubscribe}
                  disabled={working}
                  className="m-3 px-4 py-3 rounded-xl bg-gold/15 border border-gold/40 text-gold text-sm font-medium hover:bg-gold/25 transition-colors text-left"
                >
                  {working ? 'Enabling…' : '🔔 Turn on alerts for new drops & price changes'}
                </button>
              )}

              <div className="overflow-y-auto divide-y divide-border">
                {items.length === 0 && (
                  <p className="p-6 text-sm text-muted-foreground text-center">No alerts yet. Check back soon.</p>
                )}
                {items.map((n) => {
                  const Icon = typeIcon(n.type);
                  const content = (
                    <div className="flex gap-3 p-4 hover:bg-muted/50 transition-colors">
                      {n.image_url ? (
                        <img src={n.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gold/15 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-gold" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        {n.body && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</p>}
                        <p className="text-[11px] text-gold mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                    </div>
                  );
                  return n.link ? (
                    <Link key={n.id} to={n.link} onClick={() => setOpen(false)} className="block">
                      {content}
                    </Link>
                  ) : (
                    <div key={n.id}>{content}</div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
