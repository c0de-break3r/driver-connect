import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUserId(session?.user?.id ?? null);
      setEmail(session?.user?.email ?? null);
      setLoading(false);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUserId(session?.user?.id ?? null);
        setEmail(session?.user?.email ?? null);
      });

      return () => subscription.unsubscribe();
    };

    const cleanupPromise = init();
    return () => {
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, []);

  const signIn = async (emailInput: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: emailInput.trim(),
      password,
    });
    if (!error) {
      setUserId((await supabase.auth.getSession()).data.session?.user?.id ?? null);
      setEmail((await supabase.auth.getSession()).data.session?.user?.email ?? null);
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
      const session = (await supabase.auth.getSession()).data.session;
      setUserId(session?.user?.id ?? null);
      setEmail(session?.user?.email ?? null);
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

  return {
    userId,
    email,
    isLoaded: !loading,
    signedIn: !!userId,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
};

export { AuthContext };
