import { useEffect, useState } from 'react';
import { AlertTriangle, Package, Save, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface Row {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  low_stock_threshold: number;
  images: string[];
}

const AdminInventory = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [onlyLow, setOnlyLow] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name, category, price, stock, low_stock_threshold, images')
      .order('stock', { ascending: true });
    if (data) setRows(data as Row[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const patch = (id: string, changes: Partial<Row>) =>
    setRows(prev => prev.map(r => (r.id === id ? { ...r, ...changes } : r)));

  const save = async (row: Row) => {
    const { error } = await supabase
      .from('products')
      .update({ stock: row.stock, low_stock_threshold: row.low_stock_threshold })
      .eq('id', row.id);
    if (error) return toast.error(error.message);
    toast.success(`${row.name} updated`);
  };

  const filtered = rows.filter(r =>
    r.name.toLowerCase().includes(query.toLowerCase()) &&
    (!onlyLow || r.stock <= r.low_stock_threshold)
  );

  const lowCount = rows.filter(r => r.stock <= r.low_stock_threshold).length;
  const outCount = rows.filter(r => r.stock === 0).length;
  const totalValue = rows.reduce((sum, r) => sum + r.price * r.stock, 0);

  return (
    <AdminLayout title="Inventory" subtitle={loading ? 'Loading…' : `${rows.length} products tracked`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Products', value: rows.length, icon: Package },
          { label: 'Low stock', value: lowCount, icon: AlertTriangle },
          { label: 'Out of stock', value: outCount, icon: AlertTriangle },
          { label: 'Stock value', value: `Le ${totalValue.toLocaleString()}`, icon: Package },
        ].map(card => (
          <div key={card.label} className="card-luxury p-4">
            <card.icon className="w-5 h-5 text-gold mb-2" />
            <p className="text-lg sm:text-xl font-bold text-foreground break-words">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2 text-foreground"
          />
        </div>
        <button
          onClick={() => setOnlyLow(v => !v)}
          className={`px-4 py-2 rounded-lg border text-sm ${onlyLow ? 'border-gold text-gold bg-gold/10' : 'border-border text-muted-foreground'}`}
        >
          Low stock only
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map(row => {
          const low = row.stock <= row.low_stock_threshold;
          return (
            <div key={row.id} className="card-luxury p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <img src={row.images?.[0] || '/placeholder.svg'} alt={row.name} className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{row.name}</p>
                <p className="text-xs text-muted-foreground">{row.category} · Le {row.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Stock</label>
                <input
                  type="number"
                  value={row.stock}
                  onChange={e => patch(row.id, { stock: Number(e.target.value) })}
                  className={`w-20 bg-muted border rounded-lg px-2 py-1.5 text-sm text-foreground ${low ? 'border-destructive' : 'border-border'}`}
                />
                <label className="text-xs text-muted-foreground">Alert at</label>
                <input
                  type="number"
                  value={row.low_stock_threshold}
                  onChange={e => patch(row.id, { low_stock_threshold: Number(e.target.value) })}
                  className="w-16 bg-muted border border-border rounded-lg px-2 py-1.5 text-sm text-foreground"
                />
                <button onClick={() => save(row)} className="p-2 rounded-lg bg-gold/15 text-gold hover:bg-gold/25">
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-10">No products match your filters.</p>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminInventory;
