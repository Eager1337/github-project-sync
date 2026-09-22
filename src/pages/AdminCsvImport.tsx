import { useState } from 'react';
import { FileSpreadsheet, Upload, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { broadcastNotification } from '@/lib/notify';

interface Row {
  name: string;
  category: string;
  price: number;
  stock: number;
  featured: boolean;
  description?: string;
  image?: string;
}

const TEMPLATE = 'name,category,price,stock,featured,description,image\nRed Heels,Shoes,350,10,true,Elegant red heels,https://example.com/photo.jpg\n';

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim() !== ''));
}

const AdminCsvImport = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [importing, setImporting] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please choose a .csv file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('CSV must be under 5MB.');
      return;
    }
    const text = await file.text();
    const table = parseCsv(text);
    if (table.length < 2) {
      toast.error('CSV appears to be empty.');
      return;
    }
    const header = table[0].map(h => h.trim().toLowerCase());
    const idx = (key: string) => header.indexOf(key);
    const parsed: Row[] = [];
    for (const r of table.slice(1)) {
      const name = (r[idx('name')] ?? '').trim();
      if (!name) continue;
      parsed.push({
        name: name.slice(0, 200),
        category: (r[idx('category')] ?? '').trim().slice(0, 100) || 'Uncategorized',
        price: Math.max(0, Number(r[idx('price')] ?? 0) || 0),
        stock: Math.max(0, Math.round(Number(r[idx('stock')] ?? 0) || 0)),
        featured: ['true', 'yes', '1'].includes((r[idx('featured')] ?? '').trim().toLowerCase()),
        description: (r[idx('description')] ?? '').trim().slice(0, 2000) || undefined,
        image: (r[idx('image')] ?? '').trim() || undefined,
      });
    }
    setRows(parsed);
    setLog([]);
    toast.success(`${parsed.length} row(s) ready to import.`);
  };

  const runImport = async () => {
    if (!rows.length) return;
    setImporting(true);
    const messages: string[] = [];
    const { data: existing } = await supabase.from('products').select('id, name, price, images');
    const byName = new Map((existing ?? []).map(p => [p.name.toLowerCase(), p]));

    const { data: cats } = await supabase.from('categories').select('name');
    const categoryNames = new Set((cats ?? []).map(c => c.name.toLowerCase()));

    for (const r of rows) {
      if (!categoryNames.has(r.category.toLowerCase())) {
        await supabase.from('categories').insert({ name: r.category });
        categoryNames.add(r.category.toLowerCase());
      }

      const match = byName.get(r.name.toLowerCase());
      if (match) {
        const { error } = await supabase.from('products').update({
          category: r.category, price: r.price, stock: r.stock, featured: r.featured,
          ...(r.description ? { description: r.description } : {}),
          ...(r.image ? { images: [r.image] } : {}),
        }).eq('id', match.id);
        if (error) { messages.push(`✗ ${r.name}: ${error.message}`); continue; }
        messages.push(`↻ Updated ${r.name}`);
        if (Number(match.price) !== r.price) {
          await broadcastNotification({
            type: 'price_change',
            title: `Price update: ${r.name}`,
            body: `Now Le ${r.price.toLocaleString()} (was Le ${Number(match.price).toLocaleString()})`,
            imageUrl: r.image ?? match.images?.[0] ?? null,
            link: `/product/${match.id}`,
            productId: match.id,
          });
        }
      } else {
        const { data: created, error } = await supabase.from('products').insert({
          name: r.name, category: r.category, price: r.price, stock: r.stock,
          featured: r.featured, description: r.description ?? null,
          images: r.image ? [r.image] : [], videos: [],
        }).select('id').single();
        if (error) { messages.push(`✗ ${r.name}: ${error.message}`); continue; }
        messages.push(`+ Added ${r.name}`);
        await broadcastNotification({
          type: 'new_product',
          title: `New arrival: ${r.name}`,
          body: `${r.category} · Le ${r.price.toLocaleString()}`,
          imageUrl: r.image ?? null,
          link: `/product/${created.id}`,
          productId: created.id,
        });
      }
    }

    setLog(messages);
    setImporting(false);
    toast.success('Import finished.');
  };

  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([TEMPLATE], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'haamkay-products-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout
      title="CSV Import"
      subtitle="Add or update many products at once — matched by product name"
      actions={
        <>
          <button onClick={downloadTemplate} className="px-4 py-2 rounded-lg border border-gold text-gold text-sm hover:bg-gold/10 flex items-center gap-2">
            <Download className="w-4 h-4" /> Template
          </button>
          <button onClick={runImport} disabled={!rows.length || importing} className="btn-gold !py-2 !px-4 text-sm flex items-center gap-2 disabled:opacity-50">
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Import {rows.length || ''}
          </button>
        </>
      }
    >
      <label className="block card-luxury p-10 text-center border-2 border-dashed border-gold/40 cursor-pointer hover:border-gold transition-colors mb-6">
        <input type="file" accept=".csv,text/csv" className="hidden" onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        <FileSpreadsheet className="w-8 h-8 text-gold mx-auto mb-3" />
        <p className="text-foreground font-medium">Tap to choose a CSV file</p>
        <p className="text-xs text-muted-foreground mt-1">Columns: name, category, price, stock, featured, description, image</p>
      </label>

      {rows.length > 0 && (
        <div className="card-luxury p-4 overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Stock</th>
                <th className="py-2">Featured</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.name}-${i}`} className="border-t border-border text-foreground">
                  <td className="py-2 pr-4">{r.name}</td>
                  <td className="py-2 pr-4">{r.category}</td>
                  <td className="py-2 pr-4">Le {r.price.toLocaleString()}</td>
                  <td className="py-2 pr-4">{r.stock}</td>
                  <td className="py-2">{r.featured ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {log.length > 0 && (
        <div className="card-luxury p-4 space-y-1 text-sm text-muted-foreground">
          {log.map((l, i) => <p key={i}>{l}</p>)}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCsvImport;
