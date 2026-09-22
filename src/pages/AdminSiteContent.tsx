import { useEffect, useState } from 'react';
import { HelpCircle, Quote, Plus, Trash2, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface Faq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  published: boolean;
}

interface Testimonial {
  id: string;
  author: string;
  quote: string;
  rating: number;
  avatar_url: string | null;
  published: boolean;
}

const AdminSiteContent = () => {
  const [tab, setTab] = useState<'faqs' | 'testimonials'>('faqs');
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', sort_order: 0 });
  const [tForm, setTForm] = useState({ author: '', quote: '', rating: 5, avatar_url: '' });

  const load = async () => {
    const [{ data: f }, { data: t }] = await Promise.all([
      supabase.from('faqs').select('*').order('sort_order'),
      supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
    ]);
    if (f) setFaqs(f as Faq[]);
    if (t) setTestimonials(t as Testimonial[]);
  };

  useEffect(() => { load(); }, []);

  const addFaq = async () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim()) return toast.error('Question and answer are required.');
    const { error } = await supabase.from('faqs').insert({
      question: faqForm.question.trim(),
      answer: faqForm.answer.trim(),
      sort_order: Number(faqForm.sort_order) || 0,
    });
    if (error) return toast.error(error.message);
    setFaqForm({ question: '', answer: '', sort_order: 0 });
    toast.success('FAQ added');
    load();
  };

  const toggleFaq = async (f: Faq) => {
    const { error } = await supabase.from('faqs').update({ published: !f.published }).eq('id', f.id);
    if (error) return toast.error(error.message);
    load();
  };

  const saveFaq = async (f: Faq) => {
    const { error } = await supabase
      .from('faqs')
      .update({ question: f.question, answer: f.answer, sort_order: f.sort_order })
      .eq('id', f.id);
    if (error) return toast.error(error.message);
    toast.success('Saved');
  };

  const removeFaq = async (id: string) => {
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) return toast.error(error.message);
    setFaqs(prev => prev.filter(f => f.id !== id));
  };

  const addTestimonial = async () => {
    if (!tForm.author.trim() || !tForm.quote.trim()) return toast.error('Name and quote are required.');
    const { error } = await supabase.from('testimonials').insert({
      author: tForm.author.trim(),
      quote: tForm.quote.trim(),
      rating: Math.min(5, Math.max(1, Number(tForm.rating) || 5)),
      avatar_url: tForm.avatar_url.trim() || null,
    });
    if (error) return toast.error(error.message);
    setTForm({ author: '', quote: '', rating: 5, avatar_url: '' });
    toast.success('Testimonial added');
    load();
  };

  const toggleTestimonial = async (t: Testimonial) => {
    const { error } = await supabase.from('testimonials').update({ published: !t.published }).eq('id', t.id);
    if (error) return toast.error(error.message);
    load();
  };

  const removeTestimonial = async (id: string) => {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) return toast.error(error.message);
    setTestimonials(prev => prev.filter(t => t.id !== id));
  };

  const uploadAvatar = async (file: File) => {
    const path = `testimonials/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error } = await supabase.storage.from('product-media').upload(path, file, { contentType: file.type });
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from('product-media').getPublicUrl(path);
    setTForm(f => ({ ...f, avatar_url: data.publicUrl }));
  };

  return (
    <AdminLayout title="Site Content" subtitle="FAQs and customer testimonials shown on the website">
      <div className="flex gap-2 mb-6">
        {(['faqs', 'testimonials'] as const).map(key => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === key ? 'bg-gold text-teal-darker' : 'bg-muted text-foreground hover:bg-gold/20'
            }`}
          >
            {key === 'faqs' ? 'FAQs' : 'Testimonials'}
          </button>
        ))}
      </div>

      {tab === 'faqs' ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card-luxury p-5 space-y-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-gold" />
              <h2 className="font-serif font-bold text-foreground">New FAQ</h2>
            </div>
            <input
              value={faqForm.question}
              onChange={e => setFaqForm({ ...faqForm, question: e.target.value })}
              placeholder="Question"
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground"
            />
            <textarea
              value={faqForm.answer}
              onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })}
              placeholder="Answer"
              rows={4}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground"
            />
            <input
              type="number"
              value={faqForm.sort_order}
              onChange={e => setFaqForm({ ...faqForm, sort_order: Number(e.target.value) })}
              placeholder="Order"
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground"
            />
            <button onClick={addFaq} className="btn-gold w-full flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add FAQ
            </button>
          </div>

          <div className="card-luxury p-5 space-y-3 max-h-[70vh] overflow-y-auto">
            {faqs.length === 0 && <p className="text-sm text-muted-foreground">No FAQs yet.</p>}
            {faqs.map(f => (
              <div key={f.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                <input
                  value={f.question}
                  onChange={e => setFaqs(prev => prev.map(x => x.id === f.id ? { ...x, question: e.target.value } : x))}
                  className="w-full bg-transparent border-b border-border text-sm text-foreground pb-1"
                />
                <textarea
                  value={f.answer}
                  rows={3}
                  onChange={e => setFaqs(prev => prev.map(x => x.id === f.id ? { ...x, answer: e.target.value } : x))}
                  className="w-full bg-transparent text-xs text-muted-foreground"
                />
                <div className="flex gap-2">
                  <button onClick={() => saveFaq(f)} className="text-xs text-gold flex items-center gap-1"><Save className="w-3 h-3" /> Save</button>
                  <button onClick={() => toggleFaq(f)} className="text-xs text-muted-foreground flex items-center gap-1">
                    {f.published ? <><Eye className="w-3 h-3" /> Live</> : <><EyeOff className="w-3 h-3" /> Hidden</>}
                  </button>
                  <button onClick={() => removeFaq(f.id)} className="text-xs text-destructive flex items-center gap-1 ml-auto"><Trash2 className="w-3 h-3" /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card-luxury p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Quote className="w-5 h-5 text-gold" />
              <h2 className="font-serif font-bold text-foreground">New testimonial</h2>
            </div>
            <input
              value={tForm.author}
              onChange={e => setTForm({ ...tForm, author: e.target.value })}
              placeholder="Customer name"
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground"
            />
            <textarea
              value={tForm.quote}
              onChange={e => setTForm({ ...tForm, quote: e.target.value })}
              placeholder="What they said"
              rows={3}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground"
            />
            <input
              type="number"
              min={1}
              max={5}
              value={tForm.rating}
              onChange={e => setTForm({ ...tForm, rating: Number(e.target.value) })}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground"
            />
            <input
              type="file"
              accept="image/*"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }}
              className="w-full text-sm text-muted-foreground"
            />
            {tForm.avatar_url && <img src={tForm.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />}
            <button onClick={addTestimonial} className="btn-gold w-full flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add testimonial
            </button>
          </div>

          <div className="card-luxury p-5 space-y-3 max-h-[70vh] overflow-y-auto">
            {testimonials.length === 0 && <p className="text-sm text-muted-foreground">No testimonials yet.</p>}
            {testimonials.map(t => (
              <div key={t.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                {t.avatar_url && <img src={t.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{t.author} · {'★'.repeat(t.rating)}</p>
                  <p className="text-xs text-muted-foreground">{t.quote}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => toggleTestimonial(t)} className="text-muted-foreground hover:text-gold">
                    {t.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => removeTestimonial(t.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSiteContent;
