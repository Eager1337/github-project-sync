import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Edit, Trash2, Star, Upload, Package, Image, Video,
  FolderOpen, Download, RefreshCw, Search, Eye, Copy, Layers
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { productSchema, validateForm } from '@/lib/validations';
import { validateMediaFile } from '@/lib/fileValidation';
import { broadcastNotification } from '@/lib/notify';


interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  stock: number;
  images: string[];
  videos: string[];
  featured: boolean;
  is_highlight: boolean;
  created_at: string;
}

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dailyUploads, setDailyUploads] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: '', category: '', price: 0, description: '', stock: 0,
    images: [] as string[], videos: [] as string[], featured: false, is_highlight: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [{ data: prods }, { data: cats }, { data: uploads }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('name'),
      supabase.from('daily_uploads').select('count').eq('upload_date', new Date().toISOString().split('T')[0]).maybeSingle()
    ]);
    if (prods) setProducts(prods);
    if (cats) setCategories(cats.map(c => c.name));
    if (uploads) setDailyUploads(uploads.count);
    setLoading(false);
  };

  const handleFileUpload = useCallback(async (files: FileList, type: 'images' | 'videos') => {
    setUploading(true);
    const urls: string[] = [];
    
    for (const file of Array.from(files)) {
      const validation = validateMediaFile(file, type);
      if (!validation.valid) {
        toast.error(validation.error);
        continue;
      }
      
      const ext = file.name.split('.').pop()?.toLowerCase();
      const path = `${type}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('product-media').upload(path, file, {
        contentType: file.type,
      });
      if (!error) {
        const { data } = supabase.storage.from('product-media').getPublicUrl(path);
        urls.push(data.publicUrl);
      } else {
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
      }
    }
    
    setForm(f => ({ ...f, [type]: [...f[type], ...urls] }));
    
    if (urls.length > 0) {
      await supabase.from('daily_uploads').upsert({ 
        upload_date: new Date().toISOString().split('T')[0], 
        count: dailyUploads + urls.length 
      }, { onConflict: 'upload_date' });
      setDailyUploads(d => d + urls.length);
      toast.success(`${urls.length} ${type} uploaded!`);
    }
    
    setUploading(false);
  }, [dailyUploads]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = { 
      name: form.name,
      category: form.category,
      price: Number(form.price), 
      stock: Number(form.stock),
      description: form.description || null,
      images: form.images,
      videos: form.videos,
      featured: form.featured,
      is_highlight: form.is_highlight
    };
    
    // Validate with Zod
    const validation = validateForm(productSchema, productData);
    if (!validation.success) {
      toast.error((validation as { success: false; error: string }).error);
      return;
    }
    
    if (editingProduct) {
      const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
      if (error) {
        toast.error(`Failed to update: ${error.message}`);
        return;
      }
      toast.success('Product updated!');

      if (Number(editingProduct.price) !== productData.price) {
        await broadcastNotification({
          type: 'price_change',
          title: `Price update: ${productData.name}`,
          body: `Now Le ${productData.price.toLocaleString()} (was Le ${Number(editingProduct.price).toLocaleString()})`,
          imageUrl: productData.images?.[0] ?? null,
          link: `/product/${editingProduct.id}`,
          productId: editingProduct.id,
        });
      }
    } else {
      const { data: created, error } = await supabase.from('products').insert(productData).select('id').single();
      if (error) {
        toast.error(`Failed to add: ${error.message}`);
        return;
      }
      toast.success('Product added!');

      await broadcastNotification({
        type: 'new_product',
        title: `New arrival: ${productData.name}`,
        body: `${productData.category} · Le ${productData.price.toLocaleString()}`,
        imageUrl: productData.images?.[0] ?? null,
        link: created ? `/product/${created.id}` : '/',
        productId: created?.id ?? null,
      });
    }

    resetForm();
    fetchData();
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

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedProducts.length} products?`)) return;
    for (const id of selectedProducts) {
      await supabase.from('products').delete().eq('id', id);
    }
    toast.success(`${selectedProducts.length} products deleted!`);
    setSelectedProducts([]);
    fetchData();
  };

  const toggleHighlight = async (id: string, current: boolean) => {
    if (!current) await supabase.from('products').update({ is_highlight: false }).neq('id', id);
    await supabase.from('products').update({ is_highlight: !current }).eq('id', id);
    fetchData();
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from('products').update({ featured: !current }).eq('id', id);
    fetchData();
  };

  const duplicateProduct = async (product: Product) => {
    const { id, created_at, ...rest } = product;
    await supabase.from('products').insert({ ...rest, name: `${rest.name} (Copy)` });
    toast.success('Product duplicated!');
    fetchData();
  };

  const exportProducts = () => {
    const csv = [
      ['Name', 'Category', 'Price', 'Stock', 'Featured', 'Highlight'].join(','),
      ...products.map(p => [p.name, p.category, p.price, p.stock, p.featured, p.is_highlight].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    toast.success('Products exported!');
  };

  const resetForm = () => {
    setForm({ name: '', category: '', price: 0, description: '', stock: 0, images: [], videos: [], featured: false, is_highlight: false });
    setEditingProduct(null);
    setShowForm(false);
  };

  const startEdit = (p: Product) => {
    setForm({ name: p.name, category: p.category, price: p.price, description: p.description || '', stock: p.stock, images: p.images || [], videos: p.videos || [], featured: p.featured, is_highlight: p.is_highlight });
    setEditingProduct(p);
    setShowForm(true);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <AdminLayout title="Dashboard" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-gold">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Welcome back! Here's your store overview."
      actions={
        <>
          <Link to="/admin/bulk-upload" className="btn-outline-gold flex items-center gap-2 !py-2 !px-4">
            <Layers className="w-4 h-4" /> Bulk Upload
          </Link>
          <button onClick={() => { setShowForm(true); setEditingProduct(null); }} className="btn-gold flex items-center gap-2 !py-2 !px-4">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card-luxury p-4">
          <Package className="w-6 h-6 text-gold mb-2" />
          <div className="text-2xl font-bold text-foreground">{products.length}</div>
          <div className="text-muted-foreground text-sm">Total Products</div>
        </div>
        <div className="card-luxury p-4">
          <Star className="w-6 h-6 text-gold mb-2" />
          <div className="text-2xl font-bold text-foreground">{products.filter(p => p.featured).length}</div>
          <div className="text-muted-foreground text-sm">Featured</div>
        </div>
        <div className="card-luxury p-4">
          <FolderOpen className="w-6 h-6 text-gold mb-2" />
          <div className="text-2xl font-bold text-foreground">{categories.length}</div>
          <div className="text-muted-foreground text-sm">Categories</div>
        </div>
        <div className="card-luxury p-4">
          <Upload className="w-6 h-6 text-gold mb-2" />
          <div className="text-2xl font-bold text-foreground">{dailyUploads}</div>
          <div className="text-muted-foreground text-sm">Uploads Today</div>
        </div>
      </div>

      {/* Toolbar */}
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
        <button onClick={fetchData} className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-gold">
          <RefreshCw className="w-5 h-5" />
        </button>
        <button onClick={exportProducts} className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-gold">
          <Download className="w-5 h-5" />
        </button>
        {selectedProducts.length > 0 && (
          <button onClick={handleBulkDelete} className="px-4 py-2 bg-destructive text-foreground rounded-lg">
            Delete ({selectedProducts.length})
          </button>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-auto">
          <div className="card-luxury p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-serif font-bold text-foreground mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input 
                  placeholder="Product Name" 
                  value={form.name} 
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                  className="bg-muted border border-border rounded-lg px-4 py-3 text-foreground" 
                  required 
                  maxLength={500}
                />
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="bg-muted border border-border rounded-lg px-4 py-3 text-foreground" required>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input 
                  type="number" 
                  placeholder="Price" 
                  value={form.price} 
                  onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} 
                  className="bg-muted border border-border rounded-lg px-4 py-3 text-foreground" 
                  required 
                  min={0}
                  max={10000000}
                />
                <input 
                  type="number" 
                  placeholder="Stock" 
                  value={form.stock} 
                  onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} 
                  className="bg-muted border border-border rounded-lg px-4 py-3 text-foreground" 
                  required 
                  min={0}
                  max={1000000}
                />
              </div>
              <textarea 
                placeholder="Description" 
                value={form.description} 
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground h-24" 
                maxLength={5000}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foreground mb-2"><Image className="w-4 h-4 inline mr-1" />Images (bulk)</label>
                  <input type="file" multiple accept="image/*" onChange={e => e.target.files && handleFileUpload(e.target.files, 'images')} className="w-full text-sm text-muted-foreground file:btn-gold file:mr-2 file:!py-1 file:!px-3" disabled={uploading} />
                  <div className="flex flex-wrap gap-2 mt-2">{form.images.map((img, i) => <img key={i} src={img} className="w-12 h-12 object-cover rounded" />)}</div>
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-2"><Video className="w-4 h-4 inline mr-1" />Videos (bulk)</label>
                  <input type="file" multiple accept="video/*" onChange={e => e.target.files && handleFileUpload(e.target.files, 'videos')} className="w-full text-sm text-muted-foreground file:btn-gold file:mr-2 file:!py-1 file:!px-3" disabled={uploading} />
                  <div className="text-xs text-muted-foreground mt-1">{form.videos.length} videos uploaded</div>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-foreground"><input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="accent-gold" /> Featured</label>
                <label className="flex items-center gap-2 text-foreground"><input type="checkbox" checked={form.is_highlight} onChange={e => setForm(f => ({ ...f, is_highlight: e.target.checked }))} className="accent-gold" /> Today's Highlight</label>
              </div>

              <div className="flex gap-4">
                <button type="submit" className="btn-gold flex-1" disabled={uploading}>{uploading ? 'Uploading...' : editingProduct ? 'Update' : 'Add'}</button>
                <button type="button" onClick={resetForm} className="btn-outline-gold">Cancel</button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Products Table */}
      <div className="card-luxury overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="p-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={e => setSelectedProducts(e.target.checked ? filteredProducts.map(p => p.id) : [])}
                  className="accent-gold"
                />
              </th>
              <th className="p-4 text-left text-foreground">Product</th>
              <th className="p-4 text-left text-foreground">Category</th>
              <th className="p-4 text-left text-foreground">Price</th>
              <th className="p-4 text-left text-foreground">Stock</th>
              <th className="p-4 text-left text-foreground">Status</th>
              <th className="p-4 text-right text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(p.id)}
                    onChange={e => setSelectedProducts(prev => e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id))}
                    className="accent-gold"
                  />
                </td>
                <td className="p-4 flex items-center gap-3">
                  <img src={p.images?.[0] || '/placeholder.svg'} className="w-12 h-12 rounded object-cover" />
                  <span className="text-foreground">{p.name}</span>
                </td>
                <td className="p-4 text-muted-foreground">{p.category}</td>
                <td className="p-4 text-gold font-semibold">Le {p.price.toLocaleString()}</td>
                <td className="p-4 text-muted-foreground">{p.stock}</td>
                <td className="p-4">
                  <div className="flex gap-1">
                    {p.featured && <span className="px-2 py-0.5 bg-gold/20 text-gold text-xs rounded-full">Featured</span>}
                    {p.is_highlight && <span className="px-2 py-0.5 bg-destructive/20 text-destructive text-xs rounded-full">Highlight</span>}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => window.open(`/product/${p.id}`, '_blank')} className="p-2 text-muted-foreground hover:text-gold">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => startEdit(p)} className="p-2 text-muted-foreground hover:text-gold">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleFeatured(p.id, p.featured)} className="p-2 text-muted-foreground hover:text-gold">
                      <Star className={`w-4 h-4 ${p.featured ? 'fill-gold text-gold' : ''}`} />
                    </button>
                    <button onClick={() => duplicateProduct(p)} className="p-2 text-muted-foreground hover:text-gold">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
