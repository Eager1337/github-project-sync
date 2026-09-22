import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Upload, Check, Trash2, Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { invokeAi } from '@/lib/ai';
import { validateMediaFile } from '@/lib/fileValidation';

interface Draft {
  image: string;
  path: string;
  name: string;
  category: string;
  price: number;
  description: string;
  stock: number;
  sizes: string[];
  colors: string[];
  status: 'pending' | 'analyzing' | 'ready' | 'published' | 'error';
  error?: string;
}

const MAX_AI_IMAGES = 20;
const AI_BATCH_SIZE = 5;
type AIResult = { image: string; draft?: Partial<Draft>; error?: string };

const AdminAIListing = () => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    supabase.from('categories').select('name').then(({ data }) => { if (data) setCategories(data.map(c => c.name)); });
  }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = MAX_AI_IMAGES - drafts.length;
    if (remaining <= 0) { toast.error(`AI Listing Studio is limited to ${MAX_AI_IMAGES} images per batch.`); return; }
    const selected = Array.from(files).slice(0, remaining);
    if (files.length > remaining) toast.warning(`Only ${remaining} more image${remaining === 1 ? '' : 's'} can be added. The batch limit is ${MAX_AI_IMAGES}.`);
    setUploading(true);
    const added: Draft[] = [];
    for (const file of selected) {
      const validation = validateMediaFile(file, 'images');
      if (!validation.valid) { toast.error(`${file.name}: ${validation.error}`); continue; }
      const ext = file.name.split('.').pop()?.toLowerCase();
      const path = `images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('product-media').upload(path, file, { contentType: file.type });
      if (error) { toast.error(`Upload failed for ${file.name}`); continue; }
      const { data } = supabase.storage.from('product-media').getPublicUrl(path);
      await supabase.from('media_assets').insert({ url: data.publicUrl, path, file_name: file.name, media_type: 'image', size_bytes: file.size });
      added.push({ image: data.publicUrl, path, name: '', category: '', price: 0, description: '', stock: 1, sizes: [], colors: [], status: 'pending' });
    }
    setDrafts(prev => [...prev, ...added].slice(0, MAX_AI_IMAGES));
    setUploading(false);
    if (added.length) toast.success(`${added.length} photo(s) uploaded. Run the AI to build listings.`);
  };

  const runAI = async () => {
    const pending = drafts.filter(d => d.status === 'pending' || d.status === 'error');
    if (!pending.length) { toast.info('Nothing to analyze — upload some photos first.'); return; }
    if (pending.length > MAX_AI_IMAGES) { toast.error(`AI analysis is limited to ${MAX_AI_IMAGES} images per run.`); return; }
    setAnalyzing(true);
    setDrafts(prev => prev.map(d => (d.status === 'pending' || d.status === 'error' ? { ...d, status: 'analyzing', error: undefined } : d)));

    const allResults: AIResult[] = [];
    let completed = 0;
    try {
      for (let start = 0; start < pending.length; start += AI_BATCH_SIZE) {
        const batch = pending.slice(start, start + AI_BATCH_SIZE);
        // invokeAi keeps the real reason (missing secret, bad key, rate limit…) that
        // supabase-js normally throws away for non-2xx function responses.
        const { data, error } = await invokeAi<{ results?: AIResult[] }>('ai-product-draft', { images: batch.map(d => d.image), categories });
        if (error) {
          allResults.push(...batch.map(d => ({ image: d.image, error })));
        } else {
          const results = (data?.results ?? []) as AIResult[];
          allResults.push(...results);
          const returned = new Set(results.map(r => r.image));
          for (const item of batch) if (!returned.has(item.image)) allResults.push({ image: item.image, error: 'No AI result was returned for this image.' });
        }
        completed += batch.length;
        toast.info(`AI processed ${Math.min(completed, pending.length)}/${pending.length} photos.`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI analysis failed. Please try again.';
      for (const item of pending) if (!allResults.some(r => r.image === item.image)) allResults.push({ image: item.image, error: message });
    }

    setDrafts(prev => prev.map(d => {
      if (d.status !== 'analyzing') return d;
      const match = allResults.find(r => r.image === d.image);
      if (!match) return { ...d, status: 'error', error: 'No result returned.' };
      if (!match.draft) return { ...d, status: 'error', error: match.error ?? 'The AI could not read this photo.' };
      return { ...d, ...match.draft, status: 'ready', error: undefined };
    }));
    setAnalyzing(false);

    const failures = allResults.filter(r => !r.draft);
    const failed = failures.length;
    const succeeded = allResults.filter(r => !!r.draft).length;
    // Tell the admin *why* nothing came back — it is almost always one fixable thing
    // (missing GEMINI_API_KEY secret, expired key, rate limit) rather than a mystery.
    if (!succeeded) toast.error(failures[0]?.error ?? 'AI could not process these photos. Check the AI configuration and try again.');
    else if (failed) toast.warning(`${succeeded} listing(s) ready · ${failed} photo(s) need another try.`);
    else toast.success(`${succeeded} AI listing(s) ready — review them before sending to the queue.`);
  };

  const update = (index: number, patch: Partial<Draft>) => setDrafts(prev => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  const remove = (index: number) => setDrafts(prev => prev.filter((_, i) => i !== index));

  const publish = async (index: number) => {
    const d = drafts[index];
    if (!d.name || !d.category || d.price <= 0) { toast.error('Name, category and a price above zero are required.'); return; }
    const { error } = await supabase.from('ai_drafts').insert({ name: d.name, category: d.category, price: d.price, description: d.description, stock: d.stock, images: [d.image], sizes: d.sizes, colors: d.colors, status: 'pending' });
    if (error) { toast.error(`Could not send to queue: ${error.message}`); return; }
    update(index, { status: 'published' });
    toast.success('Sent to the AI approval queue for review.');
  };

  const publishAll = async () => { for (let i = 0; i < drafts.length; i++) if (drafts[i].status === 'ready') await publish(i); };

  return (
    <AdminLayout title="AI Listing Studio" subtitle={`Upload up to ${MAX_AI_IMAGES} photos — AI drafts the listings, then approve them in the AI queue`} actions={
      <>
        <button onClick={runAI} disabled={analyzing || !drafts.some(d => d.status === 'pending' || d.status === 'error')} className="btn-gold flex items-center gap-2 !py-2 !px-4 text-sm disabled:opacity-50">
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {analyzing ? 'Analyzing…' : `Run AI (${drafts.filter(d => d.status === 'pending' || d.status === 'error').length}/${MAX_AI_IMAGES})`}
        </button>
        <button onClick={publishAll} disabled={analyzing} className="px-4 py-2 rounded-lg border border-gold text-gold text-sm hover:bg-gold/10 disabled:opacity-50">Send all to queue</button>
      </>
    }>
      <label className={`block card-luxury p-6 sm:p-10 text-center border-2 border-dashed border-gold/40 cursor-pointer hover:border-gold transition-colors mb-6 ${drafts.length >= MAX_AI_IMAGES ? 'opacity-60 cursor-not-allowed' : ''}`}>
        <input type="file" accept="image/*" multiple disabled={drafts.length >= MAX_AI_IMAGES || uploading || analyzing} className="hidden" onChange={e => { void handleUpload(e.target.files); e.currentTarget.value = ''; }} />
        <Upload className="w-8 h-8 text-gold mx-auto mb-3" />
        <p className="text-foreground font-medium">{uploading ? 'Uploading…' : drafts.length >= MAX_AI_IMAGES ? '20-image limit reached' : 'Tap to upload product photos'}</p>
        <p className="text-xs text-muted-foreground mt-1">{drafts.length}/{MAX_AI_IMAGES} photos · JPG, PNG, WEBP or GIF · up to 10MB each</p>
      </label>
      {drafts.length === 0 ? <div className="card-luxury p-10 text-center"><Sparkles className="w-10 h-10 text-gold mx-auto mb-3" /><p className="text-muted-foreground">Your AI drafts will appear here.</p></div> :
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {drafts.map((d, i) => <motion.div key={d.image} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-luxury p-4 space-y-3">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted"><img src={d.image} alt={d.name || 'Product photo'} className="w-full h-full object-cover" />{d.status === 'analyzing' && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>}{d.status === 'published' && <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-gold text-teal-darker text-xs font-semibold">In queue</div>}</div>
            <input value={d.name} onChange={e => update(i, { name: e.target.value })} placeholder="Product name" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
            <div className="grid grid-cols-2 gap-2"><input value={d.category} onChange={e => update(i, { category: e.target.value })} placeholder="Category" list="admin-categories" className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground" /><input type="number" value={d.price} onChange={e => update(i, { price: Number(e.target.value) })} placeholder="Price (Le)" className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground" /></div>
            <textarea value={d.description} onChange={e => update(i, { description: e.target.value })} placeholder="Description" rows={3} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
            <div className="grid grid-cols-2 gap-2"><input value={d.sizes.join(', ')} onChange={e => update(i, { sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Sizes (e.g. S, M, L)" className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground" /><input value={d.colors.join(', ')} onChange={e => update(i, { colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Colors" className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground" /></div>
            <div className="flex items-center gap-2"><input type="number" min="0" value={d.stock} onChange={e => update(i, { stock: Number(e.target.value) })} className="w-20 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground" /><button onClick={() => publish(i)} disabled={d.status === 'published' || d.status === 'analyzing'} className="flex-1 btn-gold !py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50"><Check className="w-4 h-4" /> Send to queue</button><button onClick={() => remove(i)} disabled={d.status === 'analyzing'} className="p-2 rounded-lg text-muted-foreground hover:text-destructive disabled:opacity-40" aria-label={`Remove ${d.name || 'photo'}`}><Trash2 className="w-4 h-4" /></button></div>
            {d.error && <p className="text-xs text-destructive">{d.error}</p>}
          </motion.div>)}
        </div>}
      <datalist id="admin-categories">{categories.map(c => <option key={c} value={c} />)}</datalist>
    </AdminLayout>
  );
};

export default AdminAIListing;
