import { Link } from '@/lib/router-compat';
import { Sparkles, ArrowRight, Wand2 } from 'lucide-react';
import AiShoppingAssistant from '@/components/ai/AiShoppingAssistant';

const AiShopperSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-gold bg-gold/10 border border-gold/20 rounded-full px-3 py-1">
                <Sparkles className="h-3.5 w-3.5" /> New · AI Gateway
              </span>
              <h2 className="mt-4 text-3xl md:text-5xl font-serif font-bold text-foreground leading-tight">
                Tell us what you need — <span className="text-gold-gradient">we'll find it</span>
              </h2>
              <p className="mt-3 text-muted-foreground text-sm md:text-base leading-relaxed">
                Describe the occasion, size, budget or style in your own words. Our AI shopper searches Haamkay's live catalogue and explains why each pick fits you. Powered by Lovable AI Gateway — no external keys needed.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-foreground">
                <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center"><Wand2 className="w-4 h-4 text-gold" /></div>
                <span>Understands budget in Leones, sizes, colours, occasions</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground">
                <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center"><Sparkles className="w-4 h-4 text-gold" /></div>
                <span>Returns up to 6 products with a short reason for each</span>
              </div>
            </div>

            <Link to="/ai-shopper" className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:gap-3 transition-all">
              Open full AI finder <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">How it works:</strong> Your message is sent to a server function that loads our latest 150 in-stock products, then calls <code className="bg-muted px-1.5 py-0.5 rounded">openai/gpt-6-astra</code> through <code className="bg-muted px-1.5 py-0.5 rounded">https://ai.gateway.lovable.dev/v1</code> using the built-in <code className="bg-muted px-1.5 py-0.5 rounded">LOVABLE_API_KEY</code>. The model returns only real product IDs with explanations.
            </div>
          </div>

          <div className="lg:sticky lg:top-28">
            <AiShoppingAssistant compact />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiShopperSection;
