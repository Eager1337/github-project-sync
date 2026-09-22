import { useEffect, useState } from 'react';
import { Bell, Send, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { broadcastNotification, NotificationType } from '@/lib/notify';

interface Item {
  id: string;
  type: string;
  title: string;
  body: string | null;
  image_url: string | null;
  link: string | null;
  created_at: string;
}

const AdminNotifications = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [subscribers, setSubscribers] = useState(0);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    type: 'general' as NotificationType,
    title: '',
    body: '',
    link: '',
    push: true,
  });

  const load = async () => {
    const [{ data: notes }, { count }] = await Promise.all([
      supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('push_subscribers').select('*', { count: 'exact', head: true }),
    ]);
    if (notes) setItems(notes as Item[]);
    setSubscribers(count ?? 0);
  };

  useEffect(() => { load(); }, []);

  const send = async () => {
    if (!form.title.trim()) return toast.error('A title is required.');
    setSending(true);
    const result = await broadcastNotification({
      type: form.type,
      title: form.title.trim(),
      body: form.body.trim() || undefined,
      link: form.link.trim() || null,
      push: form.push,
    });
    setSending(false);
    if (!result.ok) return toast.error(result.error ?? 'Failed to send');
    toast.success('Alert sent to your customers!');
    setForm({ ...form, title: '', body: '', link: '' });
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) return toast.error(error.message);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <AdminLayout title="Notifications" subtitle="Send alerts about drops, new products and price changes">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-luxury p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-gold" />
            <h2 className="font-serif font-bold text-foreground">New alert</h2>
          </div>

          <select
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value as NotificationType })}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground"
          >
            <option value="general">General announcement</option>
            <option value="new_product">New product</option>
            <option value="new_drop">New drop</option>
            <option value="price_change">Price change</option>
          </select>

          <input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground"
          />
          <textarea
            value={form.body}
            onChange={e => setForm({ ...form, body: e.target.value })}
            placeholder="Message"
            rows={3}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground"
          />
          <input
            value={form.link}
            onChange={e => setForm({ ...form, link: e.target.value })}
            placeholder="Link (e.g. /daily-drops)"
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground"
          />

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={form.push} onChange={e => setForm({ ...form, push: e.target.checked })} />
            Also send as a browser push notification
          </label>

          <button onClick={send} disabled={sending} className="btn-gold w-full flex items-center justify-center gap-2">
            <Send className="w-4 h-4" /> {sending ? 'Sending…' : 'Send alert'}
          </button>

          <p className="text-xs text-muted-foreground flex items-center gap-2 pt-2">
            <Users className="w-4 h-4 text-gold" /> {subscribers} device(s) subscribed to push
          </p>
        </div>

        <div className="card-luxury p-5">
          <h2 className="font-serif font-bold text-foreground mb-3">Sent alerts</h2>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {items.length === 0 && <p className="text-sm text-muted-foreground">Nothing sent yet.</p>}
            {items.map(n => (
              <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  {n.body && <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>}
                  <p className="text-[11px] text-gold mt-1">
                    {n.type.replace('_', ' ')} · {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
                <button onClick={() => remove(n.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
