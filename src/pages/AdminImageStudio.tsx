import { useEffect, useRef, useState } from 'react';
import { Sparkles, Wand2, Upload, Loader2, Check, Film, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { invokeAi } from '@/lib/ai';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { validateMediaFile } from '@/lib/fileValidation';

interface Product {
  id: string;
  name: string;
  images: string[] | null;
  videos: string[] | null;
}

const AdminImageStudio = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [resultUrl, setResultUrl] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [attachTo, setAttachTo] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const loadProducts = () => {
    supabase
      .from('products')
      .select('id, name, images, videos')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => setProducts((data as Product[]) ?? []));
  };

  useEffect(loadProducts, []);

  const uploadLocal = async (file: File | undefined) => {
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const check = validateMediaFile(file, isVideo ? 'videos' : 'images');
    if (!check.valid) return toast.error(check.error);

    const ext = file.name.split('.').pop()?.toLowerCase();
    const path = `${isVideo ? 'videos' : 'images'}/studio-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('product-media').upload(path, file, { contentType: file.type });
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from('product-media').getPublicUrl(path);

    setResultUrl('');
    if (isVideo) {
      setVideoUrl(data.publicUrl);
      setSourceUrl('');
      toast.success('Video uploaded — pause on the frame you want, then grab it');
    } else {
      setVideoUrl('');
      setSourceUrl(data.publicUrl);
    }
  };

  /** Grab the currently displayed video frame and use it as the AI source image. */
  const grabFrame = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return toast.error('Canvas not supported');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setSourceUrl(canvas.toDataURL('image/png'));
    setResultUrl('');
    toast.success('Frame captured — now enhance or edit it');
  };

  const run = async (mode: 'enhance' | 'edit') => {
    if (!sourceUrl) return toast.error(videoUrl ? 'Grab a frame from the video first' : 'Pick or upload a photo first');
    if (mode === 'edit' && !prompt.trim()) return toast.error('Describe the edit you want');
    setBusy(true);
    // invokeAi unwraps the function's own { error } payload, which supabase-js otherwise
    // replaces with "Edge Function returned a non-2xx status code".
    const { data, error } = await invokeAi<{ url?: string }>('ai-image-studio', { imageUrl: sourceUrl, mode, prompt });
    setBusy(false);
    if (error) return toast.error(error);
    if (!data?.url) return toast.error('The AI did not return an image — please try again.');
    setResultUrl(data.url);
    toast.success(mode === 'enhance' ? 'Enhanced to studio quality' : 'Edit applied');
  };

  const attachImage = async () => {
    if (!resultUrl || !attachTo) return toast.error('Pick a product to attach to');
    const product = products.find(p => p.id === attachTo);
    const images = [...(product?.images ?? []), resultUrl];
    const { error } = await supabase.from('products').update({ images }).eq('id', attachTo);
    if (error) return toast.error(error.message);
    toast.success('Photo added to product');
    loadProducts();
  };

  const attachVideo = async () => {
    if (!videoUrl || !attachTo) return toast.error('Pick a product to attach the video to');
    const product = products.find(p => p.id === attachTo);
    const videos = [...(product?.videos ?? []), videoUrl];
    const { error } = await supabase.from('products').update({ videos }).eq('id', attachTo);
    if (error) return toast.error(error.message);
    toast.success('Video added to product');
    loadProducts();
  };

  return (
    <AdminLayout title="AI Media Studio" subtitle="Enhance photos, edit by request, and work with product videos">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <label className="text-sm text-muted-foreground">Upload a photo or a video</label>
            <label className="flex items-center justify-center gap-2 px-4 py-6 rounded-xl border border-dashed border-gold/40 text-gold cursor-pointer hover:bg-gold/10">
              <Upload className="w-4 h-4" /> Choose photo or video
              <input type="file" accept="image/*,video/*" className="hidden" onChange={e => uploadLocal(e.target.files?.[0])} />
            </label>

            <label className="text-sm text-muted-foreground">…or pick an existing product photo</label>
            <select
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
              onChange={e => { setSourceUrl(e.target.value); setVideoUrl(''); setResultUrl(''); }}
              value={videoUrl ? '' : sourceUrl}
            >
              <option value="">Select photo</option>
              {products.flatMap(p => (p.images ?? []).map((img, i) => (
                <option key={`${p.id}-${i}`} value={img}>{p.name} — photo {i + 1}</option>
              )))}
            </select>

            <label className="text-sm text-muted-foreground">…or pick an existing product video</label>
            <select
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
              onChange={e => { setVideoUrl(e.target.value); setSourceUrl(''); setResultUrl(''); }}
              value={videoUrl}
            >
              <option value="">Select video</option>
              {products.flatMap(p => (p.videos ?? []).map((v, i) => (
                <option key={`${p.id}-v${i}`} value={v}>{p.name} — video {i + 1}</option>
              )))}
            </select>
          </div>

          {videoUrl && (
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <video ref={videoRef} src={videoUrl} controls crossOrigin="anonymous" className="w-full rounded-xl max-h-80 bg-muted" />
              <button
                onClick={grabFrame}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gold/50 text-gold font-medium"
              >
                <Camera className="w-4 h-4" /> Grab this frame for the AI
              </button>
              <button
                onClick={attachVideo}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-muted text-foreground font-medium"
              >
                <Film className="w-4 h-4" /> Save this video to the selected product
              </button>
            </div>
          )}

          {sourceUrl && (
            <img src={sourceUrl} alt="Selected product" className="w-full rounded-xl border border-border object-contain max-h-80 bg-muted" />
          )}

          <button
            onClick={() => run('enhance')}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gold text-teal-darker font-semibold disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Enhance to 8K quality
          </button>

          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <label className="text-sm text-muted-foreground">Chat edit — tell the AI what to change</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={3}
              placeholder="Remove the background and place it on a clean white studio backdrop, boost sharpness"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
            />
            <button
              onClick={() => run('edit')}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gold/50 text-gold font-medium disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              Apply edit
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card min-h-64 flex items-center justify-center">
            {resultUrl
              ? <img src={resultUrl} alt="AI enhanced result" className="w-full rounded-lg object-contain max-h-[28rem]" />
              : <p className="text-sm text-muted-foreground">The AI result appears here.</p>}
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <select
              value={attachTo}
              onChange={e => setAttachTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
            >
              <option value="">Attach to product…</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {resultUrl && (
              <>
                <button onClick={attachImage} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gold text-teal-darker font-semibold">
                  <Check className="w-4 h-4" /> Save photo to product
                </button>
                <a href={resultUrl} target="_blank" rel="noreferrer" className="block text-center text-xs text-muted-foreground underline">Open full size</a>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">Working with videos</p>
        <p>• Upload a clip, pause on the moment you like, then grab that frame — the AI can enhance or edit it like any photo.</p>
        <p>• Save the clip itself to a product so shoppers can watch it on the product page.</p>
        <p>• To make a whole clip sharper, use the Media Upscaler page.</p>
      </div>
    </AdminLayout>
  );
};

export default AdminImageStudio;
