import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ensureAdminAccount } from '@/lib/admin-auth.functions';

export { ADMIN_EMAIL_DOMAIN } from '@/lib/admin-config';

/**
 * Admin authentication.
 *
 * Every admin signs in with a real Supabase session. Uploads to storage and all
 * admin table writes are protected by row-level security that checks
 * `has_role(auth.uid(), 'admin')`, so a browser-only "fake" login cannot upload
 * or save anything.
 *
 * The built-in admin account (username "Eagerbeaver") is created or repaired
 * on the server on first sign-in via `ensureAdminAccount`, then signed in
 * normally.
 */

// Left over from the old browser-only admin login; cleared on load.
const LEGACY_LOCAL_ADMIN_KEY = 'haamkay_admin_local_session';

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

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

const isInvalidCredentials = (message: string) =>
  /invalid login|invalid credentials|email not confirmed/i.test(message);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_LOCAL_ADMIN_KEY);
    } catch {
      // Ignore storage access errors.
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        // Defer the role check to avoid a Supabase auth callback deadlock.
        const userId = nextSession.user.id;
        setTimeout(async () => {
          setIsAdmin(await checkAdminRole(userId));
          setIsLoading(false);
        }, 0);
      } else {
        setIsAdmin(false);
        setIsLoading(false);
      }
    });

    // THEN check for an existing session
    supabase.auth.getSession().then(async ({ data: { session: current } }) => {
      if (current?.user) {
        setSession(current);
        setUser(current.user);
        setIsAdmin(await checkAdminRole(current.user.id));
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const adoptSession = async (nextSession: Session | null, nextUser: User | null) => {
    if (!nextUser) return { error: null };

    const adminStatus = await checkAdminRole(nextUser.id);
    if (!adminStatus) {
      await supabase.auth.signOut();
      return { error: new Error('Access denied. You do not have admin privileges.') };
    }
    setSession(nextSession);
    setUser(nextUser);
    setIsAdmin(true);
    setIsLoading(false);
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Try a normal browser sign-in first (in case a real session already
      // exists for a non-built-in account).
      const result = await supabase.auth.signInWithPassword({ email, password });

      // For the built-in admin the typed password is NOT the account's Supabase
      // password (that is derived on the server), so a direct sign-in fails with
      // invalid credentials. Have the server set up / repair the account, sign
      // in with the derived password, and hand back session tokens which we
      // adopt here via `supabase.auth.setSession(tokens)`.
      if (result.error && isInvalidCredentials(result.error.message)) {
        const setup = await ensureAdminAccount({ data: { email, password } });

        // The server surfaces the failing step + the real Supabase error.
        if (setup.error) return { error: new Error(setup.error) };
        if (!setup.ok || !setup.tokens) return { error: result.error };

        const { data: sessionData, error: sessionError } = await supabase.auth.setSession(
          setup.tokens,
        );
        if (sessionError) return { error: sessionError };

        return adoptSession(sessionData.session, sessionData.user);
      }

      if (result.error) return { error: result.error };

      return adoptSession(result.data.session, result.data.user);
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Sign in failed. Please try again.') };
    }
  };

  const signOut = async () => {
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
