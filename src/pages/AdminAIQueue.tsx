import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Inbox, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { broadcastNotification } from '@/lib/notify';

interface DraftRow {
  id: string;
  name: string | null;
  category: string | null;
  price: number;
  description: string | null;
  stock: number;
  images: string[];
  sizes: string[];
  colors: string[];
  status: string;
  created_at: string;
}

const AdminAIQueue = () => {
  const [drafts, setDrafts] = useState<DraftRow[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from('ai_drafts')
      .select('*')
      .order('created_at', { ascending: false });
    setDrafts((data as DraftRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const patch = (id: string, values: Partial<DraftRow>) =>
    setDrafts(prev => prev.map(d => (d.id === id ? { ...d, ...values } : d)));

  const save = async (d: DraftRow) => {
    await supabase.from('ai_drafts').update({
      name: d.name, category: d.category, price: d.price, description: d.description, stock: d.stock,
      sizes: d.sizes, colors: d.colors,
    }).eq('id', d.id);
  };

  const approve = async (d: DraftRow) => {
    if (!d.name || !d.category || Number(d.price) <= 0) {
      toast.error('Name, category and a price above zero are required.');
      return;
    }
    setBusy(d.id);
    await save(d);

    const { data: cats } = await supabase.from('categories').select('name').eq('name', d.category);
    if (!cats?.length) await supabase.from('categories').insert({ name: d.category });

    const { data: product, error } = await supabase.from('products').insert({
      name: d.name, category: d.category, price: Number(d.price),
      description: d.description, stock: Number(d.stock), images: d.images, videos: [],
      sizes: d.sizes, colors: d.colors,
    }).select('id').single();

    if (error) {
      setBusy(null);
      toast.error(`Publish failed: ${error.message}`);
      return;
    }

    await supabase.from('ai_drafts').update({ status: 'approved', published_product_id: product.id }).eq('id', d.id);

    await broadcastNotification({
      type: 'new_product',
      title: `New arrival: ${d.name}`,
      body: `${d.category} · Le ${Number(d.price).toLocaleString()}`,
      imageUrl: d.images?.[0] ?? null,
      link: `/product/${product.id}`,
      productId: product.id,
    });

    setBusy(null);
    toast.success('Approved, published and customers notified!');
    load();
  };

  const reject = async (id: string) => {
    await supabase.from('ai_drafts').update({ status: 'rejected' }).eq('id', id);
    toast.success('Draft rejected.');
    load();
  };

  const remove = async (id: string) => {
    await supabase.from('ai_drafts').delete().eq('id', id);
    load();
  };

  const visible = drafts.filter(d => d.status === filter);

  return (
    <AdminLayout
      title="AI Approval Queue"
      subtitle="Review AI-generated products and media before they go live"
      actions={
        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm capitalize border ${
                filter === f ? 'bg-gold/20 border-gold text-gold' : 'border-border text-muted-foreground'
              }`}
            >
              {f} ({drafts.filter(d => d.status === f).length})
            </button>
          ))}
        </div>
      }
    >
      {loading ? (
        <div className="text-gold">Loading...</div>
      ) : visible.length === 0 ? (
        <div className="card-luxury p-10 text-center">
          <Inbox className="w-10 h-10 text-gold mx-auto mb-3" />
          <p className="text-muted-foreground">Nothing {filter} right now.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map(d => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-luxury p-4 space-y-3">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                {d.images?.[0] && <img src={d.images[0]} alt={d.name ?? 'AI draft'} className="w-full h-full object-cover" />}
              </div>
              <input
                value={d.name ?? ''}
                onChange={e => patch(d.id, { name: e.target.value })}
                onBlur={() => save(d)}
                placeholder="Product name"
                disabled={filter !== 'pending'}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={d.category ?? ''}
                  onChange={e => patch(d.id, { category: e.target.value })}
                  onBlur={() => save(d)}
                  placeholder="Category"
                  disabled={filter !== 'pending'}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                />
                <input
                  type="number"
                  value={d.price}
                  onChange={e => patch(d.id, { price: Number(e.target.value) })}
                  onBlur={() => save(d)}
                  disabled={filter !== 'pending'}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                />
              </div>
              <textarea
                value={d.description ?? ''}
                onChange={e => patch(d.id, { description: e.target.value })}
                onBlur={() => save(d)}
                rows={3}
                disabled={filter !== 'pending'}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={(d.sizes ?? []).join(', ')}
                  onChange={e => patch(d.id, { sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  onBlur={() => save(d)}
                  placeholder="Sizes"
                  disabled={filter !== 'pending'}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                />
                <input
                  value={(d.colors ?? []).join(', ')}
                  onChange={e => patch(d.id, { colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  onBlur={() => save(d)}
                  placeholder="Colors"
                  disabled={filter !== 'pending'}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                />
              </div>
              {filter === 'pending' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={d.stock}
                    onChange={e => patch(d.id, { stock: Number(e.target.value) })}
                    onBlur={() => save(d)}
                    className="w-20 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  />
                  <button
                    onClick={() => approve(d)}
                    disabled={busy === d.id}
                    className="flex-1 btn-gold !py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {busy === d.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Approve
                  </button>
                  <button onClick={() => reject(d.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => remove(d.id)} className="w-full px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-destructive">
                  Delete draft
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAIQueue;
