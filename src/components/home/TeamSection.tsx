import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface Member {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  photo_url: string | null;
}

export const TeamSection = () => {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    supabase
      .from('team_members')
      .select('id, name, role, bio, photo_url')
      .eq('published', true)
      .order('sort_order')
      .then(({ data }) => setMembers((data as Member[]) ?? []));
  }, []);

  if (members.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">About us</p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">The people behind Haamkay</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m, i) => (
            <motion.article
              key={m.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group p-6 rounded-2xl border border-border bg-card text-center hover:border-gold/50 transition-colors"
            >
              {m.photo_url ? (
                <img
                  src={m.photo_url}
                  alt={`${m.name}, ${m.role ?? 'team member'} at Haamkay Enterprises`}
                  loading="lazy"
                  className="w-24 h-24 mx-auto rounded-full object-cover ring-2 ring-gold/40 group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-24 h-24 mx-auto rounded-full bg-gold/15 flex items-center justify-center text-2xl font-serif text-gold">
                  {m.name.charAt(0)}
                </div>
              )}
              <h3 className="mt-4 font-serif font-bold text-foreground">{m.name}</h3>
              {m.role && <p className="text-xs uppercase tracking-widest text-gold mt-1">{m.role}</p>}
              {m.bio && <p className="text-sm text-muted-foreground mt-3">{m.bio}</p>}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
