import { motion } from 'framer-motion';
import { Apple, Smartphone, Monitor, Download, Laptop } from 'lucide-react';

const platforms = [
  {
    title: 'Mobile App',
    desc: 'Shop on the go — available on iOS & Android',
    icon: Smartphone,
    badges: ['iOS', 'Android'],
    accent: 'from-gold/20 to-gold/5',
  },
  {
    title: 'Desktop App',
    desc: 'Full experience on Windows & macOS',
    icon: Laptop,
    badges: ['Windows', 'macOS'],
    accent: 'from-teal-light/20 to-teal-light/5',
  },
];

const storeLinks = [
  { label: 'App Store', icon: Apple, sub: 'Download on iOS' },
  { label: 'Google Play', icon: Smartphone, sub: 'Get it on Android' },
  { label: 'Windows', icon: Monitor, sub: 'Download .exe' },
  { label: 'macOS', icon: Apple, sub: 'Download .dmg' },
];

const DownloadSection = () => {
  return (
    <section id="download" className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-b from-background to-teal-darker/40">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-gold/20 border border-gold/40 rounded-full text-gold text-xs md:text-sm font-medium mb-4">
            📱 Get the App
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3">
            Download <span className="text-gold-gradient italic">Haamkay</span> Anywhere
          </h2>
          <p className="text-sm md:text-lg text-foreground/70 max-w-xl mx-auto">
            Shop our full collection on any device — fast, secure, and always in stock.
          </p>
        </motion.div>

        {/* Platform cards */}
        <div className="grid sm:grid-cols-2 gap-5 md:gap-6 mb-8">
          {platforms.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`card-luxury bg-gradient-to-br ${p.accent} relative overflow-hidden`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center flex-shrink-0">
                  <p.icon className="w-6 h-6 md:w-7 md:h-7 text-gold" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-serif font-semibold mb-1">{p.title}</h3>
                  <p className="text-sm text-foreground/60 mb-3">{p.desc}</p>
                  <div className="flex gap-2">
                    {p.badges.map(b => (
                      <span key={b} className="px-2.5 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-[11px] font-medium">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Download buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {storeLinks.map((s, i) => (
            <motion.a
              key={s.label}
              href="#download"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col items-center gap-1 p-4 md:p-5 rounded-xl bg-card border border-border hover:border-gold/50 hover:bg-gold/5 transition-colors group"
            >
              <s.icon className="w-6 h-6 md:w-7 md:h-7 text-gold mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-foreground">{s.label}</span>
              <span className="text-[11px] text-muted-foreground">{s.sub}</span>
            </motion.a>
          ))}
        </div>

        {/* CTA banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 md:p-6 rounded-2xl bg-gradient-to-r from-teal-deep to-teal-darker border border-gold/20"
        >
          <div className="text-center sm:text-left">
            <p className="font-serif font-semibold text-base md:text-lg">Prefer the web? You're already here!</p>
            <p className="text-xs md:text-sm text-foreground/60">No download needed — bookmark this page.</p>
          </div>
          <a href="#daily-drops" className="btn-gold flex items-center gap-2 text-sm whitespace-nowrap">
            <Download className="w-4 h-4" />
            Start Shopping
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default DownloadSection;
