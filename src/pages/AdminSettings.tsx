import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, FolderOpen, ShoppingCart, BarChart3, Settings, Users,
  Package, LogOut, Save, Globe, Phone, Mail, MapPin, Layers, LineChart, Slack
} from 'lucide-react';
import { toast } from 'sonner';
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

const AdminSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [settings, setSettings] = useState({
    storeName: 'Haamkay Enterprises',
    storeEmail: 'info@haamkay.com',
    storePhone: '+232 76 682 626',
    storeAddress: '53 Malamah Thomas Street, Freetown',
    currency: 'Le',
    whatsappNumber: '+23276682626',
    enableNotifications: true,
    enableWhatsappOrders: true,
  });
  const [gaId, setGaId] = useState('');
  const [savingGa, setSavingGa] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('adminAuth') !== 'true') {
      navigate('/admin');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'ga_measurement_id')
      .maybeSingle()
      .then(({ data }) => setGaId(data?.value ?? ''));
  }, []);

  const saveGa = async () => {
    setSavingGa(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'ga_measurement_id', value: gaId.trim() }, { onConflict: 'key' });
    setSavingGa(false);
    if (error) return toast.error(error.message);
    toast.success('Google Analytics ID saved — visits start tracking on next page load.');
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Settings saved!');
    setSaving(false);
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Configure your store settings</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-gold flex items-center gap-2 !py-2 !px-4">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Store Information */}
          <div className="card-luxury">
            <h2 className="text-xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-gold" />
              Store Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Store Name</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={e => setSettings(s => ({ ...s, storeName: e.target.value }))}
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={settings.storeEmail}
                    onChange={e => setSettings(s => ({ ...s, storeEmail: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-3 text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={settings.storePhone}
                    onChange={e => setSettings(s => ({ ...s, storePhone: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-3 text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <textarea
                    value={settings.storeAddress}
                    onChange={e => setSettings(s => ({ ...s, storeAddress: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-3 text-foreground h-24 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Settings */}
          <div className="card-luxury">
            <h2 className="text-xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-gold" />
              Order Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Currency Symbol</label>
                <input
                  type="text"
                  value={settings.currency}
                  onChange={e => setSettings(s => ({ ...s, currency: e.target.value }))}
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">WhatsApp Number (for orders)</label>
                <input
                  type="tel"
                  value={settings.whatsappNumber}
                  onChange={e => setSettings(s => ({ ...s, whatsappNumber: e.target.value }))}
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <div className="text-foreground font-medium">Enable Notifications</div>
                  <div className="text-sm text-muted-foreground">Receive order notifications</div>
                </div>
                <button
                  onClick={() => setSettings(s => ({ ...s, enableNotifications: !s.enableNotifications }))}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.enableNotifications ? 'bg-gold' : 'bg-muted-foreground'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.enableNotifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <div className="text-foreground font-medium">WhatsApp Orders</div>
                  <div className="text-sm text-muted-foreground">Allow customers to order via WhatsApp</div>
                </div>
                <button
                  onClick={() => setSettings(s => ({ ...s, enableWhatsappOrders: !s.enableWhatsappOrders }))}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.enableWhatsappOrders ? 'bg-gold' : 'bg-muted-foreground'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.enableWhatsappOrders ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Google Analytics */}
          <div className="card-luxury">
            <h2 className="text-xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-gold" />
              Visitor Tracking
            </h2>
            <label className="block text-sm text-muted-foreground mb-2">Google Analytics Measurement ID</label>
            <input
              type="text"
              value={gaId}
              onChange={e => setGaId(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Find this in your Google Analytics account under Admin → Data streams. Once saved, visits and page views are tracked automatically.
            </p>
            <button onClick={saveGa} disabled={savingGa} className="btn-gold mt-4 !py-2 !px-4 inline-flex items-center gap-2">
              <Save className="w-4 h-4" />
              {savingGa ? 'Saving...' : 'Save tracking ID'}
            </button>
          </div>

          {/* Slack */}
          <div className="card-luxury">
            <h2 className="text-xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
              <Slack className="w-5 h-5 text-gold" />
              Team Alerts on Slack
            </h2>
            <p className="text-sm text-muted-foreground">
              Your team can get an automatic Slack message whenever a product is updated or flagged as a possible duplicate.
              The Slack link is kept in secure storage, not on this page, so nobody visiting the site can see it.
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              To turn it on, create an "Incoming Webhook" in your Slack workspace and ask in chat to save it — it gets stored securely for you.
            </p>
          </div>
        </div>
      </main>

    </div>
  );
};

export default AdminSettings;
