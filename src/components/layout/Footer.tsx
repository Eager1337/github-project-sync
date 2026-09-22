import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Settings, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-teal-darker border-t border-border">
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gold flex items-center justify-center">
                <span className="text-teal-darker font-serif font-bold text-lg md:text-xl">H</span>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-serif font-bold text-foreground">Haamkay</h3>
                <span className="text-[10px] md:text-xs text-gold tracking-widest uppercase">Enterprises</span>
              </div>
            </div>
            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-4 md:mb-6">
              Your premier destination for luxury fashion in Sierra Leone.
            </p>
            <div className="flex gap-3 md:gap-4">
              <a
                href="https://www.tiktok.com/@haamkay?_r=1&_t=ZM-92tNIZyUYsi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted flex items-center justify-center text-foreground/60 hover:bg-gold hover:text-teal-darker transition-all"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted flex items-center justify-center text-foreground/60 hover:bg-gold hover:text-teal-darker transition-all"
              >
                <Instagram className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a
                href="#"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted flex items-center justify-center text-foreground/60 hover:bg-gold hover:text-teal-darker transition-all"
              >
                <Facebook className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm md:text-lg font-serif font-semibold text-foreground mb-4 md:mb-6">Quick Links</h4>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <Link to="/categories" className="text-muted-foreground hover:text-gold transition-colors text-xs md:text-sm">
                  All Categories
                </Link>
              </li>
              <li>
                <Link to="/daily-drops" className="text-muted-foreground hover:text-gold transition-colors text-xs md:text-sm">
                  Daily Drops
                </Link>
              </li>
              <li>
                <Link to="/trending" className="text-muted-foreground hover:text-gold transition-colors text-xs md:text-sm">
                  Trending Now
                </Link>
              </li>
              <li>
                <Link to="/our-story" className="text-muted-foreground hover:text-gold transition-colors text-xs md:text-sm">
                  Our Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm md:text-lg font-serif font-semibold text-foreground mb-4 md:mb-6">Help</h4>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-gold transition-colors text-xs md:text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-gold transition-colors text-xs md:text-sm">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-gold transition-colors text-xs md:text-sm">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-gold transition-colors text-xs md:text-sm">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-sm md:text-lg font-serif font-semibold text-foreground mb-4 md:mb-6">Contact Us</h4>
            <ul className="space-y-3 md:space-y-4">
              <li className="flex items-start gap-2 md:gap-3">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gold flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground text-xs md:text-sm">
                  53 Malamah Thomas Street,<br />Freetown, Sierra Leone
                </span>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <Phone className="w-4 h-4 md:w-5 md:h-5 text-gold flex-shrink-0" />
                <a href="tel:+23276682626" className="text-muted-foreground hover:text-gold text-xs md:text-sm transition-colors">
                  +232 76 682 626
                </a>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-gold flex-shrink-0" />
                <a href="mailto:info@haamkay.com" className="text-muted-foreground hover:text-gold text-xs md:text-sm transition-colors">
                  info@haamkay.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs md:text-sm text-center md:text-left">
            © 2024 Haamkay Enterprises. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4 md:gap-6">
            <a href="#" className="text-muted-foreground hover:text-gold text-xs md:text-sm transition-colors">
              Privacy
            </a>
            <a href="#" className="text-muted-foreground hover:text-gold text-xs md:text-sm transition-colors">
              Terms
            </a>
            
            {/* Hidden Admin Icon */}
            <Link
              to="/admin"
              className="p-2 text-muted-foreground/30 hover:text-gold transition-colors"
              title="Admin"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
