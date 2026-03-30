import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'super_admin' | 'admin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** True once user, role, isClient, isPortalUser are all resolved */
  identityReady: boolean;
  /** True when user arrived via a password recovery link */
  isRecovery: boolean;
  role: AppRole | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isClient: boolean;
  isPortalUser: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserRole(userId: string) {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  return (data?.role as AppRole) ?? null;
}

async function checkIfClient(userId: string) {
  const { data } = await supabase
    .from('client_users')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  return !!data;
}

async function checkIfPortalUser(userId: string) {
  const { data } = await supabase
    .from('portal_users')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  return !!data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [identityReady, setIdentityReady] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isClientUser, setIsClientUser] = useState(false);
  const [isPortalUserState, setIsPortalUserState] = useState(false);

  /** Resolve all three identity checks in parallel, then mark ready */
  const resolveIdentity = async (userId: string) => {
    setIdentityReady(false);
    const [userRole, clientStatus, portalStatus] = await Promise.all([
      fetchUserRole(userId),
      checkIfClient(userId),
      checkIfPortalUser(userId),
    ]);
    setRole(userRole);
    setIsClientUser(clientStatus);
    setIsPortalUserState(portalStatus);
    setIdentityReady(true);
  };

  const clearIdentity = () => {
    setRole(null);
    setIsClientUser(false);
    setIsPortalUserState(false);
    setIdentityReady(true); // ready = yes, we know they have no identity
  };

  const refreshRole = async () => {
    if (user) await resolveIdentity(user.id);
  };

  useEffect(() => {
    // Listen for auth state changes FIRST (before getSession)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Detect password recovery flow
        if (event === 'PASSWORD_RECOVERY') {
          setIsRecovery(true);
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          // Defer to avoid Supabase deadlock inside the callback
          setTimeout(() => resolveIdentity(session.user.id), 0);
        } else {
          clearIdentity();
        }
      }
    );

    // Then hydrate from existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        resolveIdentity(session.user.id);
      } else {
        clearIdentity();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl, data: { full_name: fullName } },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearIdentity();
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    identityReady,
    isRecovery,
    role,
    isSuperAdmin: role === 'super_admin',
    isAdmin: role === 'super_admin' || role === 'admin',
    isClient: isClientUser,
    isPortalUser: isPortalUserState,
    signIn,
    signUp,
    signOut,
    refreshRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
