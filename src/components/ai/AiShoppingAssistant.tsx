import { useState, useRef, useEffect } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Sparkles, Loader2, ShoppingBag, Send, Wand2, MessageCircle, X } from 'lucide-react';
import { Link } from '@/lib/router-compat';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { recommendProducts } from '@/lib/ai.functions';
import { useCart } from '@/contexts/CartContext';

type Recommendation = NonNullable<Awaited<ReturnType<typeof recommendProducts>>['data']>;
type Pick = Recommendation['picks'][number];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  picks?: Pick[];
  error?: string;
}

const examples = [
  'A gift for my wife under Le 500,000',
  'Office shoes size 43',
  'An outfit for a wedding this weekend',
  'Comfortable sneakers for walking, size 42',
  'Trendy bag for university',
  'Kids clothes for 5 year old',
];

interface Props {
  compact?: boolean;
  onClose?: () => void;
  className?: string;
  autoFocus?: boolean;
}

const AiShoppingAssistant = ({ compact = false, onClose, className = '', autoFocus = false }: Props) => {
  const recommend = useServerFn(recommendProducts);
  const { addToCart } = useCart();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const run = async (query: string) => {
    const q = query.trim();
    if (q.length < 3 || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await recommend({ data: { query: q } });
      if (res.error || !res.data) {
        setMessages(prev => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: '', error: res.error ?? 'No suggestions right now.' },
        ]);
      } else {
        const data = res.data as Recommendation;
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: data.summary,
            picks: data.picks,
          },
        ]);
      }
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '',
          error: e instanceof Error ? e.message : 'Something went wrong. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (pick: Pick) => {
    addToCart(pick.product.id, 1, {
      id: pick.product.id,
      name: pick.product.name,
      price: pick.product.price,
      images: pick.product.image ? [pick.product.image] : null,
      category: pick.product.category,
    });
  };

  return (
    <div className={`flex flex-col bg-card border border-border rounded-2xl shadow-card overflow-hidden ${compact ? 'h-[480px]' : 'h-full min-h-[520px]'} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-teal-darker" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-none">Haamkay AI Shopper</p>
            <p className="text-[11px] text-muted-foreground">Powered by AI Gateway</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gold/15 flex items-center justify-center mb-3">
                <Wand2 className="w-7 h-7 text-gold" />
              </div>
              <h3 className="font-serif font-bold text-foreground">Tell us what you need</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-[280px] mx-auto">
                Describe the occasion, size, budget or style — our AI will pick the best items for you with explanations.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {examples.slice(0, compact ? 3 : 6).map(ex => (
                <button
                  key={ex}
                  onClick={() => run(ex)}
                  className="text-left text-sm rounded-xl border border-border bg-background hover:border-gold/40 hover:bg-gold/5 px-3 py-2.5 transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-gold shrink-0" />
                  <span className="truncate">{ex}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${m.role === 'user' ? 'bg-gold text-teal-darker font-medium' : 'bg-muted text-foreground'}`}>
              {m.role === 'user' ? (
                <p>{m.content}</p>
              ) : m.error ? (
                <p className="text-destructive">{m.error}</p>
              ) : (
                <div className="space-y-3">
                  <p className="leading-relaxed">{m.content}</p>
                  {m.picks && m.picks.length > 0 && (
                    <div className="grid gap-3 pt-2">
                      {m.picks.map(({ product, reason }) => (
                        <div key={product.id} className="rounded-xl border border-border bg-card p-3 flex gap-3">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-muted shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <Link to={`/product/${product.id}`} className="font-semibold text-foreground hover:text-gold line-clamp-1 text-[13px]">
                              {product.name}
                            </Link>
                            <p className="text-xs text-gold font-bold mt-0.5">Le {Number(product.price).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground mt-1 leading-snug">{reason}</p>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleAddToCart({ product, reason } as Pick)}
                                className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[11px] font-semibold text-teal-darker hover:opacity-90"
                              >
                                <ShoppingBag className="w-3 h-3" /> Add to cart
                              </button>
                              <Link to={`/product/${product.id}`} className="inline-flex items-center rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground">
                                View
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {m.picks && m.picks.length === 0 && <p className="text-xs text-muted-foreground">No matching products right now — try a different description.</p>}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-muted px-4 py-3 text-sm flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-gold" /> Finding products for you...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={e => {
          e.preventDefault();
          run(input);
        }}
        className="p-3 border-t border-border bg-background"
      >
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef as any}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                run(input);
              }
            }}
            placeholder="e.g. Comfortable sneakers size 42 under Le 800,000"
            rows={1}
            maxLength={500}
            className="min-h-[44px] max-h-[120px] resize-none rounded-xl"
          />
          <Button type="submit" size="icon" disabled={loading || input.trim().length < 3} className="shrink-0 rounded-xl h-[44px] w-[44px] bg-gold text-teal-darker hover:bg-gold/90">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 px-1">AI uses our live catalogue and explains why each item fits. Prices in Leones.</p>
      </form>
    </div>
  );
};

export default AiShoppingAssistant;
