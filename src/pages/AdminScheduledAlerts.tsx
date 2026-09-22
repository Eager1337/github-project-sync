import { useEffect, useState } from 'react';
import { CalendarClock, Plus, Trash2, Power } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface Schedule {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  link: string | null;
  interval_seconds: number;
  active: boolean;
}

const UNITS = [
  { label: 'seconds', value: 1 },
  { label: 'minutes', value: 60 },
  { label: 'hours', value: 3600 },
];

const AdminScheduledAlerts = () => {
  const [rows, setRows] = useState<Schedule[]>([]);
  const [form, setForm] = useState({ title: '', body: '', image_url: '', link: '', every: 30, unit: 60 });

  const load = async () => {
    const { data } = await supabase.from('notification_schedules').select('*').order('created_at', { ascending: false });
    setRows((data as Schedule[]) ?? []);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title.trim()) return toast.error('Give the alert a title');
    const interval = Math.max(5, Math.round(form.every * form.unit));
    const { error } = await supabase.from('notification_schedules').insert({
      title: form.title.trim(),
      body: form.body.trim() || null,
      image_url: form.image_url.trim() || null,
      link: form.link.trim() || null,
      interval_seconds: interval,
      active: true,
    });
    if (error) return toast.error(error.message);
    setForm({ title: '', body: '', image_url: '', link: '', every: 30, unit: 60 });
    toast.success('Repeating alert created');
    load();
  };

  const toggle = async (row: Schedule) => {
    const { error } = await supabase.from('notification_schedules').update({ active: !row.active }).eq('id', row.id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('notification_schedules').delete().eq('id', id);
    if (error) return toast.error(error.message);
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const human = (s: number) =>
    s % 3600 === 0 ? `every ${s / 3600}h` : s % 60 === 0 ? `every ${s / 60}m` : `every ${s}s`;

  return (
    <AdminLayout title="Scheduled Alerts" subtitle="Repeating pop-up alerts shown on every customer's device">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="p-5 rounded-xl border border-border bg-card space-y-3">
          <h2 className="font-serif font-bold text-foreground flex items-center gap-2"><Plus className="w-4 h-4 text-gold" /> New repeating alert</h2>
          <input className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" rows={2} placeholder="Message" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />
          <input className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" placeholder="Image URL (optional)" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
          <input className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" placeholder="Link e.g. /daily-drops (optional)" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} />
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">Show every</span>
            <input type="number" min={1} className="w-24 px-3 py-2 rounded-lg bg-background border border-border text-sm" value={form.every} onChange={e => setForm({ ...form, every: Number(e.target.value) })} />
            <select className="px-3 py-2 rounded-lg bg-background border border-border text-sm" value={form.unit} onChange={e => setForm({ ...form, unit: Number(e.target.value) })}>
              {UNITS.map(u => <option key={u.label} value={u.value}>{u.label}</option>)}
            </select>
          </div>
          <button onClick={create} className="w-full px-4 py-3 rounded-xl bg-gold text-teal-darker font-semibold">Create alert</button>
        </div>

        <div className="space-y-3">
          {rows.length === 0 && <p className="text-sm text-muted-foreground">No repeating alerts yet.</p>}
          {rows.map(row => (
            <div key={row.id} className="p-4 rounded-xl border border-border bg-card flex gap-3 items-start">
              {row.image_url && <img src={row.image_url} alt="" className="w-14 h-14 rounded-lg object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground truncate">{row.title}</p>
                {row.body && <p className="text-sm text-muted-foreground line-clamp-2">{row.body}</p>}
                <p className="text-xs text-gold flex items-center gap-1 mt-1"><CalendarClock className="w-3 h-3" /> {human(row.interval_seconds)} · {row.active ? 'active' : 'paused'}</p>
              </div>
              <button onClick={() => toggle(row)} title="Toggle" className={`p-2 rounded-lg ${row.active ? 'text-gold' : 'text-muted-foreground'}`}><Power className="w-4 h-4" /></button>
              <button onClick={() => remove(row.id)} title="Delete" className="p-2 rounded-lg text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminScheduledAlerts;
