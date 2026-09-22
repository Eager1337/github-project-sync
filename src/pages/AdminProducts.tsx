import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, Eye, Copy, Trash2, CheckSquare, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  featured: boolean;
  is_highlight: boolean;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkMode, setBulkMode] = useState<'set' | 'percent'>('set');

  const toggleSelected = (id: string) =>
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} products?`)) return;
    const { error } = await supabase.from('products').delete().in('id', selected);
    if (error) return toast.error(error.message);
    toast.success(`${selected.length} products deleted`);
    setSelected([]);
    fetchData();
  };

  const bulkUpdatePrice = async () => {
    const value = Number(bulkPrice);
    if (!value && value !== 0) return toast.error('Enter a value first');
    const targets = products.filter(p => selected.includes(p.id));
    const results = await Promise.all(
      targets.map(p =>
        supabase
          .from('products')
          .update({ price: bulkMode === 'set' ? value : Math.max(0, Math.round(p.price * (1 + value / 100))) })
          .eq('id', p.id),
      ),
    );
    const failed = results.filter(r => r.error).length;
    if (failed) toast.error(`${failed} products failed to update`);
    else toast.success(`Prices updated for ${targets.length} products`);
    setBulkPrice('');
    setSelected([]);
    fetchData();
  };


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('name')
    ]);
    if (prods) setProducts(prods);
    if (cats) setCategories(cats.map(c => c.name));
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error(`Failed to delete: ${error.message}`);
      return;
    }
    toast.success('Product deleted!');
    fetchData();
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    const { error } = await supabase.from('products').update({ featured: !current }).eq('id', id);
    if (error) {
      toast.error(`Failed to update: ${error.message}`);
      return;
    }
    fetchData();
  };

  const toggleHighlight = async (id: string, current: boolean) => {
    if (!current) await supabase.from('products').update({ is_highlight: false }).neq('id', id);
    const { error } = await supabase.from('products').update({ is_highlight: !current }).eq('id', id);
    if (error) {
      toast.error(`Failed to update: ${error.message}`);
      return;
    }
    fetchData();
  };

  const duplicateProduct = async (product: Product) => {
    const { id, ...rest } = product;
    const { error } = await supabase.from('products').insert({ ...rest, name: `${rest.name} (Copy)` });
    if (error) {
      toast.error(`Failed to duplicate: ${error.message}`);
      return;
    }
    toast.success('Product duplicated!');
    fetchData();
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <AdminLayout title="Products" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-gold">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Products"
      subtitle={`${products.length} products total`}
      actions={
        <Link to="/admin/dashboard" className="btn-gold flex items-center gap-2 !py-2 !px-4">
          Add Product
        </Link>
      }
    >
      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2 text-foreground"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-muted border border-border rounded-lg px-4 py-2 text-foreground"
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {selected.length > 0 && (
        <div className="card-luxury p-4 mb-6 flex flex-wrap items-center gap-3">
          <span className="text-sm text-gold font-medium">{selected.length} selected</span>
          <select
            value={bulkMode}
            onChange={e => setBulkMode(e.target.value as 'set' | 'percent')}
            className="bg-muted border border-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="set">Set price to</option>
            <option value="percent">Change by %</option>
          </select>
          <input
            type="number"
            value={bulkPrice}
            onChange={e => setBulkPrice(e.target.value)}
            placeholder={bulkMode === 'set' ? 'New price (Le)' : 'e.g. -10'}
            className="bg-muted border border-border rounded-lg px-3 py-2 text-sm w-40"
          />
          <button onClick={bulkUpdatePrice} className="btn-gold !py-2 !px-4 text-sm">Apply prices</button>
          <button onClick={bulkDelete} className="px-4 py-2 rounded-lg text-sm bg-destructive/20 text-destructive hover:bg-destructive/30">
            Delete selected
          </button>
          <button onClick={() => setSelected([])} className="text-sm text-muted-foreground hover:text-foreground ml-auto">
            Clear
          </button>
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={() =>
            setSelected(selected.length === filteredProducts.length ? [] : filteredProducts.map(p => p.id))
          }
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold"
        >
          {selected.length === filteredProducts.length && filteredProducts.length > 0 ? (
            <CheckSquare className="w-4 h-4" />
          ) : (
            <Square className="w-4 h-4" />
          )}
          Select all ({filteredProducts.length})
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-luxury overflow-hidden group"
          >
            <div className="relative aspect-square mb-4 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSelected(product.id)}
                className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-background/80 text-foreground hover:text-gold"
                aria-label="Select product"
              >
                {selected.includes(product.id) ? <CheckSquare className="w-4 h-4 text-gold" /> : <Square className="w-4 h-4" />}
              </button>
              <img
                src={product.images?.[0] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.featured && (
                  <span className="px-2 py-1 bg-gold text-teal-darker text-xs font-semibold rounded-full">
                    Featured
                  </span>
                )}
                {product.is_highlight && (
                  <span className="px-2 py-1 bg-destructive text-foreground text-xs font-semibold rounded-full">
                    Highlight
                  </span>
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => window.open(`/product/${product.id}`, '_blank')} className="p-2 bg-white rounded-full text-black hover:bg-gold">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => toggleFeatured(product.id, product.featured)} className="p-2 bg-white rounded-full text-black hover:bg-gold">
                  <Star className={`w-4 h-4 ${product.featured ? 'fill-gold text-gold' : ''}`} />
                </button>
                <button onClick={() => duplicateProduct(product)} className="p-2 bg-white rounded-full text-black hover:bg-gold">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(product.id)} className="p-2 bg-white rounded-full text-black hover:bg-destructive hover:text-white">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-gold uppercase">{product.category}</span>
              <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-gold font-bold">Le {product.price.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">{product.stock} in stock</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
