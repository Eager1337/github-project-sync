import { uploadMedia, removeMedia } from '@/lib/media';
import { useEffect, useState } from 'react';
import { Copy, Trash2, Upload, Images } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { validateMediaFile } from '@/lib/fileValidation';

interface Asset {
  id: string;
  url: string;
  path: string;
  file_name: string | null;
  media_type: string;
  size_bytes: number | null;
  created_at: string;
}

const AdminMedia = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('media_assets').select('*').order('created_at', { ascending: false });
    if (data) setAssets(data as Asset[]);
  };

  useEffect(() => { load(); }, []);

  const upload = async (files: FileList | File[] | null) => {
    if (!files?.length) return;
    setUploading(true);
    let uploaded = 0;
    try {
      for (const file of Array.from(files)) {
        const type = file.type.startsWith('video') || /\.(mp4|m4v|webm|mov|qt)$/i.test(file.name) ? 'videos' : 'images';
        const validation = validateMediaFile(file, type);
        if (!validation.valid) {
          toast.error(`${file.name}: ${validation.error}`);
          continue;
        }
        try {
          const { url, path } = await uploadMedia(file, type);
          const { error } = await supabase.from('media_assets').insert({
            url, path, file_name: file.name,
            media_type: type === 'videos' ? 'video' : 'image', size_bytes: file.size,
          });
          if (error) throw new Error(`Uploaded, but could not save to the library: ${error.message}`);
          uploaded++;
        } catch (err) {
          toast.error(`${file.name}: ${(err as Error).message}`);
        }
      }
    } finally {
      setUploading(false);
    }
    load();
    if (uploaded) toast.success(`${uploaded} file${uploaded === 1 ? '' : 's'} uploaded`);
  };

  const remove = async (asset: Asset) => {
    await removeMedia(asset.path);
    const { error } = await supabase.from('media_assets').delete().eq('id', asset.id);
    if (error) return toast.error(error.message);
    setAssets(prev => prev.filter(a => a.id !== asset.id));
    toast.success('Deleted');
  };

  const filtered = assets.filter(a => filter === 'all' || a.media_type === filter);

  return (
    <AdminLayout
      title="Media Library"
      subtitle={`${assets.length} files`}
      actions={
        <label className="btn-gold !py-2 !px-4 text-sm flex items-center gap-2 cursor-pointer">
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading…' : 'Upload'}
          <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => { const f = e.target.files; void upload(f ? Array.from(f) : null); e.currentTarget.value = ''; }} />
        </label>
      }
    >
      <div className="flex gap-2 mb-5">
        {(['all', 'image', 'video'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm border capitalize ${filter === f ? 'border-gold text-gold bg-gold/10' : 'border-border text-muted-foreground'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card-luxury p-10 text-center">
          <Images className="w-10 h-10 text-gold mx-auto mb-3" />
          <p className="text-muted-foreground">No media yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {filtered.map(a => (
            <div key={a.id} className="card-luxury p-2 group">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                {a.media_type === 'video' ? (
                  <video src={a.url} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={a.url} alt={a.file_name ?? 'Media asset'} loading="lazy" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => { navigator.clipboard.writeText(a.url); toast.success('URL copied'); }}
                    className="p-2 rounded-full bg-white text-black hover:bg-gold"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(a)} className="p-2 rounded-full bg-white text-black hover:bg-destructive hover:text-white">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground truncate mt-2">{a.file_name ?? a.path}</p>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminMedia;
