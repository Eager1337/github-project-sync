import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, ShoppingCart, BarChart3, Settings, Users,
  Package, LogOut, Layers, Sparkles, Bell, Images, CalendarClock, Boxes, Menu, X,
  Inbox, FileSpreadsheet, History, Music2, ExternalLink, MessageSquareQuote,
  ZoomIn, Copy, Wand2, AlarmClock, UserSquare2
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const navGroups = [
  {
    label: 'Catalog',
    items: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Products', path: '/admin/products', icon: Package },
      { name: 'Categories', path: '/admin/categories', icon: FolderOpen },
      { name: 'Inventory', path: '/admin/inventory', icon: Boxes },
      { name: 'Price History', path: '/admin/price-history', icon: History },
      { name: 'Duplicate Products', path: '/admin/duplicate-products', icon: Copy },
    ],
  },
  {
    label: 'Content',
    items: [
      { name: 'AI Listing', path: '/admin/ai-listing', icon: Sparkles },
      { name: 'AI Approval Queue', path: '/admin/ai-queue', icon: Inbox },
      { name: 'Bulk Upload', path: '/admin/bulk-upload', icon: Layers },
      { name: 'CSV Import', path: '/admin/csv-import', icon: FileSpreadsheet },
      { name: 'Media Library', path: '/admin/media', icon: Images },
      { name: 'Image Upscaler', path: '/admin/image-upscaler', icon: ZoomIn },
      { name: 'AI Image Studio', path: '/admin/image-studio', icon: Wand2 },
      { name: 'TikTok', path: '/admin/tiktok', icon: Music2 },
      { name: 'Drops & Prices', path: '/admin/schedule', icon: CalendarClock },
      { name: 'Site Content', path: '/admin/site-content', icon: MessageSquareQuote },
      { name: 'Team & About', path: '/admin/team', icon: UserSquare2 },
    ],
  },
  {
    label: 'Engage',
    items: [
      { name: 'Notifications', path: '/admin/notifications', icon: Bell },
      { name: 'Scheduled Alerts', path: '/admin/scheduled-alerts', icon: AlarmClock },
      { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
      { name: 'Customers', path: '/admin/customers', icon: Users },
      { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
      { name: 'Settings', path: '/admin/settings', icon: Settings },
    ],
  },
];


interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const AdminLayout = ({ children, title, subtitle, actions }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isLoading, signOut } = useAdminAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, isLoading, navigate]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gold">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const sidebar = (
    <div className="h-full flex flex-col p-5">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-serif font-bold text-gold">Haamkay Admin</h1>
        <button className="lg:hidden text-muted-foreground" onClick={() => setMenuOpen(false)} aria-label="Close menu">
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">{group.label}</p>
            <div className="space-y-1">
              {group.items.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    location.pathname === item.path
                      ? 'bg-gold/20 text-gold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <Link
        to="/"
        className="mt-4 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gold border border-gold/40 hover:bg-gold/10 transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        View site
      </Link>
      <button
        onClick={handleLogout}
        className="mt-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 bg-card border-r border-border h-screen sticky top-0">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] bg-card border-r border-border h-full">{sidebar}</aside>
        </div>
      )}

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <div className="flex items-start justify-between gap-3 mb-6 lg:mb-8">
          <div className="flex items-start gap-3 min-w-0">
            <button
              className="lg:hidden p-2 -ml-2 text-foreground"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-foreground truncate">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex flex-wrap gap-2 sm:gap-3 justify-end">{actions}</div>}
        </div>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
