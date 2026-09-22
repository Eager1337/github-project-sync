import { useEffect, useState, useCallback } from 'react';
import { CalendarClock, Plus, Trash2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { broadcastNotification } from '@/lib/notify';

interface Product { id: string; name: string; price: number; images: string[]; }
interface Change {
  id: string;
  product_id: string | null;
  change_type: string;
  new_price: number | null;
  release_at: string;
  applied: boolean;
  note: string | null;
}

const AdminSchedule = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [changes, setChanges] = useState<Change[]>([]);
  const [form, setForm] = useState({ product_id: '', change_type: 'price', new_price: 0, release_at: '', note: '' });

  const load = useCallback(async () => {
    const [{ data: prods }, { data: rows }] = await Promise.all([
      supabase.from('products').select('id, name, price, images').order('name'),
      supabase.from('scheduled_changes').select('*').order('release_at', { ascending: true }),
    ]);
    if (prods) setProducts(prods as Product[]);
    if (rows) setChanges(rows as Change[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!form.release_at) return toast.error('Pick a release date and time.');
    if (form.change_type === 'price' && (!form.product_id || form.new_price <= 0)) {
      return toast.error('Choose a product and a new price.');
    }
    const { error } = await supabase.from('scheduled_changes').insert({
      product_id: form.product_id || null,
      change_type: form.change_type,
      new_price: form.change_type === 'price' ? form.new_price : null,
      release_at: new Date(form.release_at).toISOString(),
      note: form.note || null,
    });
    if (error) return toast.error(error.message);
    toast.success('Scheduled!');
    setForm({ product_id: '', change_type: 'price', new_price: 0, release_at: '', note: '' });
    load();
  };

  const apply = async (change: Change) => {
    const product = products.find(p => p.id === change.product_id);

    if (change.change_type === 'price' && product && change.new_price) {
      const { error } = await supabase.from('products').update({ price: change.new_price }).eq('id', product.id);
      if (error) return toast.error(error.message);
      await broadcastNotification({
        type: 'price_change',
        title: `Price update: ${product.name}`,
        body: `Now Le ${change.new_price.toLocaleString()} (was Le ${product.price.toLocaleString()})`,
        imageUrl: product.images?.[0] ?? null,
        link: `/product/${product.id}`,
        productId: product.id,
      });
    } else {
      if (product) await supabase.from('products').update({ published: true, featured: true }).eq('id', product.id);
      await broadcastNotification({
        type: 'new_drop',
        title: change.note || 'A new drop just landed at Haamkay!',
        body: product ? product.name : 'Fresh pieces are live now.',
        imageUrl: product?.images?.[0] ?? null,
        link: product ? `/product/${product.id}` : '/daily-drops',
        productId: product?.id ?? null,
      });
    }

    await supabase.from('scheduled_changes').update({ applied: true }).eq('id', change.id);
    toast.success('Applied and customers notified!');
    load();
  };

  const applyDue = async () => {
    const due = changes.filter(c => !c.applied && new Date(c.release_at) <= new Date());
    if (!due.length) return toast.info('Nothing is due yet.');
    for (const c of due) await apply(c);
  };

  const remove = async (id: string) => {
    await supabase.from('scheduled_changes').delete().eq('id', id);
    setChanges(prev => prev.filter(c => c.id !== id));
  };

  return (
    <AdminLayout
      title="Drops & Price Changes"
      subtitle="Plan releases and price updates, then push them live"
      actions={
        <button onClick={applyDue} className="btn-gold !py-2 !px-4 text-sm flex items-center gap-2">
          <Zap className="w-4 h-4" /> Apply due now
        </button>
      }
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-luxury p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <CalendarClock className="w-5 h-5 text-gold" />
            <h2 className="font-serif font-bold text-foreground">Schedule something</h2>
          </div>

          <select
            value={form.change_type}
            onChange={e => setForm({ ...form, change_type: e.target.value })}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground"
          >
            <option value="price">Price change</option>
            <option value="drop">Product drop</option>
          </select>

          <select
            value={form.product_id}
            onChange={e => setForm({ ...form, product_id: e.target.value })}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground"
          >
            <option value="">Select product{form.change_type === 'drop' ? ' (optional)' : ''}</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          {form.change_type === 'price' && (
            <input
              type="number"
              value={form.new_price}
              onChange={e => setForm({ ...form, new_price: Number(e.target.value) })}
              placeholder="New price (Le)"
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground"
            />
          )}

          <input
            type="datetime-local"
            value={form.release_at}
            onChange={e => setForm({ ...form, release_at: e.target.value })}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground"
          />
          <input
            value={form.note}
            onChange={e => setForm({ ...form, note: e.target.value })}
            placeholder="Announcement headline (optional)"
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground"
          />

          <button onClick={create} className="btn-gold w-full flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Schedule
          </button>
        </div>

        <div className="card-luxury p-5">
          <h2 className="font-serif font-bold text-foreground mb-3">Upcoming</h2>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {changes.length === 0 && <p className="text-sm text-muted-foreground">Nothing scheduled.</p>}
            {changes.map(c => {
              const product = products.find(p => p.id === c.product_id);
              const due = !c.applied && new Date(c.release_at) <= new Date();
              return (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {c.change_type === 'price' ? 'Price → ' : 'Drop · '}
                      {c.change_type === 'price' ? `Le ${(c.new_price ?? 0).toLocaleString()}` : (c.note || 'New drop')}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{product?.name ?? 'Store-wide'}</p>
                    <p className={`text-[11px] mt-1 ${c.applied ? 'text-muted-foreground' : due ? 'text-destructive' : 'text-gold'}`}>
                      {c.applied ? 'Applied' : due ? 'Due now' : new Date(c.release_at).toLocaleString()}
                    </p>
                  </div>
                  {!c.applied && (
                    <button onClick={() => apply(c)} className="px-3 py-1.5 rounded-lg bg-gold/15 text-gold text-xs hover:bg-gold/25">
                      Apply
                    </button>
                  )}
                  <button onClick={() => remove(c.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSchedule;
