import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, History, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { broadcastNotification } from '@/lib/notify';

interface Entry {
  id: string;
  product_id: string;
  old_price: number | null;
  new_price: number;
  changed_at: string;
  note: string | null;
}

interface Product {
  id: string;
  name: string;
  images: string[] | null;
  price: number;
}

const AdminPriceHistory = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [{ data: hist }, { data: prods }] = await Promise.all([
      supabase.from('price_history').select('*').order('changed_at', { ascending: false }).limit(500),
      supabase.from('products').select('id, name, images, price').order('name'),
    ]);
    setEntries((hist as Entry[]) ?? []);
    setProducts((prods as Product[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const productMap = useMemo(
    () => Object.fromEntries(products.map(p => [p.id, p])),
    [products]
  );

  const visible = selected === 'all' ? entries : entries.filter(e => e.product_id === selected);

  const notifyAgain = async (entry: Entry) => {
    const product = productMap[entry.product_id];
    if (!product) return;
    const res = await broadcastNotification({
      type: 'price_change',
      title: `Price update: ${product.name}`,
      body: entry.old_price
        ? `Now Le ${Number(entry.new_price).toLocaleString()} (was Le ${Number(entry.old_price).toLocaleString()})`
        : `Now Le ${Number(entry.new_price).toLocaleString()}`,
      imageUrl: product.images?.[0] ?? null,
      link: `/product/${product.id}`,
      productId: product.id,
    });
    if (res.ok) toast.success('Customers notified about this price change.');
    else toast.error(res.error ?? 'Could not send notification');
  };

  return (
    <AdminLayout
      title="Price History"
      subtitle="Every price change, per product — with the option to re-notify customers"
      actions={
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className="bg-muted border border-border rounded-lg px-4 py-2 text-foreground"
        >
          <option value="all">All products</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      }
    >
      {loading ? (
        <div className="text-gold">Loading...</div>
      ) : visible.length === 0 ? (
        <div className="card-luxury p-10 text-center">
          <History className="w-10 h-10 text-gold mx-auto mb-3" />
          <p className="text-muted-foreground">No price changes recorded yet.</p>
        </div>
      ) : (
        <div className="relative pl-6 border-l border-border space-y-4">
          {visible.map((e, i) => {
            const product = productMap[e.product_id];
            const up = e.old_price !== null && Number(e.new_price) > Number(e.old_price);
            const down = e.old_price !== null && Number(e.new_price) < Number(e.old_price);
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.4) }}
                className="card-luxury p-4 flex items-center gap-4"
              >
                <span className="absolute -ml-[34px] w-3 h-3 rounded-full bg-gold" />
                {product?.images?.[0] && (
                  <img src={product.images[0]} alt={product.name} className="w-14 h-14 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{product?.name ?? 'Deleted product'}</p>
                  <p className="text-sm text-muted-foreground">
                    {e.old_price !== null
                      ? `Le ${Number(e.old_price).toLocaleString()} → Le ${Number(e.new_price).toLocaleString()}`
                      : `Set to Le ${Number(e.new_price).toLocaleString()}`}
                    {e.note ? ` · ${e.note}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(e.changed_at).toLocaleString()}</p>
                </div>
                {up && <TrendingUp className="w-5 h-5 text-destructive" />}
                {down && <TrendingDown className="w-5 h-5 text-gold" />}
                {product && (
                  <button
                    onClick={() => notifyAgain(e)}
                    className="p-2 rounded-lg border border-gold/40 text-gold hover:bg-gold/10"
                    title="Notify customers"
                  >
                    <Bell className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPriceHistory;
