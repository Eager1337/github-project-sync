import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Sparkles, Loader2 } from 'lucide-react';
import { Link } from '@/lib/router-compat';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { recommendProducts } from '@/lib/ai.functions';

type Result = Awaited<ReturnType<typeof recommendProducts>>;

const examples = ['A gift for my wife under Le 500,000', 'Office shoes size 43', 'An outfit for a wedding this weekend'];

const AiShopperSection = () => {
  const recommend = useServerFn(recommendProducts);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const run = async (q = query) => {
    if (q.trim().length < 3) return;
    setLoading(true); setError(null); setResult(null);
    try {
      setResult(await recommend({ data: { query: q } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-muted/40">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary"><Sparkles className="h-4 w-4" /> Personal shopper</span>
          <h2 className="mt-2 text-3xl md:text-4xl font-display font-bold text-foreground">Tell us what you need</h2>
          <p className="mt-2 text-muted-foreground">Describe the occasion, size, budget or style — we'll pick the best items for you.</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); run(); }} className="space-y-3">
          <Textarea value={query} onChange={(e) => setQuery(e.target.value)} maxLength={500} rows={3} placeholder="e.g. Comfortable sneakers for walking, size 42, under Le 800,000" />
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={loading || query.trim().length < 3}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Find products
            </Button>
            {examples.map((ex) => (
              <button key={ex} type="button" onClick={() => { setQuery(ex); run(ex); }} className="text-xs rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-foreground">
                {ex}
              </button>
            ))}
          </div>
        </form>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        {result && (
          <div className="mt-8">
            <p className="text-foreground font-medium mb-4">{result.summary}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {result.picks.map(({ product, reason }) => (
                <Link key={product.id} to={`/product/${product.id}`} className="flex gap-4 rounded-lg border border-border bg-card p-3 hover:border-primary transition-colors">
                  {product.image && <img src={product.image} alt={product.name} className="h-24 w-24 rounded-md object-cover" loading="lazy" />}
                  <div className="min-w-0">
                    <p className="font-semibold text-card-foreground truncate">{product.name}</p>
                    <p className="text-sm text-primary">Le {Number(product.price).toLocaleString()}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{reason}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AiShopperSection;
