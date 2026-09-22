import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { adminLoginSchema, validateForm } from '@/lib/validations';

export const ADMIN_EMAIL_DOMAIN = 'haamkay.app';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn, isAdmin, isLoading } = useAdminAuth();

  useEffect(() => {
    if (!isLoading && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isAdmin, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = validateForm(adminLoginSchema, { username, password });
    if (!validation.success) {
      setError((validation as { success: false; error: string }).error);
      return;
    }

    setLoading(true);
    const email = `${username.trim().toLowerCase()}@${ADMIN_EMAIL_DOMAIN}`;
    const { error: authError } = await signIn(email, password);

    if (authError) {
      const message = authError.message.toLowerCase().includes('invalid login')
        ? 'Incorrect username or password.'
        : authError.message;
      setError(message);
      toast.error(message);
    } else {
      toast.success('Welcome back, Admin!');
      navigate('/admin/dashboard');
    }

    setLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="card-luxury p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gold mx-auto flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-teal-darker" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Admin Access</h1>
            <p className="text-muted-foreground text-sm mt-2">Sign in with your admin username</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-lg flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder="Username"
                  required
                  autoCapitalize="none"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg pl-10 pr-12 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-gold mt-6">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Contact the system administrator if you need access.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
