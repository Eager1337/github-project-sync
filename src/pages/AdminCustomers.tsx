import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FolderOpen, ShoppingCart, BarChart3, Settings, Users,
  Package, LogOut, Mail, Phone, MapPin, Layers
} from 'lucide-react';

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

// Mock customers data
const mockCustomers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+232 76 123 456', orders: 5, totalSpent: 850000, joined: '2024-01-01' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+232 76 234 567', orders: 3, totalSpent: 420000, joined: '2024-01-05' },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', phone: '+232 76 345 678', orders: 8, totalSpent: 1250000, joined: '2023-12-15' },
  { id: '4', name: 'Sarah Williams', email: 'sarah@example.com', phone: '+232 76 456 789', orders: 2, totalSpent: 180000, joined: '2024-01-10' },
  { id: '5', name: 'Tom Brown', email: 'tom@example.com', phone: '+232 76 567 890', orders: 4, totalSpent: 560000, joined: '2023-12-20' },
];

const AdminCustomers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [customers] = useState(mockCustomers);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('adminAuth') !== 'true') {
      navigate('/admin');
      return;
    }
  }, [navigate]);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = totalRevenue / customers.reduce((sum, c) => sum + c.orders, 0);

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
          <h1 className="text-3xl font-serif font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage your customer base</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card-luxury p-4">
            <Users className="w-6 h-6 text-gold mb-2" />
            <div className="text-2xl font-bold text-foreground">{customers.length}</div>
            <div className="text-muted-foreground text-sm">Total Customers</div>
          </div>
          <div className="card-luxury p-4">
            <ShoppingCart className="w-6 h-6 text-gold mb-2" />
            <div className="text-2xl font-bold text-foreground">Le {totalRevenue.toLocaleString()}</div>
            <div className="text-muted-foreground text-sm">Total Revenue</div>
          </div>
          <div className="card-luxury p-4">
            <BarChart3 className="w-6 h-6 text-gold mb-2" />
            <div className="text-2xl font-bold text-foreground">Le {Math.round(avgOrderValue).toLocaleString()}</div>
            <div className="text-muted-foreground text-sm">Avg. Order Value</div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full max-w-md bg-muted border border-border rounded-lg px-4 py-2 text-foreground"
          />
        </div>

        {/* Customers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map(customer => (
            <div key={customer.id} className="card-luxury">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                  <span className="text-gold font-bold text-lg">{customer.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{customer.name}</h3>
                  <p className="text-sm text-muted-foreground">Joined {customer.joined}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {customer.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  {customer.phone}
                </div>
              </div>
              <div className="flex justify-between pt-4 border-t border-border">
                <div>
                  <div className="text-lg font-bold text-foreground">{customer.orders}</div>
                  <div className="text-xs text-muted-foreground">Orders</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gold">Le {customer.totalSpent.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total Spent</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-muted-foreground text-sm">
          <p>This is demo data. Connect to a real customer management system for live data.</p>
        </div>
      </main>
    </div>
  );
};

export default AdminCustomers;
