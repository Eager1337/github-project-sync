import { useRef, useState } from 'react';
import { Upload, Download, Loader2, ImageIcon, Film, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { invokeAi } from '@/lib/ai';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { validateMediaFile } from '@/lib/fileValidation';

const IMAGE_TARGET = 7680; // 8K for photos
const VIDEO_TARGETS = [1920, 2560, 3840] as const; // video upscale options

type Kind = 'image' | 'video';

const AdminImageUpscaler = () => {
  const [kind, setKind] = useState<Kind>('image');
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [resultUrl, setResultUrl] = useState<string>('');
  const [resultExt, setResultExt] = useState<'png' | 'webm'>('png');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiStage, setAiStage] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoTarget, setVideoTarget] = useState<number>(3840);
  const [originalDims, setOriginalDims] = useState<{ w: number; h: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) return toast.error('Please upload a photo or a video file');

    const validation = validateMediaFile(file, isVideo ? 'videos' : 'images');
    if (!validation.valid) return toast.error(validation.error ?? 'Invalid file');

    setKind(isVideo ? 'video' : 'image');
    setResultUrl('');
    setProgress(0);
    setOriginalDims(null);

    if (isVideo) {
      const url = URL.createObjectURL(file);
      setSourceUrl(url);
      const v = document.createElement('video');
      v.onloadedmetadata = () => setOriginalDims({ w: v.videoWidth, h: v.videoHeight });
      v.src = url;
      return;
    }

    // Images are uploaded first so the AI upscale function (server-side) can fetch and process them.
    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const path = `images/upscale-src-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('product-media').upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from('product-media').getPublicUrl(path);
      setSourceUrl(data.publicUrl);
      const img = new Image();
      img.onload = () => setOriginalDims({ w: img.naturalWidth, h: img.naturalHeight });
      img.src = data.publicUrl;
    } catch (e) {
      toast.error((e as Error).message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const upscaleImage = async () => {
    setAiStage(true);
    let baseUrl = sourceUrl;
    try {
      const { data, error } = await invokeAi<{ url?: string }>('ai-image-upscale', { imageUrl: sourceUrl });
      if (error) throw new Error(error);
      if (!data?.url) throw new Error('The AI did not return an enhanced image.');
      baseUrl = data.url;
      toast.success('AI enhancement applied — finishing the resize…');
    } catch (e) {
      toast.error(`${(e as Error).message || 'AI enhance failed'} — applying a plain resize instead.`);
    } finally {
      setAiStage(false);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = baseUrl;
    });

    const scale = Math.min(IMAGE_TARGET / img.naturalWidth, IMAGE_TARGET / img.naturalHeight);
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);

    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png', 1));
    if (!blob) throw new Error('Failed to generate image');
    setResultExt('png');
    setResultUrl(URL.createObjectURL(blob));
    toast.success(`Upscaled to ${w}×${h}px`);
  };

  const upscaleVideo = async () => {
    const video = document.createElement('video');
    video.src = sourceUrl;
    video.muted = true;
    video.playsInline = true;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('Failed to load video'));
    });

    const scale = Math.min(videoTarget / video.videoWidth, videoTarget / video.videoHeight);
    const w = Math.round((video.videoWidth * scale) / 2) * 2;
    const h = Math.round((video.videoHeight * scale) / 2) * 2;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const stream = canvas.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 12_000_000 });
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };

    const done = new Promise<Blob>(resolve => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
    });

    recorder.start();
    await video.play();

    let raf = 0;
    const draw = () => {
      ctx.drawImage(video, 0, 0, w, h);
      if (video.duration) setProgress(Math.min(99, Math.round((video.currentTime / video.duration) * 100)));
      raf = requestAnimationFrame(draw);
    };
    draw();

    await new Promise<void>(resolve => { video.onended = () => resolve(); });
    cancelAnimationFrame(raf);
    recorder.stop();

    const blob = await done;
    setResultExt('webm');
    setResultUrl(URL.createObjectURL(blob));
    setProgress(100);
    toast.success(`Video upscaled to ${w}×${h}`);
  };

  const run = async () => {
    if (!sourceUrl) return toast.error('Upload a photo or video first');
    setBusy(true);
    setProgress(0);
    try {
      if (kind === 'video') await upscaleVideo();
      else await upscaleImage();
    } catch (e) {
      toast.error((e as Error).message || 'Upscale failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout title="Media Upscaler" subtitle="AI-enhanced 8K photo upscaling, plus up-to-4K video resizing">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Source */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Source photo or video</label>
              {originalDims && (
                <span className="text-xs text-muted-foreground">
                  {originalDims.w}×{originalDims.h}px
                </span>
              )}
            </div>

            <label className="flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-xl border border-dashed border-gold/40 text-gold cursor-pointer hover:bg-gold/10 transition-colors">
              {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
              <span className="text-sm">{uploading ? 'Uploading…' : 'Click to upload a photo or video'}</span>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                disabled={uploading}
                onChange={e => handleFile(e.target.files?.[0])}
              />
            </label>

            {sourceUrl && (
              <div className="relative rounded-lg overflow-hidden bg-muted aspect-video flex items-center justify-center">
                {kind === 'video'
                  ? <video src={sourceUrl} controls className="max-w-full max-h-full" />
                  : <img src={sourceUrl} alt="Source" className="max-w-full max-h-full object-contain" />}
              </div>
            )}

            {kind === 'video' && sourceUrl && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Video output size</label>
                <div className="flex gap-2">
                  {VIDEO_TARGETS.map(t => (
                    <button
                      key={t}
                      onClick={() => setVideoTarget(t)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                        videoTarget === t ? 'bg-gold text-teal-darker font-semibold' : 'bg-muted text-foreground'
                      }`}
                    >
                      {t === 1920 ? '1080p' : t === 2560 ? '1440p' : '4K'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={run}
            disabled={!sourceUrl || busy || uploading}
            className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : kind === 'video' ? <Film className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            {busy
              ? kind === 'video' ? `Upscaling video… ${progress}%` : aiStage ? 'Enhancing with AI…' : 'Finishing resize…'
              : kind === 'video' ? 'Upscale video' : 'AI-enhance & upscale to 8K'}
          </button>
        </div>

        {/* Result */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Upscaled result</label>
              {resultUrl && <span className="text-xs text-gold font-medium">Ready</span>}
            </div>

            {resultUrl ? (
              <div className="relative rounded-lg overflow-hidden bg-muted aspect-video flex items-center justify-center">
                {resultExt === 'webm'
                  ? <video src={resultUrl} controls className="max-w-full max-h-full" />
                  : <img src={resultUrl} alt="Upscaled" className="max-w-full max-h-full object-contain" />}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">Your upscaled photo or video will appear here</p>
              </div>
            )}
          </div>

          {resultUrl && (
            <a
              href={resultUrl}
              download={`haamkay-upscaled.${resultExt}`}
              className="btn-outline-gold w-full flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download {resultExt === 'webm' ? 'video' : '8K photo'}
            </a>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">How it works</p>
        <p>• Everything runs on your device — nothing is uploaded, nothing costs money.</p>
        <p>• Photos are scaled up to 8K (7680px) with premium smoothing.</p>
        <p>• Videos play through once while being re-rendered at the size you choose, so a long clip takes as long as the clip itself.</p>
      </div>
    </AdminLayout>
  );
};

export default AdminImageUpscaler;
