import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type AuthState = {
  userId: string | null;
  email: string | null;
  isLoaded: boolean;
  signedIn: boolean;
  signIn: (emailInput: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (emailInput: string, password: string, metadata?: Record<string, any>) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (emailInput: string) => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mountedRef.current) return;
      setUserId(session?.user?.id ?? null);
      setEmail(session?.user?.email ?? null);
    });

    let timeoutId: ReturnType<typeof setTimeout>;

    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!mountedRef.current) return;

        if (!error && data.session) {
          setUserId(data.session.user.id);
          setEmail(data.session.user.email ?? null);
        }
      } catch {
        // ignore
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    timeoutId = setTimeout(() => {
      if (mountedRef.current) {
        setLoading(false);
      }
    }, 3000);

    init();

    return () => {
      clearTimeout(timeoutId);
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (emailInput: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: emailInput.trim(),
      password,
    });
    if (!error) {
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user?.id ?? null);
      setEmail(data.session?.user?.email ?? null);
    }
    return { error: error ?? null };
  };

  const signUp = async (emailInput: string, password: string, metadata?: Record<string, any>) => {
    const { error } = await supabase.auth.signUp({
      email: emailInput.trim(),
      password,
      options: {
        data: metadata,
      },
    });
    if (!error) {
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user?.id ?? null);
      setEmail(data.session?.user?.email ?? null);
    }
    return { error: error ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setEmail(null);
  };

  const resetPassword = async (emailInput: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(emailInput.trim(), {
      redirectTo: "driverconnect://reset-password",
    });
    return { error: error ?? null };
  };

  const value = useMemo<AuthState>(
    () => ({
      userId,
      email,
      isLoaded: !loading,
      signedIn: !!userId,
      signIn,
      signUp,
      signOut,
      resetPassword,
    }),
    [userId, email, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
