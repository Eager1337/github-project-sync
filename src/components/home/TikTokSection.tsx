import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Music2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const handleFrom = (url: string) => {
  const match = url.match(/@([A-Za-z0-9._]+)/);
  return match ? match[1] : '';
};

const TikTokSection = () => {
  const [profileUrl, setProfileUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'tiktok_url')
      .maybeSingle()
      .then(({ data }) => setProfileUrl(data?.value ?? null));
  }, []);

  useEffect(() => {
    if (!profileUrl) return;
    const existing = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
  }, [profileUrl]);

  if (!profileUrl) return null;
  const handle = handleFrom(profileUrl);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <p className="text-gold uppercase tracking-widest text-xs mb-2 flex items-center justify-center gap-2">
            <Music2 className="w-4 h-4" /> TikTok
          </p>
          <h2 className="text-2xl md:text-4xl font-serif font-bold">
            Watch us on <span className="text-gold-gradient">TikTok</span>
          </h2>
        </motion.div>

        <div className="flex justify-center">
          <blockquote
            className="tiktok-embed"
            cite={profileUrl}
            data-unique-id={handle}
            data-embed-type="creator"
            style={{ maxWidth: 780, minWidth: 288 }}
          >
            <section>
              <a target="_blank" rel="noreferrer" href={profileUrl}>
                @{handle || 'our TikTok'}
              </a>
            </section>
          </blockquote>
        </div>
      </div>
    </section>
  );
};

export default TikTokSection;
