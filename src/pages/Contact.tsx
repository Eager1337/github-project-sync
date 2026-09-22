import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const contactInfo = [
  { icon: Phone, label: 'Phone', value: '+232 76 682 626', link: 'tel:+23276682626' },
  { icon: MessageCircle, label: 'WhatsApp', value: '+232 76 682 626', link: 'https://wa.me/23276682626' },
  { icon: Mail, label: 'Email', value: 'info@haamkay.com', link: 'mailto:info@haamkay.com' },
  { icon: MapPin, label: 'Address', value: '53 Malamah Thomas St, Freetown', link: '#' },
  { icon: Clock, label: 'Hours', value: 'Mon-Sat: 9AM-7PM', link: '#' },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Message sent! We\'ll get back to you soon.');
    setForm({ name: '', email: '', phone: '', message: '' });
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 md:pt-40 pb-12 md:pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-12"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-2 md:mb-4">
              Get in <span className="text-gold-gradient">Touch</span>
            </h1>
            <p className="text-muted-foreground text-xs md:text-base max-w-2xl mx-auto">
              Have questions? We'd love to hear from you.
            </p>
          </motion.div>

          {/* Quick WhatsApp - Prominent on mobile */}
          <motion.a
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            href="https://wa.me/23276682626?text=Hi%2C%20I%20have%20a%20question%20about%20your%20products"
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-6 md:hidden card-luxury bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-colors p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-base font-semibold text-foreground">Chat on WhatsApp</div>
                <div className="text-xs text-muted-foreground">Get instant support</div>
              </div>
            </div>
          </motion.a>

          <div className="grid lg:grid-cols-2 gap-6 md:gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-luxury p-4 md:p-6"
            >
              <h2 className="text-lg md:text-2xl font-serif font-bold text-foreground mb-4 md:mb-6">
                Send a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs md:text-sm text-foreground mb-1.5 md:mb-2">Your Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm text-foreground mb-1.5 md:mb-2">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs md:text-sm text-foreground mb-1.5 md:mb-2">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="+232 XX XXX XXX"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm text-foreground mb-1.5 md:mb-2">Message</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold h-24 md:h-32 resize-none"
                    placeholder="How can we help you?"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold w-full flex items-center justify-center gap-2 py-3 md:py-4 text-sm md:text-base"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 md:space-y-6"
            >
              <div className="card-luxury p-4 md:p-6">
                <h2 className="text-lg md:text-2xl font-serif font-bold text-foreground mb-4 md:mb-6">
                  Contact Information
                </h2>
                <div className="space-y-3 md:space-y-4">
                  {contactInfo.map((item, i) => (
                    <a
                      key={i}
                      href={item.link}
                      target={item.link.startsWith('http') ? '_blank' : undefined}
                      rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-muted rounded-lg hover:bg-gold/10 transition-colors group"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 group-hover:bg-gold group-hover:text-teal-darker transition-colors">
                        <item.icon className="w-4 h-4 md:w-5 md:h-5 text-gold group-hover:text-teal-darker" />
                      </div>
                      <div>
                        <div className="text-xs md:text-sm text-muted-foreground">{item.label}</div>
                        <div className="text-foreground text-sm md:text-base font-medium">{item.value}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick WhatsApp - Desktop */}
              <a
                href="https://wa.me/23276682626?text=Hi%2C%20I%20have%20a%20question%20about%20your%20products"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:block card-luxury bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-foreground">Chat on WhatsApp</div>
                    <div className="text-sm text-muted-foreground">Get instant support</div>
                  </div>
                </div>
              </a>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
