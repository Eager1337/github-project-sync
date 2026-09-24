import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/**
 * Admin account credentials.
 *
 * The login form sends the username as `${username}@${ADMIN_EMAIL_DOMAIN}`.
 * When those exact credentials are entered, the user is signed in directly as
 * the local admin without hitting Supabase. Any other username/password still
 * goes through the normal Supabase auth + user_roles flow.
 */
export const ADMIN_USERNAME = 'Eagerbeaver';
export const ADMIN_PASSWORD = 'Eagerbeaver123';
export const ADMIN_EMAIL_DOMAIN = 'haamkay.app';

const ADMIN_EMAIL = `${ADMIN_USERNAME.toLowerCase()}@${ADMIN_EMAIL_DOMAIN}`;
const LOCAL_ADMIN_STORAGE_KEY = 'haamkay_admin_local_session';
const LOCAL_ADMIN_USER_ID = 'local-admin-eagerbeaver';

const hasLocalAdminSession = (): boolean => {
  try {
    return (
      typeof window !== 'undefined' &&
      window.localStorage.getItem(LOCAL_ADMIN_STORAGE_KEY) !== null
    );
  } catch {
    return false;
  }
};

const startLocalAdminSession = (): void => {
  try {
    window.localStorage.setItem(
      LOCAL_ADMIN_STORAGE_KEY,
      JSON.stringify({ email: ADMIN_EMAIL, createdAt: new Date().toISOString() })
    );
  } catch {
    // Non-fatal: the login still works for the life of the tab.
  }
};

const clearLocalAdminSession = (): void => {
  try {
    window.localStorage.removeItem(LOCAL_ADMIN_STORAGE_KEY);
  } catch {
    // Ignore.
  }
};

const LOCAL_ADMIN_USER: User = {
  id: LOCAL_ADMIN_USER_ID,
  aud: 'authenticated',
  created_at: new Date(0).toISOString(),
  email: ADMIN_EMAIL,
  app_metadata: { provider: 'local-admin', providers: ['local-admin'] },
  user_metadata: { username: ADMIN_USERNAME },
  identities: [],
  is_anonymous: false,
};

const LOCAL_ADMIN_SESSION: Session = {
  access_token: 'local-admin-session-token',
  refresh_token: 'local-admin-refresh-token',
  expires_in: 3600,
  expires_at: 0,
  token_type: 'bearer',
  user: LOCAL_ADMIN_USER,
};

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.error('Error checking admin role:', err);
      return false;
    }
  };

  useEffect(() => {
    // Restore a previously signed-in local admin session (if any).
    if (hasLocalAdminSession()) {
      setSession(LOCAL_ADMIN_SESSION);
      setUser(LOCAL_ADMIN_USER);
      setIsAdmin(true);
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          // A real Supabase session takes precedence over the local admin one.
          setSession(session);
          setUser(session.user);

          // Defer admin role check with setTimeout to avoid deadlock
          setTimeout(async () => {
            const adminStatus = await checkAdminRole(session.user.id);
            setIsAdmin(adminStatus);
            setIsLoading(false);
          }, 0);
        } else if (!hasLocalAdminSession()) {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);

        const adminStatus = await checkAdminRole(session.user.id);
        setIsAdmin(adminStatus);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Local admin account: username "Eagerbeaver" with its password.
    const isLocalAdmin =
      email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;

    if (isLocalAdmin) {
      startLocalAdminSession();
      setUser(LOCAL_ADMIN_USER);
      setSession(LOCAL_ADMIN_SESSION);
      setIsAdmin(true);
      setIsLoading(false);
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        const adminStatus = await checkAdminRole(data.user.id);
        if (!adminStatus) {
          await supabase.auth.signOut();
          return { error: new Error('Access denied. You do not have admin privileges.') };
        }
        setIsAdmin(true);
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    clearLocalAdminSession();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ user, session, isAdmin, isLoading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
