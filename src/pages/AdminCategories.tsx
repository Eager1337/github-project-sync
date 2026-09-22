import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { categorySchema, validateForm } from '@/lib/validations';

interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '', image_url: '' });
  const [uploading, setUploading] = useState(false);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [{ data: cats }, { data: prods }] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('products').select('category')
    ]);
    if (cats) setCategories(cats);
    if (prods) {
      const counts: Record<string, number> = {};
      prods.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
      setProductCounts(counts);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with Zod
    const validation = validateForm(categorySchema, {
      name: form.name,
      description: form.description || null
    });
    if (!validation.success) {
      toast.error((validation as { success: false; error: string }).error);
      return;
    }
    
    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update({ name: form.name, description: form.description, image_url: form.image_url || null })
        .eq('id', editingCategory.id);
      if (error) {
        toast.error(`Failed to update: ${error.message}`);
        return;
      }
      toast.success('Category updated!');
    } else {
      const { error } = await supabase
        .from('categories')
        .insert({ name: form.name, description: form.description, image_url: form.image_url || null });
      if (error) {
        toast.error(`Failed to add: ${error.message}`);
        return;
      }
      toast.success('Category added!');
    }
    setForm({ name: '', description: '', image_url: '' });
    setEditingCategory(null);
    setShowForm(false);
    fetchData();
  };

  const handleCover = async (file: File) => {
    setUploading(true);
    const path = `categories/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error } = await supabase.storage.from('product-media').upload(path, file, { contentType: file.type });
    setUploading(false);
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from('product-media').getPublicUrl(path);
    setForm(f => ({ ...f, image_url: data.publicUrl }));
    toast.success('Cover image uploaded');
  };

  const handleDelete = async (id: string, name: string) => {
    if (productCounts[name] > 0) {
      toast.error(`Cannot delete: ${productCounts[name]} products use this category`);
      return;
    }
    if (!confirm('Delete this category?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast.error(`Failed to delete: ${error.message}`);
      return;
    }
    toast.success('Category deleted!');
    fetchData();
  };

  const startEdit = (cat: Category) => {
    setForm({ name: cat.name, description: cat.description || '', image_url: cat.image_url || '' });
    setEditingCategory(cat);
    setShowForm(true);
  };

  if (loading) {
    return (
      <AdminLayout title="Categories" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-gold">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Categories"
      subtitle="Manage product categories"
      actions={
        <button onClick={() => { setShowForm(true); setEditingCategory(null); setForm({ name: '', description: '', image_url: '' }); }} className="btn-gold flex items-center gap-2 !py-2 !px-4">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      }
    >
      {/* Form Modal */}
      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="card-luxury p-6 w-full max-w-md">
            <h2 className="text-xl font-serif font-bold text-foreground mb-4">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                placeholder="Category Name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground"
                required
                maxLength={100}
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground h-24"
                maxLength={500}
              />
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Cover image</label>
                {form.image_url && (
                  <img src={form.image_url} alt="Category cover preview" className="w-full h-36 object-cover rounded-lg border border-border" />
                )}
                <div className="flex gap-2">
                  <input
                    placeholder="Image URL"
                    value={form.image_url}
                    onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                    className="flex-1 bg-muted border border-border rounded-lg px-4 py-2 text-foreground text-sm"
                  />
                  {form.image_url && (
                    <button type="button" onClick={() => setForm(f => ({ ...f, image_url: '' }))} className="px-3 rounded-lg border border-border text-sm text-muted-foreground">Clear</button>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleCover(f); }}
                  className="w-full text-sm text-muted-foreground"
                />
                {uploading && <p className="text-xs text-gold">Uploading…</p>}
              </div>
              <div className="flex gap-4">
                <button type="submit" className="btn-gold flex-1">{editingCategory ? 'Update' : 'Add'}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditingCategory(null); }} className="btn-outline-gold">Cancel</button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="card-luxury">
            {cat.image_url ? (
              <img src={cat.image_url} alt={`${cat.name} cover`} className="w-full h-32 object-cover rounded-lg mb-4" />
            ) : (
              <div className="w-full h-32 rounded-lg mb-4 bg-muted flex items-center justify-center text-xs text-muted-foreground">No cover image</div>
            )}
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-gold" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(cat)} className="p-2 text-muted-foreground hover:text-gold">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(cat.id, cat.name)} className="p-2 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-serif font-semibold text-foreground mb-2">{cat.name}</h3>
            <p className="text-muted-foreground text-sm mb-4">{cat.description || 'No description'}</p>
            <div className="text-sm text-gold">{productCounts[cat.name] || 0} products</div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
