import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AiShoppingAssistant from '@/components/ai/AiShoppingAssistant';
import Seo from '@/components/seo/Seo';

const AiShopper = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="AI Product Finder | Haamkay Enterprises"
        description="Describe what you need — our AI shopper finds the best products from Haamkay's live catalogue with explanations. Powered by AI Gateway."
        path="/ai-shopper"
      />
      <Header />
      <main className="pt-28 md:pt-36 pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="text-center mb-8 md:mb-10">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-gold bg-gold/10 border border-gold/20 rounded-full px-3 py-1">
              ✨ AI Gateway · Personal Shopper
            </span>
            <h1 className="mt-4 text-3xl md:text-5xl font-serif font-bold text-foreground">Find exactly what you need</h1>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Tell our AI your occasion, size, budget or style. It searches our live catalogue of products in Freetown and explains why each pick fits you — prices in Leones.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-6 md:gap-8">
            <div className="lg:col-span-3">
              <AiShoppingAssistant className="h-[640px]" autoFocus />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-serif font-bold text-foreground">How it works</h3>
                <ol className="mt-3 space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Describe what you need in plain English or Krio.</li>
                  <li>AI reads our current stock (150 latest items) with sizes, colours and prices.</li>
                  <li>You get up to 6 picks with a short reason for each — why it matches your need.</li>
                  <li>Add to cart or open the product page to order via WhatsApp.</li>
                </ol>
              </div>
              <div className="rounded-2xl border border-gold/20 bg-gold/5 p-5">
                <h4 className="text-sm font-semibold text-foreground">Example prompts</h4>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <li>• “Wedding guest dress, size M, under Le 700k, not too bright”</li>
                  <li>• “School bag for 10 year old, durable and waterproof”</li>
                  <li>• “Gift for my wife — something elegant for office”</li>
                  <li>• “Men’s casual shoes 44 for walking”</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <h4 className="text-sm font-semibold text-foreground">Powered by AI Gateway</h4>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  This feature uses Lovable AI Gateway (server-side) with <code className="text-xs bg-muted px-1.5 py-0.5 rounded">openai/gpt-6-astra</code> via the Vercel AI SDK. No Gemini API key or deployment token is needed — it runs on the built-in AI service with proper error handling for credits and rate limits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AiShopper;
