import { useEffect, useState } from 'react';
import { Users, Plus, Trash2, Upload, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { invokeAi } from '@/lib/ai';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { validateMediaFile } from '@/lib/fileValidation';

interface Member {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  photo_url: string | null;
  sort_order: number;
  published: boolean;
}

const empty = { name: '', role: '', bio: '', photo_url: '', sort_order: 0 };

const AdminTeam = () => {
  const [rows, setRows] = useState<Member[]>([]);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('team_members').select('*').order('sort_order');
    setRows((data as Member[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const uploadPhoto = async (file: File | undefined) => {
    if (!file) return;
    const check = validateMediaFile(file, 'images');
    if (!check.valid) return toast.error(check.error);
    const ext = file.name.split('.').pop()?.toLowerCase();
    const path = `images/team-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('product-media').upload(path, file, { contentType: file.type });
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from('product-media').getPublicUrl(path);
    setForm(f => ({ ...f, photo_url: data.publicUrl }));
    toast.success('Photo uploaded');
  };

  const aiBio = async () => {
    if (!form.name.trim()) return toast.error('Add a name first');
    setBusy(true);
    const { data, error } = await invokeAi<{ bio?: string }>('ai-team-bio', {
      name: form.name, role: form.role, notes: form.bio, photo: form.photo_url,
    });
    setBusy(false);
    const bio = data?.bio?.trim();
    if (!bio) return toast.error(error ?? 'AI could not write a bio');
    setForm(f => ({ ...f, bio }));
    toast.success('Bio written by AI');
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    const { error } = await supabase.from('team_members').insert({
      name: form.name.trim(),
      role: form.role.trim() || null,
      bio: form.bio.trim() || null,
      photo_url: form.photo_url || null,
      sort_order: Number(form.sort_order) || 0,
    });
    if (error) return toast.error(error.message);
    setForm(empty);
    toast.success('Team member added');
    load();
  };

  const togglePublish = async (m: Member) => {
    await supabase.from('team_members').update({ published: !m.published }).eq('id', m.id);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) return toast.error(error.message);
    setRows(prev => prev.filter(r => r.id !== id));
  };

  return (
    <AdminLayout title="Team & About" subtitle="Owners and employees shown in the About section">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="p-5 rounded-xl border border-border bg-card space-y-3">
          <h2 className="font-serif font-bold text-foreground flex items-center gap-2"><Plus className="w-4 h-4 text-gold" /> Add member</h2>
          <input className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" placeholder="Role e.g. Founder & CEO" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
          <textarea className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" rows={4} placeholder="Short bio (or a few notes, then let AI write it)" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
          <button onClick={aiBio} disabled={busy} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gold/50 text-gold text-sm disabled:opacity-60">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Write bio with AI
          </button>
          <label className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl border border-dashed border-gold/40 text-gold cursor-pointer hover:bg-gold/10 text-sm">
            <Upload className="w-4 h-4" /> {form.photo_url ? 'Change photo' : 'Upload photo'}
            <input type="file" accept="image/*" className="hidden" onChange={e => uploadPhoto(e.target.files?.[0])} />
          </label>
          {form.photo_url && <img src={form.photo_url} alt="Team member preview" className="w-24 h-24 rounded-full object-cover" />}
          <input type="number" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" placeholder="Sort order" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} />
          <button onClick={save} className="w-full px-4 py-3 rounded-xl bg-gold text-teal-darker font-semibold">Save member</button>
        </div>

        <div className="space-y-3">
          {rows.length === 0 && <p className="text-sm text-muted-foreground flex items-center gap-2"><Users className="w-4 h-4" /> No team members yet.</p>}
          {rows.map(m => (
            <div key={m.id} className="p-4 rounded-xl border border-border bg-card flex gap-3 items-start">
              {m.photo_url
                ? <img src={m.photo_url} alt={m.name} className="w-14 h-14 rounded-full object-cover" />
                : <div className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center text-gold font-bold">{m.name.charAt(0)}</div>}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground truncate">{m.name}</p>
                <p className="text-xs text-gold">{m.role}</p>
                {m.bio && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{m.bio}</p>}
              </div>
              <button onClick={() => togglePublish(m)} className={`text-xs px-2 py-1 rounded-lg border ${m.published ? 'border-gold/50 text-gold' : 'border-border text-muted-foreground'}`}>
                {m.published ? 'Live' : 'Hidden'}
              </button>
              <button onClick={() => remove(m.id)} className="p-2 text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTeam;
