import { useEffect, useState } from 'react';
import { Music2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import TikTokEmbed, { tiktokVideoId } from '@/components/TikTokEmbed';

interface ProductRow {
  id: string;
  name: string;
  featured: boolean;
  images: string[] | null;
  tiktok_url: string | null;
}

const AdminTikTok = () => {
  const [profileUrl, setProfileUrl] = useState('');
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [{ data: setting }, { data: rows }] = await Promise.all([
      supabase.from('site_settings').select('value').eq('key', 'tiktok_url').maybeSingle(),
      supabase.from('products').select('id, name, featured, images, tiktok_url').order('featured', { ascending: false }).order('created_at', { ascending: false }),
    ]);
    setProfileUrl(setting?.value ?? '');
    setProducts((rows as ProductRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from('site_settings').upsert({ key: 'tiktok_url', value: profileUrl.trim() }, { onConflict: 'key' });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success('TikTok page saved — it now shows on the home page.');
  };

  const saveProductLink = async (p: ProductRow) => {
    const value = p.tiktok_url?.trim() || null;
    if (value && !tiktokVideoId(value)) {
      toast.error('That does not look like a TikTok video link.');
      return;
    }
    const { error } = await supabase.from('products').update({ tiktok_url: value }).eq('id', p.id);
    if (error) return toast.error(error.message);
    toast.success(`Video linked to ${p.name}`);
  };

  return (
    <AdminLayout title="TikTok" subtitle="Show your TikTok page and link videos to products">
      <div className="card-luxury p-5 mb-6">
        <h2 className="font-serif font-bold mb-3 flex items-center gap-2">
          <Music2 className="w-5 h-5 text-gold" /> Your TikTok page
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={profileUrl}
            onChange={e => setProfileUrl(e.target.value)}
            placeholder="https://www.tiktok.com/@yourhandle"
            className="flex-1 bg-muted border border-border rounded-lg px-4 py-3 text-foreground"
          />
          <button onClick={saveProfile} disabled={saving} className="btn-gold flex items-center justify-center gap-2 !py-3 !px-5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
          </button>
        </div>
      </div>

      <h2 className="font-serif font-bold mb-3">Link videos to products</h2>
      {loading ? (
        <div className="text-gold">Loading...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {products.map(p => (
            <div key={p.id} className="card-luxury p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img src={p.images?.[0] || '/placeholder.svg'} alt={p.name} className="w-14 h-14 rounded-lg object-cover bg-muted" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  {p.featured && <span className="text-xs text-gold uppercase tracking-wider">Featured</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  value={p.tiktok_url ?? ''}
                  onChange={e => setProducts(prev => prev.map(x => (x.id === p.id ? { ...x, tiktok_url: e.target.value } : x)))}
                  placeholder="https://www.tiktok.com/@handle/video/123..."
                  className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                />
                <button onClick={() => saveProductLink(p)} className="px-3 py-2 rounded-lg border border-gold text-gold text-sm hover:bg-gold/10">
                  Save
                </button>
              </div>
              {p.tiktok_url && tiktokVideoId(p.tiktok_url) && <TikTokEmbed url={p.tiktok_url} />}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminTikTok;
