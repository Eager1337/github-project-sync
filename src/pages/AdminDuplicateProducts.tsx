import { useEffect, useState } from 'react';
import { Copy, Trash2, Package, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  images: string[] | null;
  created_at: string;
}

interface DuplicateGroup {
  key: string;
  products: Product[];
}

const AdminDuplicateProducts = () => {
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('id, name, category, price, stock, images, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const products = (data ?? []) as Product[];

    // Group by normalized name (lowercase, trimmed)
    const map = new Map<string, Product[]>();
    for (const p of products) {
      const key = p.name.trim().toLowerCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }

    const dupes = Array.from(map.entries())
      .filter(([, items]) => items.length > 1)
      .map(([key, items]) => ({ key, products: items }))
      .sort((a, b) => b.products.length - a.products.length);

    setGroups(dupes);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    setDeleting(id);
    const { error } = await supabase.from('products').delete().eq('id', id);
    setDeleting(null);
    if (error) return toast.error(error.message);
    toast.success(`Deleted "${name}"`);
    load();
  };

  const handleKeepFirst = async (group: DuplicateGroup) => {
    const toDelete = group.products.slice(1);
    const ids = toDelete.map(p => p.id);
    setDeleting('batch');
    const { error } = await supabase.from('products').delete().in('id', ids);
    setDeleting(null);
    if (error) return toast.error(error.message);
    toast.success(`Kept 1, deleted ${ids.length} duplicates`);
    load();
  };

  const totalDupes = groups.reduce((sum, g) => sum + g.products.length - 1, 0);
  const filtered = groups.filter(g =>
    !search || g.key.includes(search.toLowerCase())
  );

  return (
    <AdminLayout
      title="Duplicate Products"
      subtitle={`${totalDupes} duplicates across ${groups.length} groups`}
    >
      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search by product name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 rounded-lg bg-background border border-border text-sm focus:border-gold outline-none"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-luxury p-10 text-center">
          <Package className="w-10 h-10 text-gold mx-auto mb-3" />
          <p className="text-muted-foreground">
            {groups.length === 0 ? 'No duplicate products found. Your catalog is clean!' : 'No groups match your search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map(group => {
            const isBatchDeleting = deleting === 'batch';
            return (
              <div key={group.key} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Group header */}
                <div className="flex items-center justify-between gap-3 px-4 py-3 bg-muted/50 border-b border-border">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertTriangle className="w-4 h-4 text-gold flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate capitalize">{group.key}</span>
                    <span className="px-2 py-0.5 rounded-full bg-gold/15 text-gold text-[11px] font-medium flex-shrink-0">
                      {group.products.length} copies
                    </span>
                  </div>
                  <button
                    onClick={() => handleKeepFirst(group)}
                    disabled={isBatchDeleting}
                    className="text-xs px-3 py-1.5 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    {isBatchDeleting ? 'Deleting…' : 'Keep first, delete rest'}
                  </button>
                </div>

                {/* Product entries */}
                <div className="divide-y divide-border">
                  {group.products.map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.category} · NLe {p.price.toFixed(2)} · Stock: {p.stock}
                        </p>
                      </div>

                      {idx === 0 ? (
                        <span className="px-2 py-1 rounded-full bg-teal-light/20 text-teal-light text-[10px] font-medium flex-shrink-0">
                          Original
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(p.id);
                              toast.success('ID copied');
                            }}
                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={deleting === p.id}
                            className="p-2 rounded-lg hover:bg-destructive/20 text-destructive disabled:opacity-50"
                          >
                            {deleting === p.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDuplicateProducts;
