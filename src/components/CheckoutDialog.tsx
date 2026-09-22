import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  placeOrder,
  loadCustomerDetails,
  saveCustomerDetails,
  type OrderItem,
  type Order,
} from '@/lib/orders';
import { openWhatsApp, buildOrderMessage } from '@/lib/whatsapp';

interface Props {
  open: boolean;
  onClose: () => void;
  items: OrderItem[];
  onPlaced?: (order: Order) => void;
}

const CheckoutDialog = ({ open, onClose, items, onPlaced }: Props) => {
  const saved = loadCustomerDetails();
  const [name, setName] = useState(saved.customer_name ?? '');
  const [phone, setPhone] = useState(saved.phone ?? '');
  const [address, setAddress] = useState(saved.address ?? '');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const details = { customer_name: name, phone, address, note };
      const order = await placeOrder(details, items);
      saveCustomerDetails(details);
      toast.success(`Order ${order.order_number} sent! We'll confirm on WhatsApp.`);
      openWhatsApp(buildOrderMessage(order));
      onPlaced?.(order);
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.form
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            className="w-full max-w-md bg-card border border-border rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-serif font-bold mb-1">Complete your order</h2>
            <p className="text-sm text-muted-foreground mb-5">
              We send your order straight to Haamkay Enterprises and open WhatsApp so you can confirm.
            </p>

            <label className="block text-sm mb-3">
              <span className="text-muted-foreground">Full name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full bg-muted rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gold/50"
                placeholder="Your name"
              />
            </label>
            <label className="block text-sm mb-3">
              <span className="text-muted-foreground">Phone / WhatsApp number</span>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full bg-muted rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gold/50"
                placeholder="+232 ..."
              />
            </label>
            <label className="block text-sm mb-3">
              <span className="text-muted-foreground">Delivery address</span>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full bg-muted rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gold/50"
                placeholder="Street, area, city"
              />
            </label>
            <label className="block text-sm mb-5">
              <span className="text-muted-foreground">Note (optional)</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="mt-1 w-full bg-muted rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gold/50"
                placeholder="Colour, size, delivery time..."
              />
            </label>

            <button type="submit" disabled={sending} className="w-full btn-gold py-3 flex items-center justify-center gap-2">
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
              {sending ? 'Sending order...' : 'Send order'}
            </button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutDialog;
