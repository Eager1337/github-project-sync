import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Phone, ShoppingBag, Menu, X, Heart, PackageSearch } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import NotificationBell from '@/components/NotificationBell';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Categories', path: '/categories' },
  { name: 'Daily Drops', path: '/daily-drops' },
  { name: 'Trending', path: '/trending' },
  { name: 'Our Story', path: '/our-story' },
  { name: 'Contact', path: '/contact' },
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const open = isMobileMenuOpen || isSearchOpen;
    document.body.style.overflow = open ? 'hidden' : '';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMobileMenuOpen, isSearchOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setIsSearchOpen(false);
    navigate(q ? `/categories?q=${encodeURIComponent(q)}` : '/categories');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.header initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.6 }} className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-teal-darker py-1.5 md:py-2 text-center">
        <p className="text-xs md:text-sm text-foreground/80 px-4 truncate">📍 53 Malamah Thomas Street, Freetown</p>
      </div>

      <div className="glass-effect border-b border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-14 md:h-20">
            <button
              onClick={() => setIsMobileMenuOpen(value => !value)}
              className="lg:hidden min-w-11 min-h-11 p-2 inline-flex items-center justify-center rounded-lg text-foreground/80 hover:text-gold hover:bg-muted transition-colors"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link to="/" className="flex items-center gap-2 md:gap-3" aria-label="Haamkay Enterprises home">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gold flex items-center justify-center">
                <span className="text-teal-darker font-serif font-bold text-lg md:text-xl">H</span>
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-serif font-bold text-foreground">Haamkay</h1>
                <span className="text-[10px] md:text-xs text-gold tracking-widest uppercase hidden sm:block">Enterprises</span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-8" aria-label="Primary navigation">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={isActive(link.path) ? 'page' : undefined}
                  className={`relative py-2 text-sm font-medium transition-colors ${isActive(link.path) ? 'text-gold' : 'text-foreground/80 hover:text-gold'}`}
                >
                  {link.name}
                  {isActive(link.path) && <motion.div layoutId="navbar-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 md:gap-3">
              <button
                onClick={() => { setIsSearchOpen(value => !value); setIsMobileMenuOpen(false); }}
                className="min-w-11 min-h-11 p-2 inline-flex items-center justify-center rounded-lg text-foreground/80 hover:text-gold hover:bg-muted transition-colors"
                aria-label="Search products"
                aria-expanded={isSearchOpen}
              >
                <Search className="w-5 h-5" />
              </button>
              <NotificationBell />
              <a href="tel:+23276682626" className="hidden md:flex items-center gap-2 px-2 py-2 rounded-lg text-foreground/80 hover:text-gold hover:bg-muted transition-colors">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+232 76 682 626</span>
              </a>
              <Link to="/wishlist" className="min-w-11 min-h-11 p-2 inline-flex items-center justify-center rounded-lg text-foreground/80 hover:text-gold hover:bg-muted transition-colors" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
              </Link>
              <Link to="/my-orders" className="min-w-11 min-h-11 p-2 inline-flex items-center justify-center rounded-lg text-foreground/80 hover:text-gold hover:bg-muted transition-colors" aria-label="My orders">
                <PackageSearch className="w-5 h-5" />
              </Link>
              <Link to="/cart" className={`relative min-w-11 min-h-11 p-2 inline-flex items-center justify-center rounded-lg text-foreground/80 hover:text-gold hover:bg-muted transition-colors ${isActive('/cart') ? 'text-gold' : ''}`} aria-label={`Shopping cart${totalItems ? `, ${totalItems} items` : ''}`}>
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-gold text-teal-darker text-[10px] rounded-full flex items-center justify-center font-bold">{totalItems}</span>}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 top-[5.5rem] bg-black/40 lg:hidden"
            />
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="relative lg:hidden bg-card border-b border-border shadow-xl max-h-[calc(100vh-5.5rem)] overflow-y-auto">
              <nav className="container mx-auto px-4 py-4" aria-label="Mobile navigation">
                <div className="flex flex-col gap-1">
                  {navLinks.map(link => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-current={isActive(link.path) ? 'page' : undefined}
                      className={`min-h-12 flex items-center py-3 px-4 rounded-lg text-base font-medium transition-colors ${isActive(link.path) ? 'bg-gold/20 text-gold' : 'text-foreground/80 hover:bg-muted'}`}
                    >
                      {link.name}
                    </Link>
                  ))}
                  <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className={`min-h-12 flex items-center py-3 px-4 rounded-lg text-base font-medium ${isActive('/wishlist') ? 'bg-gold/20 text-gold' : 'text-foreground/80 hover:bg-muted'}`}>My Wishlist</Link>
                  <Link to="/my-orders" onClick={() => setIsMobileMenuOpen(false)} className={`min-h-12 flex items-center py-3 px-4 rounded-lg text-base font-medium ${isActive('/my-orders') ? 'bg-gold/20 text-gold' : 'text-foreground/80 hover:bg-muted'}`}>My Orders</Link>
                  <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className={`min-h-12 flex items-center justify-between py-3 px-4 rounded-lg text-base font-medium ${isActive('/cart') ? 'bg-gold/20 text-gold' : 'text-foreground/80 hover:bg-muted'}`}>
                    <span>My Cart</span>
                    {totalItems > 0 && <span className="px-2 py-0.5 bg-gold text-teal-darker text-xs rounded-full">{totalItems}</span>}
                  </Link>
                </div>
                <a href="tel:+23276682626" className="min-h-12 flex items-center gap-3 mt-4 pt-4 border-t border-border text-gold">
                  <Phone className="w-5 h-5" />
                  <span className="font-medium">+232 76 682 626</span>
                </a>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-full left-0 right-0 bg-card border-b border-border p-4 shadow-lg">
            <form className="container mx-auto" onSubmit={submitSearch} role="search">
              <label htmlFor="site-product-search" className="sr-only">Search products</label>
              <input id="site-product-search" type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search for products..." className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold" autoFocus />
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
