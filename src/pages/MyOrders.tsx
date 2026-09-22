import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle, ArrowLeft, MessageCircle, ShoppingBag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { listMyOrders, type Order } from '@/lib/orders';
import { openWhatsApp, buildOrderMessage } from '@/lib/whatsapp';

const statusMap: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  pending: { label: 'Pending confirmation', icon: Clock, className: 'text-yellow-500 bg-yellow-500/15' },
  processing: { label: 'Being prepared', icon: Package, className: 'text-blue-400 bg-blue-400/15' },
  shipped: { label: 'Out for delivery', icon: Truck, className: 'text-purple-400 bg-purple-400/15' },
  delivered: { label: 'Delivered', icon: CheckCircle, className: 'text-green-500 bg-green-500/15' },
  cancelled: { label: 'Cancelled', icon: XCircle, className: 'text-red-500 bg-red-500/15' },
};

const money = (n: number) => `Le ${Math.round(n).toLocaleString()}`;

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyOrders().then((o) => {
      setOrders(o);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 md:pt-40 pb-32 md:pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to shop
          </Link>
          <h1 className="text-2xl md:text-4xl font-serif font-bold mb-8">
            My <span className="text-gold-gradient">Orders</span>
          </h1>

          {loading ? (
            <p className="text-muted-foreground">Loading your orders...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-serif font-bold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">Your orders and their status will show up here.</p>
              <Link to="/categories" className="btn-gold inline-flex">Start shopping</Link>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order, i) => {
                const s = statusMap[order.status] ?? statusMap.pending;
                const Icon = s.icon;
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border rounded-xl p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div>
                        <p className="font-semibold">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full ${s.className}`}>
                        <Icon className="w-4 h-4" />
                        {s.label}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {order.order_items?.map((item, idx) => {
                        const is = statusMap[item.status ?? 'pending'] ?? statusMap.pending;
                        return (
                          <div key={item.id ?? idx} className="flex items-center gap-3">
                            {item.image_url && (
                              <img src={item.image_url} alt={item.name} className="w-14 h-16 object-cover rounded-lg" loading="lazy" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                × {item.quantity} — {money(item.price * item.quantity)}
                              </p>
                            </div>
                            <span className={`text-[11px] px-2 py-1 rounded-full ${is.className}`}>{is.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <span className="font-bold text-gold">{money(order.total)}</span>
                      <button
                        onClick={() => openWhatsApp(buildOrderMessage(order))}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Chat about this order
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyOrders;
