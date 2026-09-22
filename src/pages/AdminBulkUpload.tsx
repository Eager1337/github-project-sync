import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, Check, X, Layers, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { productSchema, validateForm } from '@/lib/validations';
import { validateMediaFile } from '@/lib/fileValidation';

interface BulkProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  status: 'pending' | 'uploading' | 'done' | 'error';
}

const AdminBulkUpload = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [bulkProducts, setBulkProducts] = useState<BulkProduct[]>([]);
  const [uploading, setUploading] = useState(false);
  const [defaultCategory, setDefaultCategory] = useState('');
  const [defaultPrice, setDefaultPrice] = useState(0);
  const [defaultStock, setDefaultStock] = useState(10);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('name');
    if (data) {
      setCategories(data.map(c => c.name));
      if (data.length > 0) setDefaultCategory(data[0].name);
    }
  };

  const handleFilesSelect = useCallback(async (files: FileList) => {
    const newProducts: BulkProduct[] = [];
    
    for (const file of Array.from(files)) {
      const validation = validateMediaFile(file, 'images');
      if (!validation.valid) {
        toast.error(validation.error);
        continue;
      }
      
      // Generate name from filename
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const name = baseName.charAt(0).toUpperCase() + baseName.slice(1);
      
      // Upload file first
      const ext = file.name.split('.').pop()?.toLowerCase();
      const path = `images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('product-media').upload(path, file, {
        contentType: file.type,
      });
      
      if (!error) {
        const { data } = supabase.storage.from('product-media').getPublicUrl(path);
        newProducts.push({
          id: Math.random().toString(36).slice(2),
          name,
          category: defaultCategory,
          price: defaultPrice,
          stock: defaultStock,
          images: [data.publicUrl],
          status: 'pending'
        });
      } else {
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
      }
    }
    
    setBulkProducts(prev => [...prev, ...newProducts]);
    if (newProducts.length > 0) {
      toast.success(`${newProducts.length} products added to queue!`);
    }
  }, [defaultCategory, defaultPrice, defaultStock]);

  const updateProduct = (id: string, field: keyof BulkProduct, value: string | number | string[]) => {
    setBulkProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removeProduct = (id: string) => {
    setBulkProducts(prev => prev.filter(p => p.id !== id));
  };

  const applyToAll = (field: 'category' | 'price' | 'stock', value: string | number) => {
    setBulkProducts(prev => prev.map(p => ({ ...p, [field]: value })));
    toast.success(`Applied ${field} to all products`);
  };

  const uploadAll = async () => {
    if (bulkProducts.length === 0) {
      toast.error('No products to upload!');
      return;
    }
    
    // Validate all products
    for (const product of bulkProducts) {
      const validation = validateForm(productSchema, {
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        images: product.images,
        videos: [],
        featured: false,
        is_highlight: false
      });
      
      if (!validation.success) {
        toast.error(`Product "${product.name}": ${(validation as { success: false; error: string }).error}`);
        return;
      }
    }

    setUploading(true);
    let successCount = 0;
    
    for (const product of bulkProducts) {
      setBulkProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: 'uploading' } : p));
      
      const { error } = await supabase.from('products').insert({
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        images: product.images,
        featured: false,
        is_highlight: false
      });
      
      if (error) {
        setBulkProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: 'error' } : p));
        toast.error(`Failed to upload "${product.name}": ${error.message}`);
      } else {
        setBulkProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: 'done' } : p));
        successCount++;
      }
    }
    
    setUploading(false);
    toast.success(`${successCount} products uploaded successfully!`);
    
    // Clear done products after 2 seconds
    setTimeout(() => {
      setBulkProducts(prev => prev.filter(p => p.status !== 'done'));
    }, 2000);
  };

  return (
    <AdminLayout
      title="Bulk Upload"
      subtitle="Upload multiple products at once"
      actions={
        bulkProducts.length > 0 ? (
          <button onClick={uploadAll} disabled={uploading} className="btn-gold flex items-center gap-2 !py-2 !px-6">
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : `Upload All (${bulkProducts.length})`}
          </button>
        ) : null
      }
    >
      {/* Default Settings */}
      <div className="card-luxury mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Default Settings (Apply to new uploads)</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Default Category</label>
            <select
              value={defaultCategory}
              onChange={e => setDefaultCategory(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Default Price</label>
            <input
              type="number"
              value={defaultPrice}
              onChange={e => setDefaultPrice(Number(e.target.value))}
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="0"
              min={0}
              max={10000000}
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Default Stock</label>
            <input
              type="number"
              value={defaultStock}
              onChange={e => setDefaultStock(Number(e.target.value))}
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="10"
              min={0}
              max={1000000}
            />
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="card-luxury mb-8">
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-gold transition-colors">
            <Image className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">
              Click or drag images to upload
            </p>
            <p className="text-sm text-muted-foreground">
              Select multiple images at once • Each image becomes a product • Max 10MB per file
            </p>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={e => e.target.files && handleFilesSelect(e.target.files)}
            className="hidden"
          />
        </label>
      </div>

      {/* Bulk Apply */}
      {bulkProducts.length > 0 && (
        <div className="card-luxury mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Apply to All Products</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex gap-2">
              <select
                className="flex-1 bg-muted border border-border rounded-lg px-4 py-2 text-foreground"
                onChange={e => e.target.value && applyToAll('category', e.target.value)}
                defaultValue=""
              >
                <option value="">Select category...</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Set price for all"
                className="flex-1 bg-muted border border-border rounded-lg px-4 py-2 text-foreground"
                onBlur={e => e.target.value && applyToAll('price', Number(e.target.value))}
                min={0}
                max={10000000}
              />
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Set stock for all"
                className="flex-1 bg-muted border border-border rounded-lg px-4 py-2 text-foreground"
                onBlur={e => e.target.value && applyToAll('stock', Number(e.target.value))}
                min={0}
                max={1000000}
              />
            </div>
          </div>
        </div>
      )}

      {/* Products Queue */}
      {bulkProducts.length > 0 && (
        <div className="card-luxury overflow-hidden">
          <h2 className="text-lg font-semibold text-foreground mb-4">Products Queue ({bulkProducts.length})</h2>
          <div className="space-y-4 max-h-[600px] overflow-auto">
            {bulkProducts.map(product => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  product.status === 'done' ? 'border-green-500 bg-green-500/10' :
                  product.status === 'error' ? 'border-destructive bg-destructive/10' :
                  product.status === 'uploading' ? 'border-gold bg-gold/10' :
                  'border-border bg-muted'
                }`}
              >
                <img src={product.images[0]} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <input
                    type="text"
                    value={product.name}
                    onChange={e => updateProduct(product.id, 'name', e.target.value)}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                    placeholder="Product name"
                    disabled={product.status !== 'pending'}
                    maxLength={500}
                  />
                  <select
                    value={product.category}
                    onChange={e => updateProduct(product.id, 'category', e.target.value)}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                    disabled={product.status !== 'pending'}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input
                    type="number"
                    value={product.price}
                    onChange={e => updateProduct(product.id, 'price', Number(e.target.value))}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                    placeholder="Price"
                    disabled={product.status !== 'pending'}
                    min={0}
                    max={10000000}
                  />
                  <input
                    type="number"
                    value={product.stock}
                    onChange={e => updateProduct(product.id, 'stock', Number(e.target.value))}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                    placeholder="Stock"
                    disabled={product.status !== 'pending'}
                    min={0}
                    max={1000000}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {product.status === 'done' && <Check className="w-5 h-5 text-green-500" />}
                  {product.status === 'error' && <X className="w-5 h-5 text-destructive" />}
                  {product.status === 'uploading' && <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />}
                  {product.status === 'pending' && (
                    <button onClick={() => removeProduct(product.id)} className="p-2 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {bulkProducts.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          <Layers className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No products in queue. Upload images to get started.</p>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBulkUpload;
