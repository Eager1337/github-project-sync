import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FolderOpen, ShoppingCart, BarChart3, Settings, Users,
  Package, LogOut, TrendingUp, TrendingDown, DollarSign, Eye, Layers
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Categories', path: '/admin/categories', icon: FolderOpen },
  { name: 'Bulk Upload', path: '/admin/bulk-upload', icon: Layers },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    featuredProducts: 0,
    totalStock: 0,
    avgPrice: 0,
    categoryBreakdown: [] as { name: string; count: number }[],
  });

  useEffect(() => {
    if (sessionStorage.getItem('adminAuth') !== 'true') {
      navigate('/admin');
      return;
    }
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    const [{ data: products }, { data: categories }] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('categories').select('name')
    ]);

    if (products && categories) {
      const categoryBreakdown = categories.map(c => ({
        name: c.name,
        count: products.filter(p => p.category === c.name).length
      })).sort((a, b) => b.count - a.count);

      setStats({
        totalProducts: products.length,
        totalCategories: categories.length,
        featuredProducts: products.filter(p => p.featured).length,
        totalStock: products.reduce((sum, p) => sum + p.stock, 0),
        avgPrice: products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0,
        categoryBreakdown
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-serif font-bold text-gold">Haamkay Admin</h1>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-gold/20 text-gold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => { sessionStorage.removeItem('adminAuth'); navigate('/'); }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Store performance insights</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card-luxury p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-gold" />
              <span className="flex items-center gap-1 text-green-500 text-sm">
                <TrendingUp className="w-4 h-4" /> +12%
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.totalProducts}</div>
            <div className="text-muted-foreground">Total Products</div>
          </div>
          <div className="card-luxury p-6">
            <div className="flex items-center justify-between mb-4">
              <FolderOpen className="w-8 h-8 text-gold" />
              <span className="flex items-center gap-1 text-green-500 text-sm">
                <TrendingUp className="w-4 h-4" /> +5%
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.totalCategories}</div>
            <div className="text-muted-foreground">Categories</div>
          </div>
          <div className="card-luxury p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-gold" />
            </div>
            <div className="text-3xl font-bold text-foreground">Le {Math.round(stats.avgPrice).toLocaleString()}</div>
            <div className="text-muted-foreground">Avg. Price</div>
          </div>
          <div className="card-luxury p-6">
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-8 h-8 text-gold" />
              <span className="flex items-center gap-1 text-red-500 text-sm">
                <TrendingDown className="w-4 h-4" /> -3%
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.totalStock}</div>
            <div className="text-muted-foreground">Total Stock</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Category Breakdown */}
          <div className="card-luxury">
            <h2 className="text-xl font-serif font-bold text-foreground mb-6">Products by Category</h2>
            <div className="space-y-4">
              {stats.categoryBreakdown.map((cat, i) => (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">{cat.name}</span>
                    <span className="text-muted-foreground">{cat.count} products</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full transition-all"
                      style={{ width: `${stats.totalProducts > 0 ? (cat.count / stats.totalProducts) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card-luxury">
            <h2 className="text-xl font-serif font-bold text-foreground mb-6">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="text-foreground">Featured Products</span>
                <span className="text-gold font-bold">{stats.featuredProducts}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="text-foreground">Low Stock Items</span>
                <span className="text-destructive font-bold">0</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="text-foreground">Out of Stock</span>
                <span className="text-destructive font-bold">0</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="text-foreground">Avg. Products/Category</span>
                <span className="text-gold font-bold">
                  {stats.totalCategories > 0 ? Math.round(stats.totalProducts / stats.totalCategories) : 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;
