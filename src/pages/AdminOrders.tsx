import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Package, Truck, CheckCircle, XCircle, MessageCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { openWhatsApp } from '@/lib/whatsapp';

interface OrderItemRow {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  status: string;
}

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  address: string | null;
  note: string | null;
  total: number;
  status: string;
  created_at: string;
  order_items: OrderItemRow[];
}

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
  processing: { icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/20' },
  shipped: { icon: Truck, color: 'text-purple-400', bg: 'bg-purple-400/20' },
  delivered: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/20' },
  cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/20' },
};

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const money = (n: number) => `Le ${Math.round(n).toLocaleString()}`;

const AdminOrders = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    setOrders((data as OrderRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const setOrderStatus = async (order: OrderRow, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', order.id);
    if (error) return toast.error(error.message);
    await supabase.from('order_items').update({ status }).eq('order_id', order.id);
    toast.success(`${order.order_number} marked ${status}`);
    fetchOrders();
  };

  const setItemStatus = async (item: OrderItemRow, status: string) => {
    const { error } = await supabase.from('order_items').update({ status }).eq('id', item.id);
    if (error) return toast.error(error.message);
    fetchOrders();
  };

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <AdminLayout
      title="Orders"
      subtitle={loading ? 'Loading orders...' : `${orders.length} orders received`}
      actions={
        <button onClick={fetchOrders} className="btn-outline-gold !py-2 !px-4 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {Object.entries(stats).map(([label, value]) => (
          <div key={label} className="card-luxury p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-gold">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['all', ...STATUSES].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
              filterStatus === status ? 'bg-gold/20 text-gold' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <p className="text-muted-foreground">No orders here yet.</p>
      )}

      <div className="space-y-4">
        {filtered.map(order => {
          const s = statusConfig[order.status] ?? statusConfig.pending;
          const Icon = s.icon;
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-luxury p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="font-semibold text-foreground">{order.order_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customer_name} — {order.phone}
                  </p>
                  {order.address && <p className="text-xs text-muted-foreground">{order.address}</p>}
                  {order.note && <p className="text-xs text-muted-foreground italic">“{order.note}”</p>}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm capitalize ${s.bg} ${s.color}`}>
                    <Icon className="w-4 h-4" />
                    {order.status}
                  </span>
                  <p className="text-gold font-bold mt-2">{money(order.total)}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {order.order_items?.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} className="w-12 h-14 object-cover rounded-lg" loading="lazy" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        × {item.quantity} — {money(item.price * item.quantity)}
                      </p>
                    </div>
                    <select
                      value={item.status}
                      onChange={e => setItemStatus(item, e.target.value)}
                      className="bg-muted border border-border rounded-lg px-2 py-1 text-xs capitalize"
                    >
                      {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
                {STATUSES.map(st => (
                  <button
                    key={st}
                    onClick={() => setOrderStatus(order, st)}
                    className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${
                      order.status === st ? 'bg-gold/20 text-gold' : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Mark {st}
                  </button>
                ))}
                <button
                  onClick={() =>
                    openWhatsApp(
                      `Hello ${order.customer_name}, this is Haamkay Enterprises about your order ${order.order_number} (${money(order.total)}).`,
                      order.phone,
                    )
                  }
                  className="ml-auto inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-gold"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message customer
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
